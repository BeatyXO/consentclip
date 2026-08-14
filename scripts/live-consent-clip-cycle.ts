import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

const contractAddress = process.env.NEXT_PUBLIC_CONSENTCLIP_CONTRACT_ADDRESS as `0x${string}` | undefined;
const creatorKey = process.env.CONSENTCLIP_CREATOR_PRIVATE_KEY as `0x${string}` | undefined;
const publisherKey = process.env.CONSENTCLIP_PUBLISHER_PRIVATE_KEY as `0x${string}` | undefined;
if (!contractAddress || !creatorKey || !publisherKey) throw new Error("NEXT_PUBLIC_CONSENTCLIP_CONTRACT_ADDRESS, CONSENTCLIP_CREATOR_PRIVATE_KEY, and CONSENTCLIP_PUBLISHER_PRIVATE_KEY are required.");

const deployedAddress = contractAddress;
const creator = createAccount(creatorKey);
const publisher = createAccount(publisherKey);
const creatorClient = createClient({ chain: studionet, account: creator });
const publisherClient = createClient({ chain: studionet, account: publisher });
const sourceUrl = "https://example.com";
const terms = "Publisher may use this exact testimonial only on the designated campaign page.";
const attestation = "a".repeat(64);
const challengeEndsAt = process.env.CONSENTCLIP_CHALLENGE_ENDS_AT ?? "2026-12-01";
const expiresAt = process.env.CONSENTCLIP_EXPIRES_AT ?? "2027-01-01";
const writeGapMs = 65_000;
let lastWriteAt = 0;

async function write(client: ReturnType<typeof createClient>, name: string, args: unknown[], value = 0n) {
  const waitMs = Math.max(0, writeGapMs - (Date.now() - lastWriteAt));
  if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
  const hash = await client.writeContract({ address: deployedAddress, functionName: name, args: args as never[], value });
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 12_000, retries: 90 });
  lastWriteAt = Date.now();
  if (receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) throw new Error(`${name} failed: ${hash}`);
  console.log(`${name}: ${hash}`);
}

async function nextReleaseId() {
  const raw = await creatorClient.readContract({ address: deployedAddress, functionName: "get_releases", args: [100] as never[] });
  const releases = JSON.parse(String(raw)) as Array<{ id: string }>;
  return String(Math.max(0, ...releases.map((release) => Number(release.id))) + 1);
}

async function createAndAccept(label: string) {
  const id = await nextReleaseId();
  await write(creatorClient, "create_release", [label, "testimonial", publisher.address.toLowerCase(), sourceUrl, attestation, terms, challengeEndsAt, expiresAt]);
  await write(publisherClient, "accept_release", [id], 10n ** 15n);
  return id;
}

async function main() {
  // Evidence path: review intentionally waits for the on-chain challenge-close date.
  const reviewId = await createAndAccept("StudioNet visual consent-review verification");
  await write(creatorClient, "submit_terms_evidence", [reviewId, sourceUrl, attestation, "Immutable source and granted terms."]);
  await write(publisherClient, "submit_usage_evidence", [reviewId, sourceUrl, attestation, "Live campaign use for visual comparison."]);
  await write(creatorClient, "submit_counter_evidence", [reviewId, sourceUrl, attestation, "Counter-evidence available to validators."]);
  if (new Date(`${challengeEndsAt}T00:00:00Z`) <= new Date()) {
    await write(creatorClient, "request_consent_review", [reviewId]);
  } else {
    console.log(`request_consent_review deferred until ${challengeEndsAt}; the challenge window is intentionally still open.`);
  }

  // Creator voluntary-release path.
  const releaseId = await createAndAccept("StudioNet voluntary release verification");
  await write(creatorClient, "release_deposit", [releaseId]);

  // No collateral is accepted until the publisher accepts, so this branch cannot trap GEN.
  const unacceptedId = await nextReleaseId();
  await write(creatorClient, "create_release", ["StudioNet unaccepted recovery verification", "testimonial", publisher.address.toLowerCase(), sourceUrl, attestation, terms, challengeEndsAt, expiresAt]);
  await write(creatorClient, "recover_unaccepted", [unacceptedId]);

  console.log("recover_undetermined requires a genuine undetermined consensus result; recover_expired requires the on-chain expiry date. Both are exercised by direct lifecycle tests.");
}

main().catch((error) => { console.error(error); process.exit(1); });
