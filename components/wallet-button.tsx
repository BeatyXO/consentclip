"use client";

import type { ButtonHTMLAttributes } from "react";
import { Download, KeyRound, LogOut, PlugZap, Trash2, Upload } from "lucide-react";
import { useWallet } from "@/lib/wallet";
import { cn, shortAddress } from "@/lib/utils";

type MiniButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

function MiniButton({ active, className, children, ...props }: MiniButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition",
        "border border-transparent text-vault-200 hover:border-vault-300/20 hover:bg-vault-800 hover:text-vault-100",
        active && "border-vault-300/20 bg-vault-100 text-vault-950 hover:bg-vault-100 hover:text-vault-950",
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function WalletButton() {
  const {
    address,
    mode,
    connectInjected,
    ensureBrowserWallet,
    disconnect,
    deleteBrowserWallet,
    exportPrivateKey,
    importPrivateKey,
  } = useWallet();

  async function onImport() {
    const value = window.prompt("Paste exported Custodi browser private key");
    if (value) importPrivateKey(value.trim());
  }

  const isBrowser = mode === "browser";

  return (
    <div className="flex max-w-full items-center justify-end">
      <div className="flex max-w-full flex-wrap items-center justify-end gap-1 rounded-lg border border-vault-300/15 bg-vault-900/70 p-1 shadow-inner shadow-black/20">
      {address ? (
        <div className="inline-flex h-8 items-center gap-1.5 rounded-md border border-vault-300/15 bg-vault-950/60 px-2.5 text-[11px]">
          <span className="text-vault-400">{mode}</span>
          <span className="font-mono text-vault-100">{shortAddress(address)}</span>
        </div>
      ) : null}
      <MiniButton active={mode === "injected"} onClick={connectInjected}>
        <PlugZap className="h-3.5 w-3.5" /> Injected
      </MiniButton>
      <MiniButton active={isBrowser} onClick={ensureBrowserWallet}>
        <KeyRound className="h-3.5 w-3.5" /> Browser
      </MiniButton>
      {isBrowser ? (
        <>
          <MiniButton onClick={exportPrivateKey}>
            <Download className="h-3.5 w-3.5" /> Export
          </MiniButton>
          <MiniButton onClick={onImport}>
            <Upload className="h-3.5 w-3.5" /> Import
          </MiniButton>
          <MiniButton aria-label="Delete browser wallet" className="px-2" onClick={deleteBrowserWallet}>
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete browser wallet</span>
          </MiniButton>
        </>
      ) : null}
      {address ? (
        <MiniButton onClick={disconnect}>
          <LogOut className="h-3.5 w-3.5" /> Disconnect
        </MiniButton>
      ) : null}
      </div>
    </div>
  );
}
