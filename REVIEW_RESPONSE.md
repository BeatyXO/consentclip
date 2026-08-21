# Reviewer response: GenLayer resubmission fixes

## Steward request mapping

| Steward concern | Fix | Test |
| --- | --- | --- |
| Creator cannot trigger disputed visual review without publisher cooperation. | Added creator-only `submit_disputed_usage_evidence(release_id, url, sha256, note)`. It verifies the public visual with the same validator-derived raw-media SHA-256 commitment used for visual evidence, stores it as `disputed_usage`, moves an accepted release to `disputed`, and allows `request_consent_review` after the challenge window without publisher usage submission. | `test_creator_can_trigger_review_when_publisher_refuses_to_submit_usage` |
| Evidence can be crowded out. | Replaced global first-N review selection with protected deterministic quotas: creator terms max 1, publisher usage max 1, creator disputed usage max 1, creator counter max 2, publisher counter max 2. Excess submissions are rejected with `EXPECTED_EVIDENCE_QUOTA_EXCEEDED`. | `test_evidence_quota_prevents_one_party_from_crowding_other_party` |
| Competing visual evidence must reach validators. | `_review_consent` now receives the bounded package containing source, creator disputed usage when present, publisher usage when present, terms, and protected counter-evidence. If both visual usage records exist, both images are passed to semantic adjudication. | `test_competing_creator_and_publisher_visual_evidence_reaches_review` |
| Reverse visual ordering must not close publisher's protected slot. | `submit_usage_evidence` now accepts `disputed` releases and preserves the `disputed` status when publisher usage is added after the creator's disputed visual. | `test_publisher_can_add_usage_after_creator_already_disputed` |
| Expiry lifecycle must remain correct. | `recover_expired` still returns unsettled collateral to the publisher and now also covers an unsettled `disputed` release. | `test_publisher_can_recover_after_expiry` |

## Integrity and consensus preservation

The contract still never trusts caller-provided hashes. Source, publisher usage, and creator disputed usage use `raw_media_bytes_v1`; terms and counter-evidence use `rendered_text_utf8_v1`. Submission verifies claimed SHA-256 through validator capture, and review re-fetches the same canonical representation before semantic adjudication. Unavailable evidence or commitment mismatch returns `undetermined`.

Semantic adjudication still uses GenLayer comparative consensus through `gl.eq_principle.prompt_comparative`. External URLs, notes, and fetched content remain evidence only, never instructions.

## Deployment/source

Previous StudioNet contract: `0x9C875Bd2643a73fB6A618f7DE22c70F8968256d9`.

New deployment details, final commit SHA, transaction hash, and explorer link must be filled after the updated contract is committed and redeployed from this source.
