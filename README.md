# scaffold-eth2-greeter

Greeting contract and Next.js UI built on Scaffold-ETH 2, wired through the scaffold-eth hooks for typed contract reads and writes.

## Stack

- Scaffold-ETH 2 (Hardhat + Next.js + RainbowKit + wagmi v2 + viem)
- Tailwind CSS + DaisyUI
- TypeScript end-to-end with auto-generated typed contract bindings

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| Yarn | 3.x+ |
| Wallet | MetaMask works for local |

## Quick start

```bash
yarn install
yarn chain     # local Hardhat node in one terminal
yarn deploy    # deploys YourContract in another terminal
yarn start     # Next.js dev server
```

Open http://localhost:3000, connect a wallet, set a new greeting.

## Deploying to a testnet

Scaffold-ETH 2 reads RPC URLs from `packages/hardhat/.env` and `packages/nextjs/.env.local`. Recommended provider: Infura via [MetaMask Developer](https://developer.metamask.io). Set keys per network you target (e.g. `SEPOLIA_RPC_URL`, `LINEA_RPC_URL`), then `yarn deploy --network sepolia` and update `packages/nextjs/scaffold.config.ts` to include the chain.

## What's in here

This repo contains the customizations on top of the default Scaffold-ETH 2 starter:

- `packages/hardhat/contracts/YourContract.sol`: greeting contract with owner-only setter and event emission
- `packages/nextjs/app/page.tsx`: UI for reading and writing the greeting
- Custom scaffold-eth hooks usage (`useScaffoldReadContract`, `useScaffoldWriteContract`)

## How the hot-reload pipeline works

```
Edit contract -> yarn compile -> ABI auto-synced
                              -> packages/nextjs/contracts/deployedContracts.ts
                              -> hooks pick up new types instantly
```

No manual ABI copy. Edit, compile, the frontend is in sync.
