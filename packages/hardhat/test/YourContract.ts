import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { YourContract } from "../typechain-types";

describe("YourContract", function () {
  // Deploy a fresh contract for each test via a snapshot, with the deployer as owner.
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("YourContract");
    const yourContract = (await factory.deploy(owner.address)) as YourContract;
    await yourContract.waitForDeployment();
    return { yourContract, owner, alice, bob };
  }

  describe("Deployment", function () {
    it("sets the owner and the initial greeting", async function () {
      const { yourContract, owner } = await loadFixture(deployFixture);
      expect(await yourContract.owner()).to.equal(owner.address);
      expect(await yourContract.greeting()).to.equal("Building Onchain Summer");
    });
  });

  describe("setGreeting", function () {
    it("updates the greeting and bumps both counters", async function () {
      const { yourContract, alice } = await loadFixture(deployFixture);

      await yourContract.connect(alice).setGreeting("gm");

      expect(await yourContract.greeting()).to.equal("gm");
      expect(await yourContract.totalCounter()).to.equal(1n);
      expect(await yourContract.userGreetingCounter(alice.address)).to.equal(1n);

      await yourContract.connect(alice).setGreeting("gm again");
      expect(await yourContract.totalCounter()).to.equal(2n);
      expect(await yourContract.userGreetingCounter(alice.address)).to.equal(2n);
    });

    it("emits GreetingChange with the sender, greeting, premium flag and value", async function () {
      const { yourContract, alice } = await loadFixture(deployFixture);
      await expect(yourContract.connect(alice).setGreeting("gm"))
        .to.emit(yourContract, "GreetingChange")
        .withArgs(alice.address, "gm", false, 0n);
    });

    it("marks the sender premium only when value is sent", async function () {
      const { yourContract, alice } = await loadFixture(deployFixture);

      await yourContract.connect(alice).setGreeting("free");
      expect(await yourContract.userPremium(alice.address)).to.equal(false);

      const value = ethers.parseEther("0.001");
      await yourContract.connect(alice).setGreeting("paid", { value });
      expect(await yourContract.userPremium(alice.address)).to.equal(true);
    });

    it("keeps the premium flag per user so a free greeting cannot clear another's", async function () {
      const { yourContract, alice, bob } = await loadFixture(deployFixture);

      await yourContract.connect(alice).setGreeting("paid", { value: ethers.parseEther("0.001") });
      expect(await yourContract.userPremium(alice.address)).to.equal(true);

      // Bob's free greeting must not touch Alice's flag.
      await yourContract.connect(bob).setGreeting("free");
      expect(await yourContract.userPremium(bob.address)).to.equal(false);
      expect(await yourContract.userPremium(alice.address)).to.equal(true);

      // Alice's own later free greeting clears only her flag.
      await yourContract.connect(alice).setGreeting("free again");
      expect(await yourContract.userPremium(alice.address)).to.equal(false);
    });
  });

  describe("receive", function () {
    it("accepts plain ETH transfers", async function () {
      const { yourContract, alice } = await loadFixture(deployFixture);
      const address = await yourContract.getAddress();
      const amount = ethers.parseEther("1");

      await alice.sendTransaction({ to: address, value: amount });

      expect(await ethers.provider.getBalance(address)).to.equal(amount);
    });
  });

  describe("withdraw", function () {
    it("reverts for a non-owner", async function () {
      const { yourContract, alice } = await loadFixture(deployFixture);
      await expect(yourContract.connect(alice).withdraw()).to.be.revertedWith("Not the owner");
    });

    it("sends the full balance to the owner", async function () {
      const { yourContract, owner, alice } = await loadFixture(deployFixture);
      const address = await yourContract.getAddress();
      const amount = ethers.parseEther("1");
      await alice.sendTransaction({ to: address, value: amount });

      const ownerBefore = await ethers.provider.getBalance(owner.address);
      const receipt = await (await yourContract.connect(owner).withdraw()).wait();
      // Account for the gas the owner paid on the withdraw transaction itself.
      const gas = receipt!.gasUsed * receipt!.gasPrice;

      expect(await ethers.provider.getBalance(address)).to.equal(0n);
      expect(await ethers.provider.getBalance(owner.address)).to.equal(ownerBefore + amount - gas);
    });
  });
});
