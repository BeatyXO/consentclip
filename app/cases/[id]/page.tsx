import Link from "next/link";
import { Camera, FileWarning, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { TxStatus } from "@/components/tx-status";
import { contractAddress } from "@/lib/config";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-amberline">Case #{id}</p>
          <h1 className="mt-2 text-4xl font-black">Live case detail</h1>
          <p className="mt-3 max-w-2xl text-vault-200">
            Local seed data has been removed. This route is reserved for `get_case(&quot;{id}&quot;)` from the deployed Custodi contract.
          </p>
        </div>
        <StatusBadge status="draft" />
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>Deposit</CardTitle></CardHeader><CardContent><p className="text-2xl font-black">—</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Category</CardTitle></CardHeader><CardContent><p>—</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Pickup proofs</CardTitle></CardHeader><CardContent><p className="text-2xl font-black">0</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Return proofs</CardTitle></CardHeader><CardContent><p className="text-2xl font-black">0</p></CardContent></Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Evidence trail</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-vault-950/75">
              No bundled evidence. Render `get_evidence(&quot;{id}&quot;)` here once live reads are connected.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consensus verdict</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-vault-950/75">
                No local verdict. Return evidence and consensus results should come from contract state.
              </p>
              <p className="break-all font-mono text-xs text-vault-950/70">{contractAddress || "No contract configured"}</p>
            </CardContent>
          </Card>
          <TxStatus current="PENDING" />
          <div className="flex flex-wrap gap-2">
            <Link href="/evidence"><Button variant="secondary"><Camera className="h-4 w-4" /> Add evidence</Button></Link>
            <Button variant="outline"><ShieldCheck className="h-4 w-4" /> Request review</Button>
            <Button variant="danger"><FileWarning className="h-4 w-4" /> Dispute return</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
