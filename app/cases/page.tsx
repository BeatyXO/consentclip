import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contractAddress } from "@/lib/config";

export default function CasesPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-amberline">Case explorer</p>
        <h1 className="mt-2 text-4xl font-black">Custody cases</h1>
        <p className="mt-3 max-w-2xl text-vault-200">
          Read-only browsing works without a wallet. Once live reads are wired, deployed contract cases will appear here.
        </p>
      </div>
      <Card>
        <CardHeader>
          <PackageOpen className="h-8 w-8 text-vault-700" />
          <CardTitle>No cases loaded</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-vault-950/75">
            Local seed data has been removed. This page should read from the deployed Custodi contract:
            <span className="mt-2 block break-all font-mono text-xs">{contractAddress || "No contract configured"}</span>
          </p>
          <Link href="/cases/new">
            <Button>Create the first handoff</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
