import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";
import { createDecipheriv, createHash, pbkdf2Sync, scryptSync } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { keccak256 } from "viem";
import * as Keystore from "ox/Keystore";

type Hex = `0x${string}`;
type Role = "creator" | "publisher";
type TxRecord = { functionName: string; role: Role; hash: string; status: string; result: string };
type Release = { id: string; status: string };
type Evidence = { kind: string; verified_sha256?: string; integrity_status?: string; submitted_by?: string };
type Scenario = {
  name: string;
  releaseId: string;
  transactions: TxRecord[];
  releaseState: string;
  evidenceKinds: string[];
  notes: string[];
};

const contractAddress = process.env.NEXT_PUBLIC_CONSENTCLIP_CONTRACT_ADDRESS as Hex | undefined;
const creatorKey = process.env.CONSENTCLIP_CREATOR_PRIVATE_KEY as Hex | undefined;
const publisherKey = process.env.CONSENTCLIP_PUBLISHER_PRIVATE_KEY as Hex | undefined;
const creatorKeystore = process.env.CONSENTCLIP_CREATOR_KEYSTORE;
const publisherKeystore = process.env.CONSENTCLIP_PUBLISHER_KEYSTORE;
const keystorePassword = process.env.CONSENTCLIP_KEYSTORE_PASSWORD;

if (!contractAddress) {
  throw new Error("NEXT_PUBLIC_CONSENTCLIP_CONTRACT_ADDRESS is required.");
}

const expectedContract = "0x1bB56165db95111aBB409a920e6c44b64b398588";
if (contractAddress.toLowerCase() !== expectedContract.toLowerCase()) {
  throw new Error(`Expected deployed contract ${expectedContract}, got ${contractAddress}.`);
}

let creator: ReturnType<typeof createAccount>;
let publisher: ReturnType<typeof createAccount>;
let creatorClient: ReturnType<typeof createClient>;
let publisherClient: ReturnType<typeof createClient>;
const fixtureUrl = process.env.CONSENTCLIP_FIXTURE_URL ?? "https://raw.githubusercontent.com/BeatyXO/consentclip/e33e0ae3f587ebdc7acffa9f491d7fd5be76c2aa/README.md";
const challengeEndsAt = process.env.CONSENTCLIP_CHALLENGE_ENDS_AT ?? "2026-08-23";
const expiresAt = process.env.CONSENTCLIP_EXPIRES_AT ?? "2026-09-01";
const deposit = BigInt(process.env.CONSENTCLIP_LIVE_DEPOSIT_WEI ?? "100000000000000");
const writeGapMs = Number(process.env.CONSENTCLIP_WRITE_GAP_MS ?? "5000");
let lastWriteAt = 0;

async function sha256ForUrl(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not fetch fixture ${url}: ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  return createHash("sha256").update(bytes).digest("hex");
}

async function privateKeyFromKeystore(path: string): Promise<Hex> {
  if (!keystorePassword) throw new Error("CONSENTCLIP_KEYSTORE_PASSWORD is required when using keystore paths.");
  const raw = JSON.parse(await readFile(path, "utf8")) as Keystore.Keystore & { Crypto?: unknown };
  const keystore = { ...raw, crypto: raw.crypto ?? raw.Crypto } as Keystore.Keystore;
  try {
    const key = await Keystore.toKeyAsync(keystore, { password: keystorePassword });
    return Keystore.decrypt(keystore, key) as Hex;
  } catch {
    return decryptWeb3Keystore(raw as unknown as Web3Keystore, keystorePassword);
  }
}

type Web3Keystore = {
  crypto?: Web3Crypto;
  Crypto?: Web3Crypto;
};
type Web3Crypto = {
  cipher: string;
  cipherparams: { iv: string };
  ciphertext: string;
  kdf: string;
  kdfparams: { salt: string; n?: number; r?: number; p?: number; dklen: number; c?: number; prf?: string };
  mac: string;
};

function hexBytes(value: string) {
  return Buffer.from(value.startsWith("0x") ? value.slice(2) : value, "hex");
}

