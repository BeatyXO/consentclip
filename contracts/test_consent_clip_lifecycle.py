"""Direct state-transition tests for the ConsentClip Intelligent Contract."""
import importlib.util
import json
import sys
import types
import unittest
from pathlib import Path

TRANSFERS = []

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
    gl = types.SimpleNamespace(
        Contract=object, public=types.SimpleNamespace(write=_Decorator(), view=_Decorator()),
        evm=types.SimpleNamespace(contract_interface=lambda _: _Recipient),
        vm=types.SimpleNamespace(UserError=ValueError),
        message=types.SimpleNamespace(sender_address=types.SimpleNamespace(as_hex=""), value=0), message_raw={},
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

    def sender(self, value): self.gl.message.sender_address.as_hex = value

    def create(self, deposit=100):
        self.sender(self.creator)
        self.gl.message.value = deposit
        return self.contract.create_release("Creator testimonial", "video", self.publisher,
            "Publisher may use this testimonial only in the specified campaign.", "2026-12-31")

    def ready_for_review(self):
        release_id = self.create()
        self.sender(self.publisher)
        self.contract.accept_release(release_id)
        self.sender(self.creator)
        self.contract.submit_terms_evidence(release_id, "https://example.com/terms", "Approved campaign terms")
        self.sender(self.publisher)
        self.contract.submit_usage_evidence(release_id, "https://example.com/live-use", "Published campaign use")
        return release_id

    def release(self, release_id):
        return json.loads(self.contract.get_release(release_id))

    def test_complete_release_cycle_uses_every_public_path(self):
        release_id = self.ready_for_review()
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
                release_id = self.ready_for_review()
                self.contract._review_consent = lambda *_: json.dumps({"verdict_class": verdict, "confidence": 90, "reasoning": "test"})
                self.contract.request_consent_review(release_id)
                self.assertEqual(TRANSFERS, transfers)

    def test_creator_can_recover_an_unaccepted_release(self):
        release_id = self.create()
        self.contract.recover_unaccepted(release_id)
        self.assertEqual(TRANSFERS, [(self.creator, 100)])
        self.assertEqual(self.release(release_id)["status"], "recovered_unaccepted")

    def test_either_party_can_recover_an_undetermined_release(self):
        release_id = self.ready_for_review()
        self.contract._review_consent = lambda *_: '{"verdict_class":"undetermined","confidence":0,"reasoning":"unclear"}'
        self.contract.request_consent_review(release_id)
        self.sender(self.creator)
        self.contract.recover_undetermined(release_id)
        self.assertEqual(TRANSFERS, [(self.publisher, 100)])
        self.assertEqual(self.release(release_id)["status"], "recovered_undetermined")

if __name__ == "__main__": unittest.main()
