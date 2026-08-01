import { localnet, studionet, testnetAsimov, testnetBradbury } from "genlayer-js/chains";

export const chainName = process.env.NEXT_PUBLIC_GENLAYER_CHAIN ?? "studionet";

const CHAINS = {
  localnet,
  studionet,
  testnetAsimov,
  testnetBradbury,
} as const;

export const chain = CHAINS[chainName as keyof typeof CHAINS] ?? studionet;
export const contractAddress = process.env.NEXT_PUBLIC_CUSTODI_CONTRACT_ADDRESS ?? "";
export const explorerUrl = process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL ?? "https://explorer-studio.genlayer.com";

export const contractFunctions = [
  "create_handoff",
  "accept_handoff",
  "submit_pickup_evidence",
  "submit_return_evidence",
  "request_damage_review",
  "release_without_dispute",
  "get_case",
  "get_cases",
  "get_evidence",
] as const;
