# Custodi

Custodi is a deposit-backed physical item handoff app for GenLayer. A lender opens a case, the borrower accepts, both sides register pickup and return evidence, and GenLayer consensus decides whether new damage happened during custody.

The project is built as a frontend + Intelligent Contract only. There is no backend database; the contract is intended to be the source of truth.

## Stack

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- `genlayer-js@1.1.8`
- GenLayer Intelligent Contract in `contracts/custodi.py`

## Why GenLayer is central

The core question is not deterministic: did the returned item show new material damage compared with pickup evidence? A normal smart contract cannot inspect public photo evidence or reason over messy condition descriptions. A centralized app could decide, but then both parties must trust that operator.

Custodi uses GenLayer only where consensus matters: the damage review. Registration, evidence storage, access control, and settlement math remain deterministic.

## Routes

- `/` — one-screen product landing page
- `/cases` — public case explorer
- `/cases/new` — create a handoff
- `/cases/[id]` — shareable case detail and verdict view
- `/evidence` — evidence registry and submission form
- `/dashboard` — protocol desk

## Contract workflow

1. `create_handoff` — payable lender write that locks a deposit.
2. `accept_handoff` — borrower accepts the case.
3. `submit_pickup_evidence` — either party registers pickup evidence.
4. `submit_return_evidence` — either party registers return evidence.
5. `request_damage_review` — either party triggers GenLayer consensus.
6. `release_without_dispute` — lender can release the deposit without consensus.

## Local setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

After deploying the contract to StudioNet, set:

```bash
NEXT_PUBLIC_CUSTODI_CONTRACT_ADDRESS=0x5c7c148E4A6b9dac587F2912b97E378735E4525c
NEXT_PUBLIC_GENLAYER_CHAIN=studionet
```

StudioNet deployment:

- Contract: `0x5c7c148E4A6b9dac587F2912b97E378735E4525c`
- Deploy transaction: `0xb7e023ac7e32c7eaaba8923f00c3b305201b6d852335153c7adfda00843e625d`

Full-cycle StudioNet smoke test on the fixed contract:

- `create_handoff`: `0xfe8d09663c23806a715804e638d47c6efd436cfe56137ec471b7ed6849b6dc32`
- `accept_handoff`: `0xa02be370f440e8f7f9e8efbf224a9f5986ea514e45876d5a8924c1317cead73e`
- `submit_pickup_evidence`: `0x4ee7e0e31294937d8dcafcec092e095b6f2b389f21c1d49937ea84743241368a`
- `submit_return_evidence`: `0x0563baf5431433c08e633c032227215eb2c17b1307dd2d867b3074a91f62b583`
- `request_damage_review`: `0x0e510b1a5eeb42f8be479be846a422d0222f668a36b8c40177ad28bc1cf68f20`
- Final case state: `released`, `verdict_class: no_new_damage`, `release_to_borrower: 100`, `release_to_lender: 0`

## Current status

This repository contains the first complete scaffold: UI, wallet model, GenLayer wrapper, decision record, and a deployed contract verified through one full StudioNet damage-review cycle. The next hardening pass should add direct tests for every transition and wire live frontend reads/writes against the deployed schema.
