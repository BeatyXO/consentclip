# ConsentClip

**Deposit-backed creator consent releases with GenLayer adjudication.**

ConsentClip lets a creator and publisher record the terms for use of a testimonial, UGC clip, or campaign asset. The publisher’s GEN deposit stays in the Intelligent Contract until the creator releases it or GenLayer validators evaluate submitted public evidence and settle a disputed use.

## Why GenLayer

A URL check cannot decide whether a live campaign use stays within natural-language consent terms. ConsentClip uses GenLayer’s comparative equivalence principle for that subjective step: independent validators fetch the submitted evidence, assess whether the use is within scope, and agree on the outcome before funds move.

Everything else—roles, deposits, evidence indexing, settlement arithmetic, and recovery paths—is deterministic and on-chain.

## Evidence preservation

The SHA-256 supplied by a caller is only a claim. At submission, GenLayer validators capture the canonical adjudication representation and the write is rejected unless the validator-derived digest matches the claim. Source and usage commitments cover the exact raw media response bytes passed to vision adjudication; terms and counter-evidence commitments cover the exact UTF-8 rendered text passed to the prompt. The contract records the verified digest, capture mode, and integrity status.

Before adjudication, validators capture every external item again in the same mode and compare it to that verified commitment. A changed, missing, or non-reproducible URL is excluded from the semantic judge and produces an `undetermined` integrity-safe result. A URL is never assumed immutable.

Review evidence is bounded by protected slots, not by global insertion order: creator terms evidence max 1, publisher primary usage visual max 1, creator disputed usage visual max 1, creator counter evidence max 2, and publisher counter evidence max 2. Excess submissions are rejected with `EXPECTED_EVIDENCE_QUOTA_EXCEEDED`, so neither party can fill the other party's review slots or crowd out the primary disputed visual.

## Live StudioNet contract

- Contract: [`0x1bB56165db95111aBB409a920e6c44b64b398588`](https://genlayer-explorer.vercel.app/address/0x1bB56165db95111aBB409a920e6c44b64b398588)
- Deployment transaction: [`0x7c34d5c64b018bc9b714b32a8f64e4553462d26ce037634ca6f8a77211e25c84`](https://genlayer-explorer.vercel.app/tx/0x7c34d5c64b018bc9b714b32a8f64e4553462d26ce037634ca6f8a77211e25c84)
- Deployed source commit: `0555de6a8308f43f15c0f524288f490c2e0bd95a`
- Source/deployment parity: `contracts/consent_clip.py` at the final repository commit is unchanged from the deployed source commit above.

## Release workflow

1. Creator calls `create_release` with a public source URL, a claimed SHA-256, publisher address, challenge-close date, and expiry date; validators independently verify the claim before storing the release.
2. Publisher calls payable `accept_release` and locks the GEN collateral.
3. Creator submits public terms evidence.
4. Publisher may submit public claimed live-use evidence through `submit_usage_evidence`.
5. If the publisher is silent or the creator disputes a different live use, the creator may submit a public disputed live-use visual through `submit_disputed_usage_evidence`; this moves the release to `disputed` and makes it reviewable after the challenge window closes.
6. Both parties may submit immutable public counter-evidence through the recorded challenge-close date once a primary visual exists. Review opens after that fair window closes; validators visually compare the source, creator disputed usage when present, publisher usage when present, terms, and bounded counter-evidence, then settle the decision.

| Consent decision | Settlement |
| --- | --- |
| `within_scope` | 100% to publisher |
| `minor_overreach` | 80% to publisher, 20% to creator |
| `material_breach` | 100% to creator |
| `undetermined` | Either party can recover the deposit to the publisher |

All accepted URLs and validator-verified commitments are retained on-chain, while review selection uses the protected deterministic slots above. Render failures or commitment mismatches resolve to `undetermined`, allowing either party to return the collateral to the publisher. After expiry, the publisher can recover any unsettled collateral from `active`, `usage_submitted`, or `disputed`. All payouts are emitted only after transaction finality.

## Contract API

```text
create_release(title, media_type, publisher, source_url, source_sha256, consent_terms, challenge_ends_at, expires_at)
accept_release(release_id) payable
submit_terms_evidence(release_id, url, sha256, note)
submit_usage_evidence(release_id, url, sha256, note)
submit_disputed_usage_evidence(release_id, url, sha256, note)
submit_counter_evidence(release_id, url, sha256, note)
release_deposit(release_id)
request_consent_review(release_id)
recover_unaccepted(release_id)
recover_undetermined(release_id)
recover_expired(release_id)
get_release(release_id)
get_releases(limit)
get_evidence(release_id)
```

## Local setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Run the checks:

```bash
genvm-lint check contracts/consent_clip.py --json
python -m unittest contracts.test_consent_clip_lifecycle -v
npm run typecheck
npm run lint
npm run build
npm run verify:schema
```

`npm run verify:live-cycle` exercises the available lifecycle paths using two funded StudioNet test wallets. Set `CONSENTCLIP_CREATOR_PRIVATE_KEY` and `CONSENTCLIP_PUBLISHER_PRIVATE_KEY` only in your local shell—never in a committed file. The visual review is consensus-dependent; `recover_undetermined` is covered by direct lifecycle tests because it requires a real `undetermined` verdict.

## StudioNet request limits

The client serializes reads, spaces them by four seconds, caches them for 20 seconds, and deduplicates identical in-flight requests. Reads pause while a write awaits consensus; receipt polling runs every 12 seconds. This keeps a normal session under StudioNet’s 30 requests/minute limit.
