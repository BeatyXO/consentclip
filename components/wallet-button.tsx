"use client";

import { Download, KeyRound, PlugZap, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/wallet";
import { shortAddress } from "@/lib/utils";

export function WalletButton() {
  const { address, mode, connectInjected, ensureBrowserWallet, exportPrivateKey, importPrivateKey } = useWallet();

  async function onImport() {
    const value = window.prompt("Paste exported Custodi browser private key");
    if (value) importPrivateKey(value.trim());
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {address ? (
        <div className="rounded-md border border-vault-300/20 bg-vault-900 px-3 py-2 text-xs">
          <span className="text-vault-300">{mode}</span>{" "}
          <span className="font-mono text-vault-100">{shortAddress(address)}</span>
        </div>
      ) : null}
      <Button size="sm" variant="outline" onClick={connectInjected}>
        <PlugZap className="h-3.5 w-3.5" /> Injected
      </Button>
      <Button size="sm" variant="secondary" onClick={ensureBrowserWallet}>
        <KeyRound className="h-3.5 w-3.5" /> Browser wallet
      </Button>
      {mode === "browser" ? (
        <>
          <Button size="sm" variant="ghost" onClick={exportPrivateKey}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" variant="ghost" onClick={onImport}>
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
        </>
      ) : null}
    </div>
  );
}
