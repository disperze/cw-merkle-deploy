import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  rpcEndpoint: requireEnv('RPC_ENDPOINT'),
  mnemonic: requireEnv('MNEMONIC'),
  chainId: requireEnv('CHAIN_ID'),
  gasPrice: requireEnv('GAS_PRICE'),
  addressPrefix: requireEnv('ADDRESS_PREFIX'),
  nativeToken: process.env['NATIVE_TOKEN'] ?? 'umlg',
  codeId: process.env['CODE_ID'] ? parseInt(process.env['CODE_ID']) : undefined,
  contractAddress: process.env['CONTRACT_ADDRESS'],
  airdropFile: process.env['AIRDROP_FILE'],
  claimAddress: process.env['CLAIM_ADDRESS'],
  claimStage: process.env['CLAIM_STAGE'] ? parseInt(process.env['CLAIM_STAGE']) : undefined,
};