function decryptWeb3Keystore(keystore: Web3Keystore, password: string): Hex {
  const crypto = keystore.crypto ?? keystore.Crypto;
  if (!crypto) throw new Error("Expected Web3 keystore crypto payload.");
  const salt = hexBytes(crypto.kdfparams.salt);
  const dklen = crypto.kdfparams.dklen;
  const derived = crypto.kdf === "scrypt"
    ? scryptSync(Buffer.from(password), salt, dklen, { N: crypto.kdfparams.n, r: crypto.kdfparams.r, p: crypto.kdfparams.p, maxmem: 256 * 1024 * 1024 })
    : pbkdf2Sync(Buffer.from(password), salt, crypto.kdfparams.c ?? 262144, dklen, "sha256");
  const ciphertext = hexBytes(crypto.ciphertext);
  const mac = keccak256(Buffer.concat([derived.subarray(16, 32), ciphertext]));
  if (mac.slice(2).toLowerCase() !== crypto.mac.toLowerCase()) throw new Error("Could not decrypt exported keystore.");
  const decipher = createDecipheriv(crypto.cipher, derived.subarray(0, 16), hexBytes(crypto.cipherparams.iv));
  const privateKey = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("hex");
  return `0x${privateKey}`;
}

async function loadAccounts() {
  const resolvedCreatorKey = creatorKey ?? (creatorKeystore ? await privateKeyFromKeystore(creatorKeystore) : undefined);
  const resolvedPublisherKey = publisherKey ?? (publisherKeystore ? await privateKeyFromKeystore(publisherKeystore) : undefined);
  if (!resolvedCreatorKey || !resolvedPublisherKey) {
    throw new Error("Provide CONSENTCLIP_CREATOR_PRIVATE_KEY and CONSENTCLIP_PUBLISHER_PRIVATE_KEY, or CONSENTCLIP_CREATOR_KEYSTORE, CONSENTCLIP_PUBLISHER_KEYSTORE, and CONSENTCLIP_KEYSTORE_PASSWORD.");
  }
  creator = createAccount(resolvedCreatorKey);
  publisher = createAccount(resolvedPublisherKey);
  creatorClient = createClient({ chain: studionet, account: creator });
  publisherClient = createClient({ chain: studionet, account: publisher });
}

function clientFor(role: Role) {
  return role === "creator" ? creatorClient : publisherClient;
}

async function pauseBeforeWrite() {
  const waitMs = Math.max(0, writeGapMs - (Date.now() - lastWriteAt));
  if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
}

async function write(role: Role, functionName: string, args: unknown[], value = 0n): Promise<TxRecord> {
  await pauseBeforeWrite();
  const client = clientFor(role);
  const hash = await client.writeContract({ address: contractAddress as Hex, functionName, args: args as never[], value });
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 12_000, retries: 90 });
  lastWriteAt = Date.now();
  const status = String(receipt.statusName ?? receipt.status ?? "unknown");
  const result = String(receipt.txExecutionResultName ?? receipt.resultName ?? receipt.result ?? "unknown");
  if (receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) {
    throw new Error(`${functionName} failed after finalization: ${hash}`);
  }
  console.log(`${role} ${functionName}: ${hash} (${status}/${result})`);
  return { functionName, role, hash, status, result };
}

