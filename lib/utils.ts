import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortAddress(address?: string) {
  if (!address) return "No wallet";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatGen(value: bigint | number | string) {
  const numeric = typeof value === "bigint" ? Number(value) : Number(value);
  return `${numeric.toLocaleString(undefined, { maximumFractionDigits: 2 })} GEN`;
}
