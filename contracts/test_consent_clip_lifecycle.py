"""Direct state-transition tests for the ConsentClip Intelligent Contract."""
import importlib.util
import hashlib
import json
import sys
import types
import unittest
from pathlib import Path

TRANSFERS = []
HASH = hashlib.sha256(b"fixture").hexdigest()

class _Decorator:
    def __call__(self, value): return value
    @property
    def payable(self): return self

class _Address(str): pass

class _Recipient:
    def __init__(self, address): self.address = str(address)
    def emit_transfer(self, value, on):
        if on != "finalized": raise AssertionError("Payouts must wait for finality")
        TRANSFERS.append((self.address, int(value)))

class _TreeMap(dict): pass

def load_contract():
    web = types.SimpleNamespace(content={}, fail=set())
    def render(url, mode):
        if url in web.fail: raise RuntimeError("fixture unavailable")
        value = web.content.get(url, b"fixture")
        return value if mode == "screenshot" else value.decode("utf-8")
    web.render = render
    web.get = lambda url: types.SimpleNamespace(body=render(url, "screenshot"))
    gl = types.SimpleNamespace(
        Contract=object, public=types.SimpleNamespace(write=_Decorator(), view=_Decorator()),
        evm=types.SimpleNamespace(contract_interface=lambda _: _Recipient),
        vm=types.SimpleNamespace(UserError=ValueError),
        message=types.SimpleNamespace(sender_address=types.SimpleNamespace(as_hex=""), value=0), message_raw={},
        nondet=types.SimpleNamespace(web=web, exec_prompt=lambda *_, **__: '{"verdict_class":"within_scope","confidence":90,"reasoning":"fixture"}'),
        eq_principle=types.SimpleNamespace(strict_eq=lambda fn: fn(), prompt_comparative=lambda fn, *_: fn()),
    )
    module = types.ModuleType("genlayer")
    module.gl, module.TreeMap, module.u256, module.Address = gl, _TreeMap, int, _Address
    sys.modules["genlayer"] = module
    spec = importlib.util.spec_from_file_location("consent_clip_under_test", Path(__file__).with_name("consent_clip.py"))
    loaded = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(loaded)
    return loaded, gl

