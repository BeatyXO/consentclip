import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const key = process.env.CONSENTCLIP_TEST_KEY as `0x${string}` | undefined;
const address = process.env.NEXT_PUBLIC_CONSENTCLIP_CONTRACT_ADDRESS as `0x${string}` | undefined;
const method = process.env.CONSENTCLIP_WRITE_METHOD;
const args = JSON.parse(process.env.CONSENTCLIP_WRITE_ARGS ?? "[]") as unknown[];
const value = BigInt(process.env.CONSENTCLIP_WRITE_VALUE ?? "0");

if (!key || !address || !method) throw new Error("CONSENTCLIP_TEST_KEY, NEXT_PUBLIC_CONSENTCLIP_CONTRACT_ADDRESS, and CONSENTCLIP_WRITE_METHOD are required.");
const privateKey = key;
const contractAddress = address;
const functionName = method;

async function main() {
  const client = createClient({ chain: studionet, account: createAccount(privateKey) });
  console.log(await client.writeContract({ address: contractAddress, functionName, args: args as never[], value }));
}

main().catch((error) => { console.error(error); process.exit(1); });
