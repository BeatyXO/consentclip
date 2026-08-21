import { Badge } from "@/components/ui/badge";
import type { CustodyStatus } from "@/lib/types";

const copy: Record<CustodyStatus, string> = {
  draft: "Draft",
  awaiting_publisher: "Awaiting publisher",
  active: "Release active",
  usage_submitted: "Usage submitted",
  disputed: "Disputed use",
  released: "Deposit released",
  partial_release: "Partial release",
  slashed: "Deposit slashed",
  undetermined: "Retry needed",
  recovered_unaccepted: "Deposit recovered",
  recovered_undetermined: "Deposit returned",
  recovered_expired: "Expired deposit returned",
};

const tone: Record<CustodyStatus, string> = {
  draft: "border-vault-700/40 bg-vault-200",
  awaiting_publisher: "border-skyline/70 bg-skyline/20",
  active: "border-amberline/80 bg-amberline/25",
  usage_submitted: "border-skyline/70 bg-skyline/20",
  disputed: "border-rustline/70 bg-rustline/15",
  released: "border-vault-500/80 bg-vault-500/25",
  partial_release: "border-amberline/80 bg-amberline/25",
  slashed: "border-rustline/80 bg-rustline/25",
  undetermined: "border-rustline/80 bg-rustline/20",
  recovered_unaccepted: "border-vault-500/80 bg-vault-500/25",
  recovered_undetermined: "border-vault-500/80 bg-vault-500/25",
  recovered_expired: "border-vault-500/80 bg-vault-500/25",
};

export function StatusBadge({ status }: { status: CustodyStatus }) {
  return <Badge className={tone[status]}>{copy[status]}</Badge>;
}
