# ConsentClip

**Deposit-backed creator consent releases with GenLayer adjudication.**

ConsentClip lets a creator and publisher record the terms for use of a testimonial, UGC clip, or campaign asset. The publisher’s GEN deposit stays in the Intelligent Contract until the creator releases it or GenLayer validators evaluate submitted public evidence and settle a disputed use.

## Why GenLayer

A URL check cannot decide whether a live campaign use stays within natural-language consent terms. ConsentClip uses GenLayer’s comparative equivalence principle for that subjective step: independent validators fetch the submitted evidence, assess whether the use is within scope, and agree on the outcome before funds move.

Everything else—roles, deposits, evidence indexing, settlement arithmetic, and recovery paths—is deterministic and on-chain.

## Live StudioNet contract

- Contract: [`0x9cF0a1640C85C0B68004cC20cEa8a283cFa69101`](https://explorer-studio.genlayer.com/address/0x9cF0a1640C85C0B68004cC20cEa8a283cFa69101)
- Deployment tx: `0x58e5de6c04e75551c0a268f0d9881e75b4e796a23956c1b30add6a7346ed10e3`

## Release workflow

1. Creator calls `create_release` with a GEN deposit and publisher address.
2. Publisher calls `accept_release`.
3. Creator submits public terms evidence.
4. Publisher submits public live-use evidence.
5. Either party can call `request_consent_review`; validators fetch evidence and settle the decision.

| Consent decision | Settlement |
| --- | --- |
| `within_scope` | 100% to publisher |
| `minor_overreach` | 80% to publisher, 20% to creator |
| `material_breach` | 100% to creator |
| `undetermined` | Either party can recover the deposit to the publisher |

All payouts are emitted only after transaction finality. An unaccepted release can be recovered by the creator, so no GEN is stranded.

## Contract API

```text
create_release(title, media_type, publisher, consent_terms, expires_at) payable
accept_release(release_id)
submit_terms_evidence(release_id, url, note)
submit_usage_evidence(release_id, url, note)
release_deposit(release_id)
request_consent_review(release_id)
recover_unaccepted(release_id)
recover_undetermined(release_id)
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

`npm run verify:live-cycle` performs the complete payable release cycle with a funded StudioNet test wallet. Set `CONSENTCLIP_CYCLE_PRIVATE_KEY` only in your local shell—never in a committed file.

## StudioNet request limits

The client serializes reads, spaces them by four seconds, caches them for 20 seconds, and deduplicates identical in-flight requests. Reads pause while a write awaits consensus; receipt polling runs every 12 seconds. This keeps a normal session under StudioNet’s 30 requests/minute limit.
