import Link from "next/link";
import { notFound } from "next/navigation";
import { Camera, Coins, FileWarning, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { TxStatus } from "@/components/tx-status";
import { demoCases, demoEvidence } from "@/lib/mock-data";
import { formatGen, shortAddress } from "@/lib/utils";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = demoCases.find((entry) => entry.id === Number(id));
  if (!item) notFound();
  const evidence = demoEvidence.filter((entry) => entry.caseId === item.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-amberline">Case #{item.id}</p>
          <h1 className="mt-2 text-4xl font-black">{item.title}</h1>
          <p className="mt-3 text-vault-200">
            Lender {shortAddress(item.lender)} · Borrower {shortAddress(item.borrower)}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>Deposit</CardTitle></CardHeader><CardContent><p className="text-2xl font-black">{formatGen(item.deposit)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Category</CardTitle></CardHeader><CardContent><p>{item.category}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Pickup proofs</CardTitle></CardHeader><CardContent><p className="text-2xl font-black">{item.pickupEvidence}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Return proofs</CardTitle></CardHeader><CardContent><p className="text-2xl font-black">{item.returnEvidence}</p></CardContent></Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Evidence trail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-vault-700/20">
              {evidence.map((entry) => (
                <div key={entry.id} className="grid gap-2 py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold">{entry.kind.replaceAll("_", " ")}</p>
                    <p className="font-mono text-xs text-vault-950/60">{new Date(entry.submittedAt).toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-vault-950/75">{entry.note}</p>
                  <a className="truncate font-mono text-xs text-vault-700 underline" href={entry.url}>{entry.url}</a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consensus verdict</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.verdict ? (
                <>
                  <p className="text-sm uppercase tracking-[0.18em] text-vault-700">{item.verdict.class.replaceAll("_", " ")}</p>
                  <p className="text-sm leading-6 text-vault-950/75">{item.verdict.reasoning}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-md border border-vault-700/20 p-3">
                      <Coins className="mb-1 h-4 w-4" />
                      Borrower {formatGen(item.verdict.releaseToBorrower)}
                    </div>
                    <div className="rounded-md border border-vault-700/20 p-3">
                      <Coins className="mb-1 h-4 w-4" />
                      Lender {formatGen(item.verdict.releaseToLender)}
                    </div>
                  </div>
                  <p className="text-sm font-semibold">Confidence {item.verdict.confidence}%</p>
                </>
              ) : (
                <p className="text-sm text-vault-950/75">No verdict yet. Return evidence must be submitted before consensus review.</p>
              )}
            </CardContent>
          </Card>
          <TxStatus current={item.status === "under_review" ? "REVEALING" : "FINALIZED"} />
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
