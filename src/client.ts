import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { GasPrice } from '@cosmjs/stargate';
import { config } from './config';

export async function getWallet(): Promise<DirectSecp256k1HdWallet> {
  return DirectSecp256k1HdWallet.fromMnemonic(config.mnemonic, {
    prefix: config.addressPrefix,
  });
}

export async function getSenderAddress(): Promise<string> {
  const wallet = await getWallet();
  const [account] = await wallet.getAccounts();
  return account.address;
}

export async function getSigningClient(): Promise<SigningCosmWasmClient> {
  const wallet = await getWallet();
  return SigningCosmWasmClient.connectWithSigner(config.rpcEndpoint, wallet, {
    gasPrice: GasPrice.fromString(config.gasPrice),
  });
}
