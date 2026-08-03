"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Camera, Coins, FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TxStatus } from "@/components/tx-status";
import { explorerUrl } from "@/lib/config";
import { writeCustodi } from "@/lib/genlayer";
import { useWallet } from "@/lib/wallet";

type SubmitStatus = "idle" | "submitting" | "accepted" | "error";

export default function NewCasePage() {
  const wallet = useWallet();
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setTxHash(undefined);

    if (!wallet.address || wallet.mode === "none") {
      setStatus("error");
      setError("Choose injected or browser wallet before writing.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const category = String(form.get("category") ?? "").trim();
    const borrower = String(form.get("borrower") ?? "").trim();
    const baseline = String(form.get("baseline") ?? "").trim();
    const dueAt = String(form.get("due") ?? "").trim();
    const depositNumber = Number(String(form.get("deposit") ?? "").trim());

    if (!Number.isFinite(depositNumber) || depositNumber <= 0) {
      setStatus("error");
      setError("Deposit must be greater than 0 GEN.");
      return;
    }

    const identity =
      wallet.mode === "browser" && wallet.privateKey
        ? ({ mode: "browser", privateKey: wallet.privateKey } as const)
        : ({ mode: "injected", address: wallet.address } as const);

    try {
      setStatus("submitting");
      const result = await writeCustodi(
        identity,
        "create_handoff",
        [title, category, borrower, baseline, dueAt],
        BigInt(Math.trunc(depositNumber)),
      );
      setTxHash(result.hash);
      setStatus("accepted");
    } catch (caught) {
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "GenLayer transaction failed.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-amberline">New handoff</p>
          <h1 className="mt-2 text-4xl font-black">Create a custody case</h1>
          <p className="mt-3 max-w-2xl text-vault-200">
            The lender defines the item and deposit. The borrower accepts with the same identity the app displays.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Handoff terms</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-5" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="title">Item title</Label>
                <Input id="title" name="title" placeholder="Item name and handoff purpose" required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" placeholder="Item category" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deposit">Deposit in GEN</Label>
                  <Input id="deposit" name="deposit" type="number" min="1" step="1" placeholder="Deposit amount" required />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="borrower">Borrower address</Label>
                  <Input id="borrower" name="borrower" placeholder="0x…" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="due">Return deadline</Label>
                  <Input id="due" name="due" type="datetime-local" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="baseline">Baseline condition</Label>
                <Textarea
                  id="baseline"
                  name="baseline"
                  placeholder="Describe existing scratches, missing accessories, serial number, and agreed acceptable wear."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="photo">Pickup evidence URL</Label>
                <Input id="photo" name="photo" type="url" placeholder="https://…" />
                <p className="text-xs text-vault-950/60">
                  This transaction creates the custody case. Add pickup and return evidence from the Evidence page.
                </p>
              </div>
              <Button type="submit" size="lg" disabled={!wallet.address || status === "submitting"}>
                <FilePlus2 className="h-4 w-4" /> {status === "submitting" ? "Writing to GenLayer…" : "Create handoff"}
              </Button>
              {!wallet.address ? <p className="text-sm text-vault-950/70">Choose injected or browser wallet before writing.</p> : null}
              {error ? <p className="rounded-md border border-rustline/40 bg-rustline/10 p-3 text-sm text-rustline">{error}</p> : null}
              {txHash ? (
                <div className="rounded-md border border-vault-700/20 bg-vault-100/60 p-3 text-sm text-vault-950/75">
                  <p className="font-semibold text-vault-950">Handoff creation transaction accepted.</p>
                  <Link className="mt-1 block break-all font-mono text-xs underline" href={`${explorerUrl}/transactions/${txHash}`} target="_blank">
                    {txHash}
                  </Link>
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>What goes on-chain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-vault-950/75">
            <p className="flex gap-2"><Coins className="h-4 w-4 shrink-0" /> Deposit value and settlement state.</p>
            <p className="flex gap-2"><Camera className="h-4 w-4 shrink-0" /> Public evidence URLs, hashes, notes, and author.</p>
            <p>Image files themselves stay off-chain; the contract fetches public URLs during consensus.</p>
          </CardContent>
        </Card>
        {status === "submitting" ? <TxStatus current="PROPOSING" /> : null}
        {status === "accepted" ? <TxStatus current="ACCEPTED" /> : null}
      </aside>
    </div>
  );
}
