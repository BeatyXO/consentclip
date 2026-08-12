"use client";

import Link from "next/link";
import { Camera, LayoutDashboard, PackageCheck, Search } from "lucide-react";
import { WalletButton } from "@/components/wallet-button";

const links = [
  { href: "/cases", label: "Cases", icon: Search },
  { href: "/cases/new", label: "New release", icon: PackageCheck },
  { href: "/evidence", label: "Evidence", icon: Camera },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Navbar() {
  return (
    <header className="relative z-[100] border-b border-vault-300/10 bg-vault-950/85 backdrop-blur">
      <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-amberline/70 bg-amberline/15">
            <Camera className="h-5 w-5 text-amberline" />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight">ConsentClip</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-vault-300">creator consent protocol</p>
          </div>
        </Link>
        <div className="absolute right-4 top-4 sm:right-6 lg:right-8">
          <WalletButton />
        </div>
        <nav className="mt-5 flex flex-wrap items-center gap-2 pr-0 sm:pr-48">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-vault-200 hover:bg-vault-800 hover:text-vault-100"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
