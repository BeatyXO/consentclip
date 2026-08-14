# ConsentClip

**Deposit-backed creator consent releases with GenLayer adjudication.**

ConsentClip lets a creator and publisher record the terms for use of a testimonial, UGC clip, or campaign asset. The publisher’s GEN deposit stays in the Intelligent Contract until the creator releases it or GenLayer validators evaluate submitted public evidence and settle a disputed use.

## Why GenLayer

A URL check cannot decide whether a live campaign use stays within natural-language consent terms. ConsentClip uses GenLayer’s comparative equivalence principle for that subjective step: independent validators fetch the submitted evidence, assess whether the use is within scope, and agree on the outcome before funds move.

Everything else—roles, deposits, evidence indexing, settlement arithmetic, and recovery paths—is deterministic and on-chain.

## Live StudioNet contract

- Contract: [`0x1A3926f04E74f6B22d9145FADCEa0fa449D4cf19`](https://genlayer-explorer.vercel.app/address/0x1A3926f04E74f6B22d9145FADCEa0fa449D4cf19)
- Deployment transaction: [`0x4a364122e926c84c59087ed9e42aa7b8c129c896a8f629585a4ca429daf75d03`](https://genlayer-explorer.vercel.app/tx/0x4a364122e926c84c59087ed9e42aa7b8c129c896a8f629585a4ca429daf75d03)

## Release workflow

1. Creator calls `create_release` with a public source URL, its SHA-256 attestation, publisher address, challenge-close date, and expiry date.
2. Publisher calls payable `accept_release` and locks the GEN collateral.
3. Creator submits public terms evidence.
4. Publisher submits public live-use evidence.
5. Both parties may submit immutable public counter-evidence through the recorded challenge-close date. Review opens after that fair window closes; validators visually compare the source and live use, fetch all evidence, and settle the decision.

| Consent decision | Settlement |
| --- | --- |
| `within_scope` | 100% to publisher |
| `minor_overreach` | 80% to publisher, 20% to creator |
| `material_breach` | 100% to creator |
| `undetermined` | Either party can recover the deposit to the publisher |

All URLs and their SHA-256 attestations are retained on-chain in submission order. Render failures resolve to `undetermined`, allowing either party to return the collateral to the publisher. After expiry, the publisher can recover any unsettled collateral. All payouts are emitted only after transaction finality.

## Contract API

```text
create_release(title, media_type, publisher, source_url, source_sha256, consent_terms, challenge_ends_at, expires_at)
accept_release(release_id) payable
submit_terms_evidence(release_id, url, sha256, note)
submit_usage_evidence(release_id, url, sha256, note)
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
