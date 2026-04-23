import * as fs from 'fs';
import * as path from 'path';
import { getSigningClient, getSenderAddress } from './client';
import { config } from './config';
import { Airdrop, AirdropAccount } from './airdrop';

async function main() {
  if (!config.contractAddress) {
    throw new Error('CONTRACT_ADDRESS is not set in .env.');
  }
  if (!config.airdropFile) {
    throw new Error('AIRDROP_FILE is not set in .env.');
  }
  if (!config.claimAddress) {
    throw new Error('CLAIM_ADDRESS is not set in .env.');
  }
  if (config.claimStage === undefined) {
    throw new Error('CLAIM_STAGE is not set in .env.');
  }

  const airdropPath = path.resolve(__dirname, '..', config.airdropFile);
  const accounts: AirdropAccount[] = JSON.parse(fs.readFileSync(airdropPath, 'utf-8'));

  const entry = accounts.find((a) => a.address === config.claimAddress);
  if (!entry) {
    throw new Error(`Address ${config.claimAddress} not found in airdrop file.`);
  }

  const airdrop = new Airdrop(accounts);
  const proof = airdrop.getMerkleProof(entry);

  if (!airdrop.verify(proof, entry)) {
    throw new Error('Proof failed local verification. Check airdrop file integrity.');
  }

  console.log(`Claiming for: ${entry.address}`);
  console.log(`Amount:       ${entry.amount}`);
  console.log(`Stage:        ${config.claimStage}`);
  console.log(`Proof length: ${proof.length}`);

  const client = await getSigningClient();
  const sender = await getSenderAddress();

  const result = await client.execute(
    sender,
    config.contractAddress,
    {
      claim: {
        stage: config.claimStage,
        amount: entry.amount,
        proof,
      },
    },
    'auto',
  );

  console.log('\n--- Claim Result ---');
  console.log(`TX Hash: ${result.transactionHash}`);
  console.log('Claim successful.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
