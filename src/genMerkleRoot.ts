import * as fs from 'fs';
import * as path from 'path';
import { Airdrop, AirdropAccount } from './airdrop';

async function main() {
  const dir = process.argv[2];
  if (!dir) {
    throw new Error('Usage: ts-node src/genMerkleRoot.ts <directory>');
  }

  const dirPath = path.resolve(dir);
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    throw new Error(`No JSON files found in: ${dirPath}`);
  }

  for (const file of files) {
    const denom = path.basename(file, '.json').replace(/_/g, '/');
    const accounts: AirdropAccount[] = JSON.parse(
      fs.readFileSync(path.join(dirPath, file), 'utf-8')
    );
    const merkleRoot = new Airdrop(accounts).getMerkleRoot();
    console.log(`${denom} -> ${merkleRoot}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
