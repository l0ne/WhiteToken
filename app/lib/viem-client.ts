import { createPublicClient, createWalletClient, http, parseAbi, Address, encodeFunctionData } from 'viem'
import { hardhat, sepolia } from 'viem/chains'
import * as dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

// ABI for the WhiteToken contract (minimal version for the functions we'll use)
export const tokenAbi = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)'
])

// Network configurations
export const NETWORK_CONFIGS = {
  hardhat: {
    name: 'Hardhat',
    chain: hardhat,
    rpcUrl: process.env.RPC_URL
  },
  sepolia: {
    name: 'Sepolia',
    chain: sepolia,
    rpcUrl: process.env.RPC_URL
  }
};

export type NetworkType = 'hardhat' | 'sepolia';

// Default to sepolia network
export const DEFAULT_NETWORK: NetworkType = process.env.CHAIN as NetworkType || 'sepolia';

// Helper to get the current network configuration
export const getNetworkConfig = (networkType: NetworkType = DEFAULT_NETWORK) => {
  return NETWORK_CONFIGS[networkType];
};

// Default token address for backward compatibility
export const TOKEN_ADDRESS = '0x1b96FC4e081D0A44Fad54F70d37Aa76ebff77ad7' as Address;

// Function to create client for selected network
export const createClient = (network: NetworkType = DEFAULT_NETWORK) => {
  const config = getNetworkConfig(network);
  
  return {
    publicClient: createPublicClient({
      chain: config.chain,
      transport: http(config.rpcUrl)
    }),
    walletClient: createWalletClient({
      chain: config.chain,
      transport: http(config.rpcUrl)
    })
  };
};

// For backward compatibility, export these directly
// These will use the default network
export const publicClient = createClient().publicClient;
export const walletClient = createClient().walletClient;

// Simple utility function to encode contract function calls
export const encodeTokenTransfer = (to: Address, amount: bigint) => {
  return encodeFunctionData({
    abi: tokenAbi,
    functionName: 'transfer',
    args: [to, amount]
  })
}

export const encodeTokenApprove = (spender: Address, amount: bigint) => {
  return encodeFunctionData({
    abi: tokenAbi,
    functionName: 'approve',
    args: [spender, amount]
  })
}

export const encodeTokenTransferFrom = (from: Address, to: Address, amount: bigint) => {
  return encodeFunctionData({
    abi: tokenAbi,
    functionName: 'transferFrom',
    args: [from, to, amount]
  })
}
