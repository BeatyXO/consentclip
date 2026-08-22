# ConsentClip Test Results

## Automated Lifecycle Tests

Status: AUTOMATED LIFECYCLE TEST

- Command: `python -m unittest contracts.test_consent_clip_lifecycle -v`
- Result: 18 tests run, 18 passed, 0 failed, 0 skipped.
- Named steward tests passed:
  - `test_creator_can_trigger_review_when_publisher_refuses_to_submit_usage`
  - `test_competing_creator_and_publisher_visual_evidence_reaches_review`
  - `test_publisher_can_add_usage_after_creator_already_disputed`
  - `test_evidence_quota_prevents_one_party_from_crowding_other_party`
  - `test_publisher_can_recover_after_expiry`
- Existing integrity and settlement tests also passed, including source/evidence hash mismatch rejection, changed evidence undetermined recovery, unchanged verified evidence semantic review, verdict allocation bands, undetermined recovery, unaccepted recovery, and expiry recovery.

## Deployed Schema

Status: LIVE STUDIONET READ

- Command: `npm run verify:schema`
- Result: schema verified for 14 ConsentClip functions.
- Contract: `0x1bB56165db95111aBB409a920e6c44b64b398588`
- Confirmed deployed method: `submit_disputed_usage_evidence`

## StudioNet Verification

Status: LIVE STUDIONET TRANSACTION

- Contract: `0x1bB56165db95111aBB409a920e6c44b64b398588`
- Deployment tx: `0x7c34d5c64b018bc9b714b32a8f64e4553462d26ce037634ca6f8a77211e25c84`
- Deployed source commit: `0555de6a8308f43f15c0f524288f490c2e0bd95a`
- Fixture URL: `https://raw.githubusercontent.com/BeatyXO/consentclip/e33e0ae3f587ebdc7acffa9f491d7fd5be76c2aa/README.md`
- Fixture SHA-256 used for source/evidence commitments: `4400d77d6bd77666ae27c5564b3f19d04fe06b12d196ad6ed7958db383837288`
- Challenge close used for live pre-review releases: `2026-08-23`
- Expiry used for live pre-review releases: `2026-09-01`
- Note: live review and expiry were not exercised. These StudioNet releases accepted evidence before the challenge close date and cannot truthfully be reviewed or expired immediately on the same day. Time-dependent review/expiry transitions are covered by automated lifecycle tests.

### Scenario A - Publisher Non-Cooperation

- Release ID: `1`
- Resulting release state: `disputed`
- Relevant evidence kinds: `terms`, `disputed_usage`
- Evidence integrity: both entries have `integrity_status: verified`.
- Publisher did not call `submit_usage_evidence`.

| Function | Caller role | Tx hash | Finalized status | Result |
| --- | --- | --- | --- | --- |
| `create_release` | creator | `0x4a1a0ef4a343af892b472d762df55503ebe2c0ac09c0136ccfb8b10249cb5fa9` | `7` | `6` |
| `accept_release` | publisher | `0xe14b83c21772f742c0d582caa0a1c3127b580a47e14daa30e930ddb7c00eaaa0` | `7` | `6` |
| `submit_terms_evidence` | creator | `0x11eca23120296b077763fccec47c23aeaede17ab2263e17c883cf2d8771b3a52` | `7` | `6` |
| `submit_disputed_usage_evidence` | creator | `0x0d9514cf3228544de7fbc488a09073a01a8bbb3558015bbe87d10b035af3fbf3` | `7` | `6` |

### Scenario B - Competing Visuals

- Release ID: `2`
- Resulting release state: `disputed`
- Relevant evidence kinds: `terms`, `usage`, `disputed_usage`
- Evidence integrity: all entries have `integrity_status: verified`.
- Confirmed both publisher `usage` and creator `disputed_usage` are present.

