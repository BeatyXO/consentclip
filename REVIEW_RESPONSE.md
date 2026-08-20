# Reviewer response: evidence preservation

**Issue.** Caller-supplied hashes were previously stored without validator comparison to fetched content.

**Fix.** The contract now captures canonical evidence in GenLayer consensus at submission and rejects a claimed SHA-256 that differs from the validator-derived digest. It records `verified_sha256`, `capture_mode`, and `integrity_status: verified` for every evidence item and equivalent source fields on the release.

**Review protection.** Before semantic adjudication, the same canonical representation is fetched again and compared to that verified commitment. Source/usage use raw media response bytes; terms/counter evidence use UTF-8 rendered text.

**Mutation behavior.** A mismatch or unavailable representation returns `undetermined` with an integrity reason. No changed content is supplied to the semantic judge, and no semantic payout is made from substituted material.

**Tests.** `test_source_hash_mismatch_is_rejected`, `test_terms_usage_and_counter_hash_mismatches_are_rejected`, `test_correct_hash_is_accepted_and_recorded_as_verified`, `test_changed_source_or_evidence_cannot_reach_semantic_judgment`, `test_unchanged_verified_evidence_reaches_semantic_review`, and `test_integrity_mismatch_uses_undetermined_recovery_path`.

**Deployment/source.** StudioNet contract `0x9C875Bd2643a73fB6A618f7DE22c70F8968256d9`; deployment transaction `0x1938ad7e95f1650dac0f57a6bb003eb1c650de3a86335fe23e53fe3e8560d5f6`. Final commit SHA is recorded after the accompanying documentation/UI cleanup is pushed.
