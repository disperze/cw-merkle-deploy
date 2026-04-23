import * as fs from 'fs';
import * as path from 'path';
import { getSigningClient, getSenderAddress } from './client';

async function main() {
  const wasmPath = path.resolve(__dirname, '..', '..', 'artifacts', 'cw20_merkle_airdrop.wasm');

  if (!fs.existsSync(wasmPath)) {
    throw new Error(`WASM artifact not found at: ${wasmPath}\nRun 'cargo wasm' first.`);
  }

  const wasm = fs.readFileSync(wasmPath);
  const client = await getSigningClient();
  const sender = await getSenderAddress();

  console.log(`Uploading WASM from: ${wasmPath}`);
  console.log(`Sender:              ${sender}`);

  const result = await client.upload(sender, wasm, 'auto');

  console.log('\n--- Upload Result ---');
  console.log(`Code ID:  ${result.codeId}`);
  console.log(`TX Hash:  ${result.transactionHash}`);
  console.log(`Gas Used: ${result.gasUsed}`);
  console.log('\nSet in .env:');
  console.log(`CODE_ID=${result.codeId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
