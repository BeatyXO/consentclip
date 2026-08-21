# ConsentClip Decision Record

ConsentClip resolves creator/publisher disputes over whether a live use of a testimonial, UGC clip, or campaign asset stays within recorded consent. The parties need not trust each other or an application operator with collateral.

## Semantic judgment and integrity

Consent scope requires comparison of source work, live use, terms, and counter-evidence, so GenLayer comparative consensus performs that semantic judgment. Roles, challenge windows, settlement bands, and transfers remain deterministic. Integrity is a separate responsibility: source, publisher usage, and creator disputed usage commitments hash the raw media response bytes supplied to vision adjudication; terms and counter-evidence commitments hash the UTF-8 rendered text supplied to the prompt.

Validators capture that canonical representation at submission in a strict-equivalence block and reject a claimed digest that differs. The contract stores the verified digest, capture mode, and verified integrity status. At review it captures every external item again in the recorded mode before it can reach the semantic judge. Changed or unavailable material resolves safely as `undetermined` and is never judged.

## Lifecycle and recovery

Evidence can be submitted through the challenge close date. Publisher-submitted usage is useful cooperative evidence, but it is not required for review: after acceptance and creator terms evidence, the creator can call `submit_disputed_usage_evidence` to store the disputed visual use and move the release to `disputed`. After the challenge date, either party can request review from `usage_submitted` or `disputed` as long as a protected primary visual exists.

Verified material is classified as within scope, minor overreach, material breach, or undetermined. Deterministic settlement is respectively 100/0, 80/20, 0/100 publisher/creator, or existing publisher recovery for an undetermined result. Expiry and unaccepted-release recovery remain available; publisher expiry recovery also covers an unsettled `disputed` release.

## Evidence selection

Review input is bounded by deterministic protected slots: creator terms max 1, publisher primary usage visual max 1, creator disputed usage visual max 1, creator counter evidence max 2, and publisher counter evidence max 2. The contract rejects excess items per kind and submitting party with `EXPECTED_EVIDENCE_QUOTA_EXCEEDED`. The review package is ordered as terms, publisher usage, creator disputed usage, creator counters, then publisher counters, so submission order cannot let either side consume the other's protected slots.

## Nondeterminism budget

Only canonical web capture and semantic adjudication are nondeterministic. This preserves auditable web evidence while keeping state transitions and finality-safe payouts deterministic, making the pattern useful beyond a demo.
