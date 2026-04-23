#!/usr/bin/env ts-node

/**
 * Cosmos Genesis Balance Exporter
 *
 * Usage:
 *   ts-node src/exportBalances.ts <genesis.json> [denom1] [denom2] ...
 *
 * Examples:
 *   ts-node src/exportBalances.ts genesis.json uatom
 *   ts-node src/exportBalances.ts genesis.json uatom ibc/ABC123 factory/cosmos1.../token
 *   ts-node src/exportBalances.ts genesis.json          ← exports ALL denoms found
 */

import * as fs from "fs";
import * as path from "path";

const OUTPUT_DIR = "./output";

interface Coin {
  denom: string;
  amount: string;
}

interface BankBalance {
  address: string;
  coins: Coin[];
}

interface BalanceEntry {
  address: string;
  amount: string;
}

function denomToFilename(denom: string): string {
  return denom.replace(/[/\\:*?"<>|]/g, "_");
}

function usage(): never {
  console.error(
    "Usage: ts-node src/exportBalances.ts <path/to/genesis.json> [denom1 denom2 ...]"
  );
  process.exit(1);
}

const [, , genesisArg, ...denomArgs] = process.argv;

if (!genesisArg) usage();

const genesisPath = path.resolve(genesisArg);
if (!fs.existsSync(genesisPath)) {
  console.error(`Error: genesis file not found at "${genesisPath}"`);
  process.exit(1);
}

console.log(`Reading genesis file: ${genesisPath}`);
let genesis: Record<string, unknown>;
try {
  const raw = fs.readFileSync(genesisPath, "utf8");
  genesis = JSON.parse(raw) as Record<string, unknown>;
} catch (err) {
  console.error(`Error parsing genesis file: ${(err as Error).message}`);
  process.exit(1);
}

const appState = (genesis.app_state ?? genesis) as Record<string, unknown>;
const bank = appState?.bank as Record<string, unknown> | undefined;
const bankBalances = bank?.balances as BankBalance[] | undefined;

if (!Array.isArray(bankBalances)) {
  console.error(
    'Error: could not find "app_state.bank.balances" array in genesis file.'
  );
  process.exit(1);
}

console.log(`Found ${bankBalances.length} accounts in bank balances.`);

let targetDenoms: string[];
if (denomArgs.length === 0) {
  const denomSet = new Set<string>();
  for (const { coins } of bankBalances) {
    if (Array.isArray(coins)) {
      for (const { denom } of coins) denomSet.add(denom);
    }
  }
  targetDenoms = [...denomSet];
  console.log(
    `No denoms specified — exporting all ${targetDenoms.length} denoms found.`
  );
} else {
  targetDenoms = denomArgs;
  console.log(`Filtering for denom(s): ${targetDenoms.join(", ")}`);
}

const denomMap = new Map<string, BalanceEntry[]>(
  targetDenoms.map((d) => [d, []])
);

for (const { address, coins } of bankBalances) {
  if (!address || !Array.isArray(coins)) continue;

  for (const { denom, amount } of coins) {
    if (denomMap.has(denom)) {
      denomMap.get(denom)!.push({ address, amount });
    }
  }
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

let exported = 0;
let skipped = 0;

for (const [denom, entries] of denomMap) {
  if (entries.length === 0) {
    console.warn(`  ⚠  No balances found for denom "${denom}" — skipping.`);
    skipped++;
    continue;
  }

  const filename = `${denomToFilename(denom)}.json`;
  const outPath = path.join(OUTPUT_DIR, filename);

  fs.writeFileSync(outPath, JSON.stringify(entries, null, 2), "utf8");
  console.log(`  ✓  ${denom} → ${filename}  (${entries.length} addresses)`);
  exported++;
}

console.log(
  `\nDone. ${exported} file(s) written to "${OUTPUT_DIR}"` +
    (skipped ? `, ${skipped} denom(s) skipped (no balances).` : ".")
);
