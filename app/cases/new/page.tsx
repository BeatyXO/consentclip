"use client";

import { useState } from "react";
import { Camera, Coins, FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TxStatus } from "@/components/tx-status";
import { useWallet } from "@/lib/wallet";

export default function NewCasePage() {
  const wallet = useWallet();
  const [submitted, setSubmitted] = useState(false);

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
            <form
              className="grid gap-5"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="title">Item title</Label>
                <Input id="title" placeholder="Item name and handoff purpose" required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" placeholder="Item category" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deposit">Deposit in GEN</Label>
                  <Input id="deposit" type="number" min="0" placeholder="Deposit amount" required />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="borrower">Borrower address</Label>
                  <Input id="borrower" placeholder="0x…" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="due">Return deadline</Label>
                  <Input id="due" type="datetime-local" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="baseline">Baseline condition</Label>
                <Textarea id="baseline" placeholder="Describe existing scratches, missing accessories, serial number, and agreed acceptable wear." required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="photo">Pickup evidence URL</Label>
                <Input id="photo" type="url" placeholder="https://…" required />
              </div>
              <Button type="submit" size="lg" disabled={!wallet.address}>
                <FilePlus2 className="h-4 w-4" /> Create handoff
              </Button>
              {!wallet.address ? <p className="text-sm text-vault-950/70">Choose injected or browser wallet before writing.</p> : null}
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
        {submitted ? <TxStatus current="PROPOSING" /> : null}
      </aside>
    </div>
  );
}
