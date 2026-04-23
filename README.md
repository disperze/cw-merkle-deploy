# cw-merkle-deploy

Tools for generating balance files from a Cosmos genesis export and computing Merkle roots for on-chain registration.

## Prerequisites

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your values.

---

## Scripts

### 1. Export Balances

Reads a Cosmos `genesis.json` and writes one JSON file per denom into `./output/`, each containing the list of addresses and amounts for that denom.

```bash
npm run exportBalances -- <path/to/genesis.json> [denom1] [denom2] ...
```

**Arguments**

| Argument | Required | Description |
|---|---|---|
| `genesis.json` | yes | Path to the Cosmos genesis file |
| `denom...` | no | One or more denoms to export. Omit to export all denoms found. |

**Examples**

```bash
# Export a single denom
npm run exportBalances -- genesis.json uatom

# Export multiple denoms
npm run exportBalances -- genesis.json uatom ibc/ABC123

# Export all denoms found in the genesis
npm run exportBalances -- genesis.json
```

**Output**

Files are written to `./output/`, one per denom. Special characters in the denom name (`/`, `:`, etc.) are replaced with `_`.

```
output/
  uatom.json
  ibc_ABC123.json
```

Each file contains an array of `{ address, amount }` objects:

```json
[
  { "address": "cosmos1abc...", "amount": "1000000" },
  { "address": "cosmos1def...", "amount": "500000" }
]
```

---

### 2. Generate Merkle Root

Reads all `.json` files from a directory (the `./output/` directory produced by `exportBalances`) and prints the Merkle root for each denom.

```bash
npm run genMerkleRoot -- <directory>
```

**Arguments**

| Argument | Required | Description |
|---|---|---|
| `directory` | yes | Path to the directory containing the airdrop JSON files |

**Example**

```bash
npm run genMerkleRoot -- ./output
```

**Output**

Prints one line per file in the format `denom -> merkleRoot`:

```
uatom -> a3f1c2...
ibc/ABC123 -> 7b0e44...
```

Each Merkle root is computed using SHA-256 over `address + amount` pairs, sorted, and returned as a hex string without the `0x` prefix.

---

## Typical Workflow

```bash
# Step 1 — export balances for the desired denom(s) from the genesis
npm run exportBalances -- genesis.json uatom

# Step 2 — compute the Merkle root from the exported files
npm run genMerkleRoot -- ./output
```

The Merkle root printed in step 2 is what you register on-chain via `registerMerkleRoot`.
