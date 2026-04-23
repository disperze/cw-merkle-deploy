import { getSigningClient, getSenderAddress } from './client';
import { config } from './config';

async function main() {
  if (!config.codeId) {
    throw new Error('CODE_ID is not set in .env. Run upload.ts first.');
  }

  const client = await getSigningClient();
  const sender = await getSenderAddress();

  console.log(`Instantiating code ID: ${config.codeId}`);
  console.log(`Owner:                 ${sender}`);

  const result = await client.instantiate(
    sender,
    config.codeId,
    { owner: sender },
    'cw20-merkle-airdrop',
    'auto',
  );

  console.log('\n--- Instantiate Result ---');
  console.log(`Contract Address: ${result.contractAddress}`);
  console.log(`TX Hash:          ${result.transactionHash}`);
  console.log('\nSet in .env:');
  console.log(`CONTRACT_ADDRESS=${result.contractAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