| Function | Caller role | Tx hash | Finalized status | Result |
| --- | --- | --- | --- | --- |
| `create_release` | creator | `0x79d012558746bc9e28fde1aa5c3e8a6fecafd22b5ee7341111e391aa14f1d05a` | `7` | `6` |
| `accept_release` | publisher | `0x3a0276f7cc497678d82b9fd21c0906a9d0ca1578b203bb798e2c85057c1411a5` | `7` | `6` |
| `submit_terms_evidence` | creator | `0x36836cef621de9d696bda8b8b36328449a916a9bba33a9b19dee0fd241bc8eda` | `7` | `6` |
| `submit_usage_evidence` | publisher | `0x84bf71a9ea8a2b48d8a574906db0d6dd7c3522d450e386095155fccfbca2ef80` | `7` | `6` |
| `submit_disputed_usage_evidence` | creator | `0x638dcae59a15d66e1c538f2ebb2a760dd81b35418da4768b42cb3c1113e878b3` | `7` | `6` |

### Scenario C - Reverse Visual Ordering

- Release ID: `3`
- Resulting release state: `disputed`
- Relevant evidence kinds after reverse ordering: `terms`, `usage`, `disputed_usage`
- Evidence integrity: all visual entries have `integrity_status: verified`.
- Confirmed creator `disputed_usage` was submitted first, then publisher `usage` succeeded afterward, and the release remained `disputed`.

| Function | Caller role | Tx hash | Finalized status | Result |
| --- | --- | --- | --- | --- |
| `create_release` | creator | `0x46de28933a5c227a662afcbb91b15d581d338a914fd277d55737f0bd23d310d0` | `7` | `6` |
| `accept_release` | publisher | `0xc4553c948df914a95a521feb9600ce55c6c4fa90b16c76d286d25635113fdd2f` | `7` | `6` |
| `submit_terms_evidence` | creator | `0xe266e0d9e370c5fdfe8713246930760422a1988b2b8176c450c23ab5fa5158a7` | `7` | `6` |
| `submit_disputed_usage_evidence` | creator | `0xf72fbee5f67e4bd66b280e66c50c4d74fba89290e1a8b052642f4d9f8eca8d73` | `7` | `6` |
| `submit_usage_evidence` | publisher | `0xd958ac6c6fcb179329eeb9e9e993d0d8f6641cc14ba591ff5c3b002a6823ce2a` | `7` | `6` |

### Scenario D - Evidence Quota

- Release ID: `3`
- Resulting release state: `disputed`
- Relevant evidence kinds after quota test: `terms`, `usage`, `disputed_usage`, `counter`, `counter`, `counter`, `counter`
- Evidence integrity: all stored entries have `integrity_status: verified`.
- Confirmed stored counter evidence remains bounded to 2 creator counters and 2 publisher counters.
- Excess creator counter transaction: `0x7d75ab28e9eea102c14c49cba1d2c41a87557b975d27d83e98c4bc731e3a7d63`
- Excess result: finalized rollback with payload `EXPECTED_EVIDENCE_QUOTA_EXCEEDED`; state read confirmed the third creator counter was not stored.

| Function | Caller role | Tx hash | Finalized status | Result |
| --- | --- | --- | --- | --- |
| `submit_counter_evidence` | creator | `0xfa471ac7a74ab58e6d854a8d33b736a0b9861ed50215127bf16d799acc6590b5` | `7` | `6` |
| `submit_counter_evidence` | creator | `0x5dff732d2c5c650bdbe8564eb7d4665af2b54fca67f2eaaef7bb70af54469e56` | `7` | `6` |
| `submit_counter_evidence` | publisher | `0x7832fc23278077f62c77f8235640053492092349ec4eee9d80f9011ea84e4583` | `7` | `6` |
| `submit_counter_evidence` | publisher | `0xf384d2b0c7a3069bed2e795b77c5b0aebee684d516017705f0f5641d0b224cfb` | `7` | `6` |
| `submit_counter_evidence` | creator, over quota | `0x7d75ab28e9eea102c14c49cba1d2c41a87557b975d27d83e98c4bc731e3a7d63` | `7` | rollback: `EXPECTED_EVIDENCE_QUOTA_EXCEEDED` |
