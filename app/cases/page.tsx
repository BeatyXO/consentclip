import { CaseCard } from "@/components/case-card";
import { demoCases } from "@/lib/mock-data";

export default function CasesPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-amberline">Case explorer</p>
        <h1 className="mt-2 text-4xl font-black">Custody cases</h1>
        <p className="mt-3 max-w-2xl text-vault-200">
          Read-only browsing works without a wallet. Created handoffs should be listed, openable, and shareable by URL.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {demoCases.map((item) => (
          <CaseCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