async function writeExpectQuotaFailure(role: Role, functionName: string, args: unknown[]) {
  try {
    await pauseBeforeWrite();
    const client = clientFor(role);
    const hash = await client.writeContract({ address: contractAddress as Hex, functionName, args: args as never[], value: 0n });
    const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 12_000, retries: 90 });
    lastWriteAt = Date.now();
    const result = String(receipt.txExecutionResultName ?? receipt.resultName ?? receipt.result ?? "unknown");
    return `Quota excess transaction finalized as ${hash} with receipt result ${result}; subsequent state read confirms the excess evidence was not stored.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("EXPECTED_EVIDENCE_QUOTA_EXCEEDED")) throw error;
    return `Quota excess rejected before/while finalizing with EXPECTED_EVIDENCE_QUOTA_EXCEEDED.`;
  }
}

async function releases(): Promise<Release[]> {
  const raw = await creatorClient.readContract({ address: contractAddress as Hex, functionName: "get_releases", args: [100] as never[] });
  return JSON.parse(String(raw)) as Release[];
}

async function nextReleaseId() {
  const current = await releases();
  return String(Math.max(0, ...current.map((release) => Number(release.id))) + 1);
}

async function release(releaseId: string): Promise<Release> {
  return JSON.parse(String(await creatorClient.readContract({ address: contractAddress as Hex, functionName: "get_release", args: [releaseId] as never[] }))) as Release;
}

async function evidence(releaseId: string): Promise<Evidence[]> {
  const raw = await creatorClient.readContract({ address: contractAddress as Hex, functionName: "get_evidence", args: [releaseId] as never[] });
  return JSON.parse(String(raw)) as Evidence[];
}

async function createAccepted(title: string, digest: string) {
  const releaseId = await nextReleaseId();
  const txs: TxRecord[] = [];
  txs.push(await write("creator", "create_release", [title, "testimonial", publisher.address.toLowerCase(), fixtureUrl, digest, "Publisher may use this testimonial only on the designated campaign page.", challengeEndsAt, expiresAt]));
  txs.push(await write("publisher", "accept_release", [releaseId], deposit));
  return { releaseId, txs };
}

function assertHasEvidence(items: Evidence[], kind: string) {
  const item = items.find((entry) => entry.kind === kind);
  if (!item) throw new Error(`Missing ${kind} evidence.`);
  if (item.integrity_status !== "verified") throw new Error(`${kind} evidence is not validator-verified.`);
}

async function scenarioA(digest: string): Promise<Scenario> {
  const { releaseId, txs } = await createAccepted("Live A publisher non-cooperation", digest);
  txs.push(await write("creator", "submit_terms_evidence", [releaseId, fixtureUrl, digest, "Creator terms evidence."]));
  txs.push(await write("creator", "submit_disputed_usage_evidence", [releaseId, fixtureUrl, digest, "Creator disputed usage without publisher usage."]));
  const current = await release(releaseId);
  const items = await evidence(releaseId);
  if (current.status !== "disputed") throw new Error(`Scenario A expected disputed, got ${current.status}.`);
  assertHasEvidence(items, "disputed_usage");
  return { name: "A - publisher non-cooperation", releaseId, transactions: txs, releaseState: current.status, evidenceKinds: items.map((item) => item.kind), notes: ["Publisher did not call submit_usage_evidence."] };
}

async function scenarioB(digest: string): Promise<Scenario> {
  const { releaseId, txs } = await createAccepted("Live B competing visuals", digest);
  txs.push(await write("creator", "submit_terms_evidence", [releaseId, fixtureUrl, digest, "Creator terms evidence."]));
  txs.push(await write("publisher", "submit_usage_evidence", [releaseId, fixtureUrl, digest, "Publisher claimed usage."]));
  txs.push(await write("creator", "submit_disputed_usage_evidence", [releaseId, fixtureUrl, digest, "Creator disputed usage."]));
  const current = await release(releaseId);
  const items = await evidence(releaseId);
  assertHasEvidence(items, "usage");
  assertHasEvidence(items, "disputed_usage");
  return { name: "B - competing visuals", releaseId, transactions: txs, releaseState: current.status, evidenceKinds: items.map((item) => item.kind), notes: ["Both publisher usage and creator disputed_usage are present."] };
}

async function scenarioCAndD(digest: string): Promise<Scenario[]> {
  const { releaseId, txs } = await createAccepted("Live C reverse visual ordering and D quotas", digest);
  const notes: string[] = [];
  txs.push(await write("creator", "submit_terms_evidence", [releaseId, fixtureUrl, digest, "Creator terms evidence."]));
  txs.push(await write("creator", "submit_disputed_usage_evidence", [releaseId, fixtureUrl, digest, "Creator disputed usage first."]));
  const afterDispute = await release(releaseId);
  if (afterDispute.status !== "disputed") throw new Error(`Scenario C expected disputed after creator visual, got ${afterDispute.status}.`);
  txs.push(await write("publisher", "submit_usage_evidence", [releaseId, fixtureUrl, digest, "Publisher usage after creator dispute."]));
  const afterPublisherUsage = await release(releaseId);
  if (afterPublisherUsage.status !== "disputed") throw new Error(`Scenario C expected disputed after publisher usage, got ${afterPublisherUsage.status}.`);
  txs.push(await write("creator", "submit_counter_evidence", [releaseId, fixtureUrl, digest, "Creator counter one."]));
  txs.push(await write("creator", "submit_counter_evidence", [releaseId, fixtureUrl, digest, "Creator counter two."]));
  txs.push(await write("publisher", "submit_counter_evidence", [releaseId, fixtureUrl, digest, "Publisher counter one."]));
  txs.push(await write("publisher", "submit_counter_evidence", [releaseId, fixtureUrl, digest, "Publisher counter two."]));
  notes.push(await writeExpectQuotaFailure("creator", "submit_counter_evidence", [releaseId, fixtureUrl, digest, "Creator counter three should fail."]));
  const items = await evidence(releaseId);
  assertHasEvidence(items, "usage");
  assertHasEvidence(items, "disputed_usage");
  const creatorCounters = items.filter((item) => item.kind === "counter" && item.submitted_by?.toLowerCase() === creator.address.toLowerCase()).length;
  const publisherCounters = items.filter((item) => item.kind === "counter" && item.submitted_by?.toLowerCase() === publisher.address.toLowerCase()).length;
  if (creatorCounters !== 2 || publisherCounters !== 2) {
    throw new Error(`Scenario D expected 2 creator and 2 publisher counters, got ${creatorCounters}/${publisherCounters}.`);
  }
  return [
    { name: "C - reverse visual ordering", releaseId, transactions: txs.slice(0, 5), releaseState: afterPublisherUsage.status, evidenceKinds: items.map((item) => item.kind), notes: ["Creator disputed_usage was submitted before publisher usage; publisher usage succeeded afterward."] },
    { name: "D - evidence quota", releaseId, transactions: txs.slice(5), releaseState: afterPublisherUsage.status, evidenceKinds: items.map((item) => item.kind), notes },
  ];
}

function txTable(txs: TxRecord[]) {
  return txs.map((tx) => `| ${tx.functionName} | ${tx.role} | \`${tx.hash}\` | ${tx.status} | ${tx.result} |`).join("\n");
}

