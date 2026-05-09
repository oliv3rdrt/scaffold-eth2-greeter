```
   ___           ___          _      _    ___ _____ _  _   ___  
  / __| __ __ _ / _|/ _|___| |__ _| |__/ __|_   _| || | |__ \ 
  \__ \/ _/ _` |  _|  _/ _ \ / _` | '_ \__ \ | | | __ |/ /  / / 
  |___/\__\__,_|_| |_| \___/_\__,_|_.__/___/ |_| |_||_|___\/_/  

  Full-stack dApp starter with hot-reload contracts.
```

[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.x-yellow.svg)](https://hardhat.org)
[![RainbowKit](https://img.shields.io/badge/RainbowKit-2.x-7b3fe4.svg)](https://rainbowkit.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Scaffold-ETH 2](https://scaffoldeth.io) is the fastest path from zero to a
working full-stack dApp. This repo holds the customisations made on top of the
default starter: a `YourContract` greeting contract and a Next.js UI component
that interacts with it via the scaffold-eth hooks.

---

## Table of Contents

- [What is Scaffold-ETH 2](#what-is-scaffold-eth-2)
- [The killer feature](#the-killer-feature)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [The contract](#the-contract)
- [The UI](#the-ui)
- [Scaffold hooks](#scaffold-hooks)
- [The hot-reload pipeline](#the-hot-reload-pipeline)
- [The debug page](#the-debug-page)
- [Deploying to a testnet](#deploying-to-a-testnet)
- [Forking off the starter](#forking-off-the-starter)
- [References](#references)

---

## What is Scaffold-ETH 2

A pre-configured monorepo that bundles:

- **Hardhat or Foundry** for contracts
- **Next.js 14 (App Router)** for the frontend
- **RainbowKit + Wagmi v2 + viem** for wallet connection and chain reads
- **TypeScript end to end**, with auto-generated typed contract bindings
- **Tailwind CSS + DaisyUI** for the UI

The packages are wired together so that compiling a contract regenerates its
ABI and types in the frontend in a single step. There is no manual ABI copy.

## The killer feature

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│   Edit contract  ─►  yarn compile  ─►  ABI auto-synced        │
│                                                               │
│                    ABI lands in:                              │
│                    packages/nextjs/contracts/deployedContracts.ts │
│                                                               │
│   useScaffoldReadContract / useScaffoldWriteContract pick up  │
│   the new types instantly. Zero copy-paste, zero stale ABIs.  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

If you have ever shipped a hot patch to a contract and forgotten to update the
frontend ABI, you understand why this matters.

## Prerequisites

| Tool    | Version | Notes                                              |
|---------|---------|----------------------------------------------------|
| Node.js | 20+     | Required by the upstream Scaffold-ETH 2 template   |
| Yarn    | 3.x+    | Scaffold-ETH 2 ships a `.yarnrc.yml`               |
| Git     | any     |                                                    |
| Wallet  | any     | MetaMask works for local testing                   |

> The upstream Scaffold-ETH 2 template uses Yarn workspaces. npm and pnpm
> can be made to work but the project's docs assume Yarn.

## Quick start

This repo holds **only** the customisations. Bootstrap the full starter, then
drop these files into the right packages:

```bash
# 1. Bootstrap the upstream template (one time)
npx create-eth@latest scaffold-eth-app
cd scaffold-eth-app

# 2. Replace the example contract with the one from this repo
cp /path/to/this-repo/packages/hardhat/contracts/YourContract.sol \
   packages/hardhat/contracts/YourContract.sol

# 3. Replace or extend the example component
cp /path/to/this-repo/packages/nextjs/components/GreetingUI.tsx \
   packages/nextjs/components/GreetingUI.tsx

# 4. Run everything (3 separate terminals)
yarn chain         # local hardhat node on :8545
yarn deploy        # compile + deploy YourContract to local chain
yarn start         # next dev server on :3000
```

Open http://localhost:3000.

## Project structure

This repo (the **customisations** only):

```
scaffold-eth2-starter/
├── packages/
│   ├── hardhat/
│   │   └── contracts/
│   │       └── YourContract.sol      # greeting contract with payable premium tier
│   └── nextjs/
│       └── components/
│           └── GreetingUI.tsx        # uses useScaffoldReadContract/WriteContract
└── README.md
```

The full Scaffold-ETH 2 monorepo (after `create-eth`) looks like:

```
scaffold-eth-app/
├── packages/
│   ├── hardhat/
│   │   ├── contracts/                # Your Solidity goes here
│   │   ├── deploy/                   # Deploy scripts
│   │   ├── test/                     # Hardhat tests
│   │   └── hardhat.config.ts
│   └── nextjs/
│       ├── app/                      # Next.js App Router pages
│       ├── components/
│       │   └── scaffold-eth/         # Pre-built Address, Balance, AddressInput
│       ├── contracts/
│       │   └── deployedContracts.ts  # AUTO-GENERATED ABIs and addresses
│       ├── hooks/
│       │   └── scaffold-eth/         # useScaffoldReadContract, etc.
│       └── utils/
├── package.json                      # Workspaces root
└── yarn.lock
```

## The contract

`YourContract.sol`:

- Stores a `greeting` string and a per-user `userGreetingCounter`
- `setGreeting()` is `payable`; sending ETH unlocks a `premium` flag
- Emits `GreetingChange(setter, newGreeting, premium, value)`
- Owner can `withdraw()` ETH that piled up from premium calls
- Uses `hardhat/console.sol` for debug logging during tests

A small contract, but it exercises events, payable, owner-gated withdrawal,
and per-user accounting. Enough surface to demo every scaffold-eth hook.

## The UI

`GreetingUI.tsx` shows:

- Current greeting (live, via `useScaffoldReadContract`)
- Total counter and your personal counter
- A text input + "premium" checkbox + submit
- The submit calls `useScaffoldWriteContract({ functionName: "setGreeting", args, value })`

## Scaffold hooks

Thin, typed wrappers over wagmi v2 that auto-import the right ABI from
`deployedContracts.ts`:

| Hook                          | Wraps                | Notes                                |
|-------------------------------|----------------------|--------------------------------------|
| `useScaffoldReadContract`     | `useReadContract`    | Auto-pulls ABI by `contractName`     |
| `useScaffoldWriteContract`    | `useWriteContract`   | Returns `{ writeContractAsync, isMining }` |
| `useScaffoldEventHistory`     | `getLogs` + paging   | Paginated `Transfer` events etc.     |
| `useScaffoldWatchContractEvent` | `useWatchContractEvent` | Live event subscription          |
| `useDeployedContractInfo`     | `deployedContracts`  | Returns address + ABI for a contract |

You **could** drop down to plain wagmi at any point. The scaffold hooks are
not opinionated; they just save you from importing the ABI by hand every time.

## The hot-reload pipeline

```
   you save YourContract.sol
            │
            ▼
   yarn compile (hardhat)
            │
            ▼
   artifacts → ABI extracted
            │
            ▼
   packages/nextjs/contracts/deployedContracts.ts (regenerated)
            │
            ▼
   TypeScript picks up new types
            │
            ▼
   useScaffoldReadContract / WriteContract
   give you the new functions in IntelliSense
```

In practice you run `yarn deploy` after edits (which compiles AND deploys to
the local node), and the frontend hot-reloads with the new ABI in seconds.

## The debug page

Visit `/debug`. Scaffold-ETH 2 auto-generates a UI for **every** function on
**every** deployed contract:

- Read functions get an input form and an "Execute" button
- Write functions get the same plus a value field and ETH/gas controls
- Events get a paginated log viewer

This replaces 80% of what you would otherwise open Etherscan for during
local development.

## Deploying to a testnet

```bash
# 1. Set deployer key and RPC in packages/hardhat/.env
PRIVATE_KEY=0x...
ALCHEMY_API_KEY=...

# 2. Deploy to Sepolia
yarn deploy --network sepolia

# 3. Update packages/nextjs/scaffold.config.ts
#    so the frontend points at sepolia by default
```

`deployedContracts.ts` is regenerated for the deployed network, so the
frontend works against testnet immediately.

## Forking off the starter

Once you have shipped the bootstrap, the choice is whether to keep the
scaffold-eth abstractions long-term:

| Stay with scaffold-eth                  | Eject (drop-in plain wagmi)                   |
|-----------------------------------------|----------------------------------------------|
| You like the auto-ABI sync              | You want to control the build pipeline       |
| You ship demos / hackathon projects     | You have a custom contract registry          |
| Your contracts deploy from this repo    | Your contracts live in a separate repo       |
| You use the `/debug` page in prod       | You have your own admin UI                   |

For most teams, keeping the auto-ABI sync is worth keeping the rest. Ejecting
is a one-day project if you change your mind.

## References

- [Scaffold-ETH 2 docs](https://docs.scaffoldeth.io)
- [Site](https://scaffoldeth.io)
- [GitHub](https://github.com/scaffold-eth/scaffold-eth-2)
- [Bootstrap CLI](https://github.com/scaffold-eth/create-eth)

## License

MIT
