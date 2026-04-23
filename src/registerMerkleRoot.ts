import * as fs from 'fs';
import * as path from 'path';
import { getSigningClient, getSenderAddress } from './client';
import { config } from './config';
import { Airdrop, AirdropAccount } from './airdrop';

async function main() {
  if (!config.contractAddress) {
    throw new Error('CONTRACT_ADDRESS is not set in .env. Run instantiate.ts first.');
  }
  if (!config.airdropFile) {
    throw new Error('AIRDROP_FILE is not set in .env.');
  }

  const airdropPath = path.resolve(__dirname, '..', config.airdropFile);
  if (!fs.existsSync(airdropPath)) {
    throw new Error(`Airdrop file not found: ${airdropPath}`);
  }

  const accounts: AirdropAccount[] = JSON.parse(fs.readFileSync(airdropPath, 'utf-8'));
  const airdrop = new Airdrop(accounts);
  const merkleRoot = airdrop.getMerkleRoot();

  console.log(`Airdrop file:  ${airdropPath}`);
  console.log(`Accounts:      ${accounts.length}`);
  console.log(`Merkle root:   ${merkleRoot}`);
  console.log(`Native token:  ${config.nativeToken}`);

  const client = await getSigningClient();
  const sender = await getSenderAddress();

  const result = await client.execute(
    sender,
    config.contractAddress,
    {
      register_merkle_root: {
        merkle_root: merkleRoot,
        native_token: config.nativeToken,
      },
    },
    'auto',
  );

  console.log('\n--- RegisterMerkleRoot Result ---');
  console.log(`TX Hash: ${result.transactionHash}`);

  const stageResp = await client.queryContractSmart(config.contractAddress, { latest_stage: {} }) as { latest_stage: number };
  console.log(`Stage:   ${stageResp.latest_stage}`);
  console.log('\nSet in .env:');
  console.log(`CLAIM_STAGE=${stageResp.latest_stage}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
