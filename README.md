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
NEXT_PUBLIC_CUSTODI_CONTRACT_ADDRESS=0x30F4003bb5f0399ce7E4Dd4d8aC2b9D7c1A04d7B
NEXT_PUBLIC_GENLAYER_CHAIN=studionet
```

StudioNet deployment:

- Contract: `0x30F4003bb5f0399ce7E4Dd4d8aC2b9D7c1A04d7B`
- Deploy transaction: `0xc1d51e2e63749963da1b02be3beb9d658b8cd041d7e0084353a18aa45615c2fa`

## Current status

This repository contains the first complete scaffold: UI, wallet model, GenLayer wrapper, decision record, and contract draft. The next hardening pass should run `genvm-lint`, add direct tests for every transition, deploy to StudioNet, then wire live reads/writes against the deployed schema.
