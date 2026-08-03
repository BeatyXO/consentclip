"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PackageOpen, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseCard } from "@/components/case-card";
import { contractAddress } from "@/lib/config";
import { readCustodi } from "@/lib/genlayer";
import type { CustodyCase, CustodyStatus, DamageVerdict } from "@/lib/types";

type ContractCase = {
  id?: string;
  title?: string;
  category?: string;
  lender?: string;
  borrower?: string;
  deposit?: string;
  status?: string;
  due_at?: string;
  created_at?: string;
  verdict_class?: string;
  release_to_borrower?: string;
  release_to_lender?: string;
  confidence?: number;
  reasoning?: string;
};

const statuses: CustodyStatus[] = [
  "draft",
  "awaiting_borrower",
  "active",
  "return_submitted",
  "under_review",
  "released",
  "partial_release",
  "slashed",
  "undetermined",
];

const verdicts: DamageVerdict[] = ["no_new_damage", "minor_wear", "material_damage", "undetermined"];

function parseCases(value: unknown): ContractCase[] {
  if (Array.isArray(value)) return value as ContractCase[];
  if (typeof value !== "string" || value.trim() === "") return [];
  const parsed = JSON.parse(value) as unknown;
  return Array.isArray(parsed) ? (parsed as ContractCase[]) : [];
}

function toCase(item: ContractCase): CustodyCase {
  const status = statuses.includes(item.status as CustodyStatus) ? (item.status as CustodyStatus) : "draft";
  const verdictClass = verdicts.includes(item.verdict_class as DamageVerdict) ? (item.verdict_class as DamageVerdict) : undefined;

  return {
    id: Number(item.id ?? 0),
    title: item.title ?? "Untitled handoff",
    category: item.category ?? "Uncategorized",
    lender: item.lender ?? "",
    borrower: item.borrower ?? "",
    deposit: Number(item.deposit ?? 0),
    status,
    startedAt: item.created_at ?? "",
    dueAt: item.due_at ?? "",
    pickupEvidence: 0,
    returnEvidence: 0,
    verdict: verdictClass
      ? {
          class: verdictClass,
          releaseToBorrower: Number(item.release_to_borrower ?? 0),
          releaseToLender: Number(item.release_to_lender ?? 0),
          confidence: Number(item.confidence ?? 0),
          reasoning: item.reasoning ?? "",
        }
      : undefined,
  };
}

export default function CasesPage() {
  const [cases, setCases] = useState<CustodyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const loadCases = useCallback(async () => {
    if (!contractAddress) {
      setCases([]);
      setLoading(false);
      setError("No Custodi contract address is configured.");
      return;
    }

    try {
      setLoading(true);
      setError(undefined);
      const result = await readCustodi("get_cases", [100]);
      setCases(parseCases(result).map(toCase).filter((item) => item.id > 0));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not read Custodi cases from GenLayer.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-amberline">Case explorer</p>
          <h1 className="mt-2 text-4xl font-black">Custody cases</h1>
          <p className="mt-3 max-w-2xl text-vault-200">
            Read-only browsing works without a wallet. Cases below are loaded from the deployed Custodi contract.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={loadCases} disabled={loading}>
          <RefreshCcw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh cases
        </Button>
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <PackageOpen className="h-8 w-8 text-vault-700" />
            <CardTitle>Could not load cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-vault-950/75">{error}</p>
            <p className="break-all font-mono text-xs text-vault-950/70">{contractAddress || "No contract configured"}</p>
          </CardContent>
        </Card>
      ) : null}

      {!error && loading ? (
        <Card>
          <CardHeader>
            <RefreshCcw className="h-8 w-8 animate-spin text-vault-700" />
            <CardTitle>Loading on-chain cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-vault-950/75">Reading `get_cases(100)` from the deployed Custodi contract.</p>
          </CardContent>
        </Card>
      ) : null}

      {!error && !loading && cases.length === 0 ? (
        <Card>
          <CardHeader>
            <PackageOpen className="h-8 w-8 text-vault-700" />
            <CardTitle>No cases found on-chain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-vault-950/75">
              This page read the deployed Custodi contract, but it returned an empty case list:
              <span className="mt-2 block break-all font-mono text-xs">{contractAddress || "No contract configured"}</span>
            </p>
            <Link href="/cases/new">
              <Button>Create the first handoff</Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {!error && !loading && cases.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cases.map((item) => (
            <CaseCard key={item.id} item={item} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
