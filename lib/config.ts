import { localnet, studionet, testnetAsimov, testnetBradbury } from "genlayer-js/chains";

export const chainName = process.env.NEXT_PUBLIC_GENLAYER_CHAIN ?? "studionet";

const CHAINS = {
  localnet,
  studionet,
  testnetAsimov,
  testnetBradbury,
} as const;

export const chain = CHAINS[chainName as keyof typeof CHAINS] ?? studionet;
export const contractAddress = process.env.NEXT_PUBLIC_CONSENTCLIP_CONTRACT_ADDRESS ?? "";
export const explorerUrl = process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL ?? "https://explorer-studio.genlayer.com";

export const contractFunctions = [
  "create_release",
  "accept_release",
  "submit_terms_evidence",
  "submit_usage_evidence",
  "submit_counter_evidence",
  "request_consent_review",
  "release_deposit",
  "recover_unaccepted",
  "recover_undetermined",
  "get_release",
  "get_releases",
  "get_evidence",
] as const;