class ConsentClipLifecycleTests(unittest.TestCase):
    creator = "0x1111111111111111111111111111111111111111"
    publisher = "0x2222222222222222222222222222222222222222"

    def setUp(self):
        TRANSFERS.clear()
        self.module, self.gl = load_contract()
        self.contract = self.module.ConsentClip()
        self.gl.message_raw["datetime"] = "2026-01-10T12:00:00Z"

    def sender(self, value): self.gl.message.sender_address.as_hex = value

    def create(self, deposit=100):
        self.sender(self.creator)
        self.gl.message.value = 0
        release_id = self.contract.create_release("Creator testimonial", "video", self.publisher, "https://example.com/source",
            HASH, "Publisher may use this testimonial only in the specified campaign.", "2026-01-20", "2026-02-01")
        self.sender(self.publisher)
        self.gl.message.value = deposit
        self.contract.accept_release(release_id)
        return release_id

    def ready_for_review(self):
        release_id = self.create()
        self.sender(self.creator)
        self.contract.submit_terms_evidence(release_id, "https://example.com/terms", HASH, "Approved campaign terms")
        self.sender(self.publisher)
        self.contract.submit_usage_evidence(release_id, "https://example.com/live-use", HASH, "Published campaign use")
        return release_id

    def close_challenge(self):
        self.gl.message_raw["datetime"] = "2026-01-20T00:00:00Z"

    def release(self, release_id):
        return json.loads(self.contract.get_release(release_id))

    def test_complete_release_cycle_uses_every_public_path(self):
        release_id = self.ready_for_review()
        self.close_challenge()
        self.contract._review_consent = lambda *_: json.dumps({"verdict_class": "within_scope", "confidence": 91, "reasoning": "Use matches terms."})
        self.contract.request_consent_review(release_id)
        release = self.release(release_id)
        self.assertEqual(release["status"], "released")
        self.assertEqual(release["verdict_class"], "within_scope")
        self.assertEqual(release["paid_to_publisher"], "100")
        self.assertEqual(TRANSFERS, [(self.publisher, 100)])
        evidence = json.loads(self.contract.get_evidence(release_id))
        self.assertEqual([record["kind"] for record in evidence], ["terms", "usage"])
        self.assertEqual(json.loads(self.contract.get_releases(10))[0]["id"], release_id)

    def test_each_consent_verdict_pays_the_defined_allocation(self):
        expected = {
            "within_scope": [(self.publisher, 100)],
            "minor_overreach": [(self.publisher, 80), (self.creator, 20)],
            "material_breach": [(self.creator, 100)],
        }
        for verdict, transfers in expected.items():
            with self.subTest(verdict=verdict):
                TRANSFERS.clear()
                self.gl.message_raw["datetime"] = "2026-01-10T12:00:00Z"
                release_id = self.ready_for_review()
                self.close_challenge()
                self.contract._review_consent = lambda *_: json.dumps({"verdict_class": verdict, "confidence": 90, "reasoning": "test"})
                self.contract.request_consent_review(release_id)
                self.assertEqual(TRANSFERS, transfers)

    def test_creator_can_recover_an_unaccepted_release(self):
        self.sender(self.creator)
        self.gl.message.value = 0
        release_id = self.contract.create_release("Creator testimonial", "video", self.publisher, "https://example.com/source",
            HASH, "Publisher may use this testimonial only in the specified campaign.", "2026-01-20", "2026-02-01")
        self.contract.recover_unaccepted(release_id)
        self.assertEqual(TRANSFERS, [])
        self.assertEqual(self.release(release_id)["status"], "recovered_unaccepted")

    def test_counter_evidence_is_immutable_and_included(self):
        release_id = self.ready_for_review()
        self.sender(self.creator)
        self.contract.submit_counter_evidence(release_id, "https://example.com/counter", HASH, "Creator supplied counter-evidence")
        kinds = [record["kind"] for record in json.loads(self.contract.get_evidence(release_id))]
        self.assertEqual(kinds, ["terms", "usage", "counter"])

    def test_either_party_can_recover_an_undetermined_release(self):
        release_id = self.ready_for_review()
        self.close_challenge()
        self.contract._review_consent = lambda *_: '{"verdict_class":"undetermined","confidence":0,"reasoning":"unclear"}'
        self.contract.request_consent_review(release_id)
        self.sender(self.creator)
        self.contract.recover_undetermined(release_id)
        self.assertEqual(TRANSFERS, [(self.publisher, 100)])
        self.assertEqual(self.release(release_id)["status"], "recovered_undetermined")

    def test_evidence_order_and_challenge_window_are_enforced(self):
        release_id = self.create()
        self.sender(self.publisher)
        with self.assertRaisesRegex(ValueError, "EXPECTED_TERMS_EVIDENCE_FIRST"):
            self.contract.submit_usage_evidence(release_id, "https://example.com/live-use", HASH, "Published")
        self.sender(self.creator)
        self.contract.submit_terms_evidence(release_id, "https://example.com/terms", HASH, "Terms")
        self.sender(self.publisher)
        self.contract.submit_usage_evidence(release_id, "https://example.com/live-use", HASH, "Published")
        self.gl.message_raw["datetime"] = "2026-01-20T00:00:00Z"
        with self.assertRaisesRegex(ValueError, "EXPECTED_EVIDENCE_WINDOW_CLOSED"):
            self.contract.submit_counter_evidence(release_id, "https://example.com/counter", HASH, "Late")

    def test_source_render_failure_becomes_recoverable_undetermined(self):
        release_id = self.ready_for_review()
        self.close_challenge()
        self.contract._review_consent = lambda *_: '{"verdict_class":"undetermined","confidence":0,"reasoning":"EXTERNAL: source render failed."}'
        self.sender(self.creator)
        self.contract.request_consent_review(release_id)
        self.sender(self.publisher)
        self.contract.recover_undetermined(release_id)
        self.assertEqual(TRANSFERS, [(self.publisher, 100)])

    def test_publisher_can_recover_after_expiry(self):
        release_id = self.ready_for_review()
        self.gl.message_raw["datetime"] = "2026-02-01T00:00:00Z"
        self.sender(self.publisher)
        self.contract.recover_expired(release_id)
        self.assertEqual(self.release(release_id)["status"], "recovered_expired")
        self.assertEqual(TRANSFERS, [(self.publisher, 100)])

    def test_source_hash_mismatch_is_rejected(self):
        self.sender(self.creator)
        with self.assertRaisesRegex(ValueError, "EXPECTED_EVIDENCE_INTEGRITY_MISMATCH"):
            self.contract.create_release("Creator testimonial", "video", self.publisher, "https://example.com/source",
                "b" * 64, "Publisher may use this testimonial only in the specified campaign.", "2026-01-20", "2026-02-01")

    def test_terms_usage_and_counter_hash_mismatches_are_rejected(self):
        release_id = self.create()
        self.sender(self.creator)
        with self.assertRaisesRegex(ValueError, "EXPECTED_EVIDENCE_INTEGRITY_MISMATCH"):
            self.contract.submit_terms_evidence(release_id, "https://example.com/terms", "b" * 64, "Terms")
        self.contract.submit_terms_evidence(release_id, "https://example.com/terms", HASH, "Terms")
        self.sender(self.publisher)
        with self.assertRaisesRegex(ValueError, "EXPECTED_EVIDENCE_INTEGRITY_MISMATCH"):
            self.contract.submit_usage_evidence(release_id, "https://example.com/live-use", "b" * 64, "Use")
        self.contract.submit_usage_evidence(release_id, "https://example.com/live-use", HASH, "Use")
        self.sender(self.creator)
        with self.assertRaisesRegex(ValueError, "EXPECTED_EVIDENCE_INTEGRITY_MISMATCH"):
            self.contract.submit_counter_evidence(release_id, "https://example.com/counter", "b" * 64, "Counter")

    def test_correct_hash_is_accepted_and_recorded_as_verified(self):
        release_id = self.ready_for_review()
        release = self.release(release_id)
        evidence = json.loads(self.contract.get_evidence(release_id))
        self.assertEqual(release["source_verified_sha256"], HASH)
        self.assertEqual(release["source_integrity_status"], "verified")
        self.assertEqual([item["integrity_status"] for item in evidence], ["verified", "verified"])
        self.assertEqual([item["verified_sha256"] for item in evidence], [HASH, HASH])

    def test_changed_source_or_evidence_cannot_reach_semantic_judgment(self):
        for url in ("https://example.com/source", "https://example.com/terms", "https://example.com/live-use", "https://example.com/counter"):
            with self.subTest(url=url):
                TRANSFERS.clear()
                self.gl.message_raw["datetime"] = "2026-01-10T12:00:00Z"
                release_id = self.ready_for_review()
                if url.endswith("counter"):
                    self.sender(self.creator)
                    self.contract.submit_counter_evidence(release_id, url, HASH, "Counter")
                self.gl.nondet.web.content[url] = b"mutated-content"
                self.close_challenge()
                self.sender(self.creator)
                self.contract.request_consent_review(release_id)
                release = self.release(release_id)
                self.assertEqual(release["status"], "undetermined")
                self.assertIn("INTEGRITY_MISMATCH", release["reasoning"])
                self.assertEqual(TRANSFERS, [])
                self.gl.nondet.web.content.pop(url, None)

    def test_unchanged_verified_evidence_reaches_semantic_review(self):
        release_id = self.ready_for_review()
        self.close_challenge()
        self.sender(self.creator)
        self.contract.request_consent_review(release_id)
        self.assertEqual(self.release(release_id)["status"], "released")

    def test_integrity_mismatch_uses_undetermined_recovery_path(self):
        release_id = self.ready_for_review()
        self.gl.nondet.web.content["https://example.com/live-use"] = b"mutated-content"
        self.close_challenge()
        self.sender(self.creator)
        self.contract.request_consent_review(release_id)
        self.sender(self.publisher)
        self.contract.recover_undetermined(release_id)
        self.assertEqual(TRANSFERS, [(self.publisher, 100)])

if __name__ == "__main__": unittest.main()
