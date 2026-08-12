import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

const address = process.env.NEXT_PUBLIC_CONSENTCLIP_CONTRACT_ADDRESS as `0x${string}` | undefined;
const privateKey = process.env.CONSENTCLIP_CYCLE_PRIVATE_KEY as `0x${string}` | undefined;
if (!address || !privateKey) throw new Error("NEXT_PUBLIC_CONSENTCLIP_CONTRACT_ADDRESS and CONSENTCLIP_CYCLE_PRIVATE_KEY are required.");

const contractAddress = address;
const account = createAccount(privateKey);
const client = createClient({ chain: studionet, account });

async function write(functionName: string, args: unknown[], value = 0n) {
  const hash = await client.writeContract({ address: contractAddress, functionName, args: args as never[], value });
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 12_000, retries: 90 });
  if (receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) throw new Error(`${functionName} failed: ${hash}`);
  console.log(`${functionName}: ${hash}`);
}

async function main() {
  const actor = account.address.toLowerCase();
  await write("create_release", ["StudioNet ConsentClip verification", "testimonial", actor, "Publisher may use this testimonial only on the designated campaign page.", "2027-01-01"], 10n ** 15n);
  await write("accept_release", ["1"]);
  await write("submit_terms_evidence", ["1", "https://example.com", "The public terms evidence for this live verification."]);
  await write("submit_usage_evidence", ["1", "https://example.com", "The public usage evidence for this live verification."]);
  await write("request_consent_review", ["1"]);
  const release = await client.readContract({ address: contractAddress, functionName: "get_release", args: ["1"] as never[] });
  console.log(`release 1: ${String(release)}`);
}

main().catch((error) => { console.error(error); process.exit(1); });
