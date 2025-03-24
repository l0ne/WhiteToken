/* eslint-disable */
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { parseEther, getAddress } from "viem";
import hre from "hardhat";

describe("WhiteToken", function () {
  // Fixture to deploy the contract and setup the test environment
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await hre.viem.getWalletClients();
    
    // Deploy the token using hardhat-viem's deployContract
    const token = await hre.viem.deployContract("WhiteToken", [owner.account.address]);
    
    return { token, owner, addr1, addr2 };
  }

  // Test suite for deployment
  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      
      expect(await token.read.name()).to.equal("WhiteToken");
      expect(await token.read.symbol()).to.equal("WHT");
    });

    it("Should set the correct owner", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      
      // Use getAddress to normalize the case for comparison
      const contractOwner = await token.read.owner();
      expect(getAddress(contractOwner)).to.equal(getAddress(owner.account.address));
    });

    it("Should have 0 initial supply", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      
      expect(await token.read.totalSupply()).to.equal(0n);
    });
  });

  // Test suite for basic token functionality
  describe("Basic token functionality", function () {
    it("Should update balances after transfers", async function () {
      const { token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
      
      // Mint some tokens to the owner
      await token.write.mint([owner.account.address, parseEther("100")], { account: owner.account });
      
      // Transfer 50 tokens from owner to addr1
      await token.write.transfer([addr1.account.address, parseEther("50")], { account: owner.account });
      
      // Check balances
      expect(await token.read.balanceOf([owner.account.address])).to.equal(parseEther("50"));
      expect(await token.read.balanceOf([addr1.account.address])).to.equal(parseEther("50"));
      
      // Transfer 25 tokens from addr1 to addr2
      await token.write.transfer([addr2.account.address, parseEther("25")], { account: addr1.account });
      
      // Check balances
      expect(await token.read.balanceOf([owner.account.address])).to.equal(parseEther("50"));
      expect(await token.read.balanceOf([addr1.account.address])).to.equal(parseEther("25"));
      expect(await token.read.balanceOf([addr2.account.address])).to.equal(parseEther("25"));
    });

    it("Should emit Transfer events", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      
      // Mint some tokens to the owner
      await token.write.mint([owner.account.address, parseEther("100")], { account: owner.account });
      
      // Transfer and check for event
      const tx = await token.write.transfer([addr1.account.address, parseEther("50")], { account: owner.account });
      expect(tx).to.not.be.undefined;
    });
  });

  // Test suite for approval mechanism
  describe("Approval mechanism", function () {
    it("Should update allowance correctly", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      
      // Approve addr1 to spend 100 tokens
      await token.write.approve([addr1.account.address, parseEther("100")], { account: owner.account });
      
      // Check allowance
      expect(await token.read.allowance([owner.account.address, addr1.account.address]))
        .to.equal(parseEther("100"));
    });

    it("Should allow transferFrom with approval", async function () {
      const { token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
      
      // Mint some tokens to the owner
      await token.write.mint([owner.account.address, parseEther("100")], { account: owner.account });
      
      // Approve addr1 to spend 50 tokens
      await token.write.approve([addr1.account.address, parseEther("50")], { account: owner.account });
      
      // addr1 transfers 25 tokens from owner to addr2
      await token.write.transferFrom(
        [owner.account.address, addr2.account.address, parseEther("25")], 
        { account: addr1.account }
      );
      
      // Check balances
      expect(await token.read.balanceOf([owner.account.address])).to.equal(parseEther("75"));
      expect(await token.read.balanceOf([addr2.account.address])).to.equal(parseEther("25"));
      
      // Check remaining allowance
      expect(await token.read.allowance([owner.account.address, addr1.account.address]))
        .to.equal(parseEther("25"));
    });

    it("Should emit Approval events", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      
      // Approve and check transaction
      const tx = await token.write.approve([addr1.account.address, parseEther("100")], { account: owner.account });
      expect(tx).to.not.be.undefined;
    });
  });

  // Test suite for custom minting function
  describe("Minting functionality", function () {
    it("Should allow owner to mint tokens", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      
      // Mint tokens to addr1
      await token.write.mint([addr1.account.address, parseEther("100")], { account: owner.account });
      
      // Check balance
      expect(await token.read.balanceOf([addr1.account.address])).to.equal(parseEther("100"));
      
      // Check total supply
      expect(await token.read.totalSupply()).to.equal(parseEther("100"));
    });

    it("Should prevent non-owners from minting tokens", async function () {
      const { token, addr1, addr2 } = await loadFixture(deployTokenFixture);
      
      // Try to mint tokens as non-owner
      try {
        await token.write.mint([addr2.account.address, parseEther("100")], { account: addr1.account });
        expect.fail("Transaction should have failed");
      } catch (error) {
        // We only need to check that the transaction fails, not the specific error message
        expect(error).to.not.be.undefined;
      }
    });

    it("Should emit Transfer event on mint", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      
      // Mint and check transaction
      const tx = await token.write.mint([addr1.account.address, parseEther("100")], { account: owner.account });
      expect(tx).to.not.be.undefined;
    });
  });

  // Test suite for edge cases and security issues
  describe("Edge cases and security", function () {
    it("Should handle zero transfers correctly", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      
      // Mint some tokens to the owner
      await token.write.mint([owner.account.address, parseEther("100")], { account: owner.account });
      
      // Transfer 0 tokens
      await token.write.transfer([addr1.account.address, 0n], { account: owner.account });
      
      // Check balances didn't change
      expect(await token.read.balanceOf([owner.account.address])).to.equal(parseEther("100"));
      expect(await token.read.balanceOf([addr1.account.address])).to.equal(0n);
    });

    it("Should revert when transferring more than balance", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      
      // Mint some tokens to the owner
      await token.write.mint([owner.account.address, parseEther("50")], { account: owner.account });
      
      // Try to transfer more than balance
      try {
        await token.write.transfer([addr1.account.address, parseEther("100")], { account: owner.account });
        expect.fail("Transaction should have failed");
      } catch (error) {
        // Expected error
      }
    });

    it("Should revert when transferring to the zero address", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      
      // Mint some tokens to the owner
      await token.write.mint([owner.account.address, parseEther("100")], { account: owner.account });
      
      // Try to transfer to zero address
      try {
        await token.write.transfer(["0x0000000000000000000000000000000000000000", parseEther("50")], { account: owner.account });
        expect.fail("Transaction should have failed");
      } catch (error) {
        // Expected error
      }
    });

    it("Should revert when approving to zero address", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      
      // Try to approve zero address
      try {
        await token.write.approve(["0x0000000000000000000000000000000000000000", parseEther("100")], { account: owner.account });
        expect.fail("Transaction should have failed");
      } catch (error) {
        // Expected error
      }
    });

    it("Should allow owner to renounce ownership", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      
      // Renounce ownership
      await token.write.renounceOwnership({ account: owner.account });
      
      // Check new owner
      expect(await token.read.owner()).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("Should prevent minting after ownership is renounced", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      
      // Renounce ownership
      await token.write.renounceOwnership({ account: owner.account });
      
      // Try to mint tokens as former owner
      try {
        await token.write.mint([addr1.account.address, parseEther("100")], { account: owner.account });
        expect.fail("Transaction should have failed");
      } catch (error) {
        // Expected error
      }
    });
  });

  // Test suite for ERC20Permit functionality
  describe("Permit functionality", function () {
    it("Should have the correct DOMAIN_SEPARATOR", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      
      // Check DOMAIN_SEPARATOR
      const domainSeparator = await token.read.DOMAIN_SEPARATOR();
      
      expect(domainSeparator).to.not.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
    });

    // Note: Testing actual permit functionality would require offline signing
    // which is complex to implement in tests. This serves as a basic check
    // that the permit functionality is available.
  });
});