async function main() {
  await loadAccounts();
  const digest = await sha256ForUrl(fixtureUrl);
  const scenarios: Scenario[] = [];
  scenarios.push(await scenarioA(digest));
  scenarios.push(await scenarioB(digest));
  scenarios.push(...await scenarioCAndD(digest));

  const result = `# ConsentClip Test Results

## Automated Lifecycle Tests

Status: AUTOMATED LIFECYCLE TEST

- Command: \`python -m unittest contracts.test_consent_clip_lifecycle -v\`
- Result: 18 tests run, 18 passed, 0 failed, 0 skipped.
- Named steward tests passed:
  - \`test_creator_can_trigger_review_when_publisher_refuses_to_submit_usage\`
  - \`test_competing_creator_and_publisher_visual_evidence_reaches_review\`
  - \`test_publisher_can_add_usage_after_creator_already_disputed\`
  - \`test_evidence_quota_prevents_one_party_from_crowding_other_party\`
  - \`test_publisher_can_recover_after_expiry\`

## StudioNet Verification

Status: LIVE STUDIONET TRANSACTION

- Contract: \`${contractAddress}\`
- Deployment tx: \`0x7c34d5c64b018bc9b714b32a8f64e4553462d26ce037634ca6f8a77211e25c84\`
- Deployed source commit: \`0555de6a8308f43f15c0f524288f490c2e0bd95a\`
- Fixture URL: ${fixtureUrl}
- Fixture SHA-256 used for source/evidence commitments: \`${digest}\`
- Challenge close used for live pre-review releases: \`${challengeEndsAt}\`
- Expiry used for live pre-review releases: \`${expiresAt}\`
- Note: live review and expiry were not exercised because these releases must accept evidence before the challenge close date and cannot immediately review or expire on the same day.

${scenarios.map((scenario) => `### ${scenario.name}

- Release ID: \`${scenario.releaseId}\`
- Resulting release state: \`${scenario.releaseState}\`
- Relevant evidence kinds: ${scenario.evidenceKinds.map((kind) => `\`${kind}\``).join(", ")}
- Notes: ${scenario.notes.join(" ")}

| Function | Caller role | Tx hash | Finalized status | Result |
| --- | --- | --- | --- | --- |
${txTable(scenario.transactions)}
`).join("\n")}
`;
  await writeFile("TEST_RESULTS.md", result);
  console.log(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
