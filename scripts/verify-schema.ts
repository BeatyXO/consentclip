import { createAccount, createClient } from "genlayer-js";
import { chain, contractAddress, contractFunctions } from "../lib/config";

type HexAddress = `0x${string}`;

async function main() {
  if (!contractAddress) {
    throw new Error("NEXT_PUBLIC_CONSENTCLIP_CONTRACT_ADDRESS is required for schema verification.");
  }

  const client = createClient({ chain, account: createAccount() });
  const schema = await client.getContractSchema(contractAddress as HexAddress);
  const serialized = JSON.stringify(schema);
  const missing = contractFunctions.filter((name) => !serialized.includes(name));

  if (missing.length) {
    throw new Error(`Missing contract functions: ${missing.join(", ")}`);
  }

  console.log(`Schema verified for ${contractFunctions.length} ConsentClip functions.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
