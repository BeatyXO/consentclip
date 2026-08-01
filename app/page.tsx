import Link from "next/link";
import { Camera, CircleDollarSign, FileImage, Handshake, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Handshake,
    title: "Deposit-backed handoffs",
    text: "A lender opens a custody case with terms, due date, and GEN deposit. The borrower accepts before taking the item.",
  },
  {
    icon: FileImage,
    title: "Condition evidence",
    text: "Pickup and return photos are registered as public evidence URLs with notes and hashes. The contract stores the trail.",
  },
  {
    icon: Scale,
    title: "Damage consensus",
    text: "When parties disagree, GenLayer validators compare evidence and decide whether new damage happened during custody.",
  },
  {
    icon: CircleDollarSign,
    title: "On-chain settlement",
    text: "The verdict deterministically releases the deposit to borrower, lender, or both according to the damage class.",
  },
  {
    icon: ShieldCheck,
    title: "Abstention by design",
    text: "If evidence is unclear or unreachable, the contract records UNDETERMINED instead of pretending certainty.",
  },
  {
    icon: Camera,
    title: "Built for repeat use",
    text: "Gear rental, borrowed tools, event equipment, bikes, cameras, instruments, and creator kits all fit the same workflow.",
  },
];

export default function LandingPage() {
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-8 pt-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-4 inline-block rounded-full border border-amberline/70 px-4 py-1 text-xs uppercase tracking-[0.28em] text-amberline">
            Custody terminal · GenLayer StudioNet
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight text-vault-100 md:text-6xl">
            The neutral deposit judge for physical item handoffs.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-vault-200">
            Custodi helps two people lend, rent, or return valuable items without trusting each other.
            If damage is disputed, GenLayer reads the pickup and return evidence and settles the deposit.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/cases/new">
              <Button size="lg">Open a Handoff</Button>
            </Link>
            <Link href="/cases">
              <Button size="lg" variant="outline">
                Explore Cases
              </Button>
            </Link>
          </div>
        </div>
        <Card>
          <CardHeader>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-vault-700">Live workflow</p>
            <CardTitle>Pickup → custody → return → consensus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {[
                ["01", "Lender defines item, deposit, due date, and baseline condition."],
                ["02", "Borrower accepts and pickup evidence is locked."],
                ["03", "Return photos are added when the item comes back."],
                ["04", "If disputed, GenLayer judges new damage and releases the deposit."],
              ].map(([step, text]) => (
                <div key={step} className="flex gap-3 rounded-md border border-vault-700/20 p-3">
                  <span className="font-mono text-sm font-black text-vault-700">{step}</span>
                  <p className="text-sm text-vault-950/75">{text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title}>
            <CardHeader>
              <f.icon className="mb-2 h-7 w-7 text-vault-700" />
              <CardTitle>{f.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-vault-950/75">{f.text}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-lg border border-vault-300/15 bg-vault-900/80 p-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-2xl font-black">Delete GenLayer and the product breaks.</h2>
            <p className="mt-3 max-w-3xl text-vault-200">
              A normal app would make the platform, lender, or borrower the judge. Custodi puts the messy part —
              interpreting real-world visual evidence — in GenLayer consensus, then keeps settlement deterministic.
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="secondary">Open Protocol Desk</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
