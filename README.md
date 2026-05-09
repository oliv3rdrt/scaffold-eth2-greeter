# Scaffold-ETH 2 - Starter Exploration

Testing out [Scaffold-ETH 2](https://scaffoldeth.io) - the fastest way to go from zero to a full-stack dApp. Bootstrapped a project and customized the example contract.

## Stack

| Layer | Tech |
|---|---|
| Smart contracts | Hardhat (switched to Foundry option) |
| Frontend | Next.js 14 (App Router) |
| Wallet | RainbowKit |
| Chain hooks | Wagmi v2 + viem |
| Hot reload | Contract artifacts auto-sync on compile |

## What I explored

- `useScaffoldReadContract` - typed reads from deployed contracts, auto-refreshed
- `useScaffoldWriteContract` - writes with built-in toast notifications
- `useScaffoldEventHistory` - paginated event log from contract events
- `ContractUI` - the auto-generated UI from contract ABI (great for demos)
- `Address` + `Balance` components - pre-built Ethereum-aware display components
- Debug page at `/debug` - inspect all deployed contracts and call any function

## Key takeaways

- The contract hot-reload on compile is genuinely magical for fast iteration
- The auto-generated `/debug` page replaces 80% of what I'd usually open Etherscan for
- Scaffold hooks (`useScaffoldReadContract`) are thin wrappers over wagmi - easy to understand the layer
- Good starting point for hackathons; for production you'd likely eject the scaffold-specific abstractions
