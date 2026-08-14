export type ReleaseStatus = "draft" | "awaiting_publisher" | "active" | "usage_submitted" | "released" | "partial_release" | "slashed" | "undetermined" | "recovered_unaccepted" | "recovered_undetermined" | "recovered_expired";
export type EvidenceKind = "terms" | "usage" | "counter";
export type ConsentVerdict = "within_scope" | "minor_overreach" | "material_breach" | "undetermined";
export type ConsentRelease = {
  id: number; title: string; mediaType: string; creator: string; publisher: string; deposit: bigint;
  status: ReleaseStatus; startedAt: string; expiresAt: string; termsEvidence: number; usageEvidence: number;
  verdict?: { class: ConsentVerdict; releaseToPublisher: bigint; releaseToCreator: bigint; confidence: number; reasoning: string };
};
export type EvidenceItem = { id: number; releaseId: number; kind: EvidenceKind; url: string; sha256: string; note: string; submittedBy: string; submittedAt: string };
// Temporary view-model aliases keep the route component surface compact while it renders releases.
export type CustodyStatus = ReleaseStatus;
export type DamageVerdict = ConsentVerdict;
export type CustodyCase = {
  id: number; title: string; category: string; lender: string; borrower: string; deposit: bigint;
  status: ReleaseStatus; startedAt: string; dueAt: string; pickupEvidence: number; returnEvidence: number;
  verdict?: { class: ConsentVerdict; releaseToBorrower: bigint; releaseToLender: bigint; confidence: number; reasoning: string };
};
