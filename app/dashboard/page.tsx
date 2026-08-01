import { Activity, Camera, Coins, Scale } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseCard } from "@/components/case-card";
import { demoCases } from "@/lib/mock-data";
import { formatGen } from "@/lib/utils";

export default function DashboardPage() {
  const totalDeposits = demoCases.reduce((sum, item) => sum + item.deposit, 0);
  const underReview = demoCases.filter((item) => item.status === "under_review").length;
  const evidence = demoCases.reduce((sum, item) => sum + item.pickupEvidence + item.returnEvidence, 0);
  const stats: Array<[string, string | number, LucideIcon]> = [
    ["Open cases", demoCases.length, Activity],
    ["Deposits tracked", formatGen(totalDeposits), Coins],
    ["Evidence items", evidence, Camera],
    ["Under review", underReview, Scale],
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-amberline">Protocol desk</p>
        <h1 className="mt-2 text-4xl font-black">Custodi dashboard</h1>
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        {stats.map(([label, value, Icon]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5" />{label}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-black">{value}</p></CardContent>
          </Card>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {demoCases.map((item) => <CaseCard key={item.id} item={item} />)}
      </section>
    </div>
  );
}
