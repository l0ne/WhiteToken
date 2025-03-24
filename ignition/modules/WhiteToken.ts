// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment variables
const deployerAddress = process.env.DEPLOYER_ADDRESS; // Default: first Hardhat account
const initialMintAmount = process.env.INITIAL_MINT_AMOUNT || "1000000000000000000000"; // Default: 1000 tokens

console.log('Deployer address:', deployerAddress);

const WhiteTokenModule = buildModule("WhiteTokenModule", (m) => {
  // Use environment variables with fallbacks
  const initialOwner = m.getParameter("initialOwner", deployerAddress);
  
  // Deploy the WhiteToken contract
  const whiteToken = m.contract("WhiteToken", [initialOwner]);
  
  // Optional: Mint some initial tokens to the owner
  const mintAmount = m.getParameter("initialMintAmount", BigInt(initialMintAmount));
  const shouldMint = m.getParameter("shouldMint", true);
  
  if (shouldMint) {
    m.call(whiteToken, "mint", [initialOwner, mintAmount]);
  }
  
  return { whiteToken };
});

export default WhiteTokenModule;
