# WhiteToken ERC20

A fully-featured ERC20 token implementation built with Hardhat and viem tooling.

## Features

- Standard ERC20 implementation using OpenZeppelin contracts
- Owner-only minting functionality
- ERC20Permit support for gasless approvals
- Full test coverage
- Web interface for token interactions

## Tech Stack

- Solidity 0.8.20+
- Hardhat with viem tooling
- OpenZeppelin Contracts v5
- Next.js frontend
- TypeScript

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Create `.env` file based on `.env.example`

## Development Commands

```bash
# Start local blockchain node
npm run blockchain:node

# Compile contracts
npm run contract:compile

# Run tests
npm run contract:test

# Generate coverage report
npm run coverage

# Deploy to local network
npm run contract:deploy

# Deploy to Sepolia testnet
npm run contract:deploy:sepolia

# Deploy to Ethereum mainnet
npm run contract:deploy:mainnet

# Start frontend development server
npm run dev
```

## Testing

The project includes comprehensive tests covering:
- Deployment & basic properties
- Token transfers & balance management  
- Approval mechanism
- Owner-only minting functionality
- Security and edge cases
- ERC20Permit features

## Frontend

The UI provides interfaces for:
- Viewing token information
- Approving and transferring via transferFrom
- Connecting to various networks

## License

MIT
