const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");

async function deployFixture() {
    const [deployer, walletOwner, user1, user2] = await ethers.getSigners();

    const initialSupply = 1_000n;

    //deploy token
    const myToken = await ethers.deployContract("MyToken", ["Lion Coin", "LEO", initialSupply, walletOwner.address,]);
    await myToken.waitForDeployment();

    //deploy wallet
    const controlledWallet = await ethers.deployContract("ControlledWallet", [walletOwner.address,]);
    await controlledWallet.waitForDeployment();

    //get contract addresses
    const walletAddress = await controlledWallet.getAddress();
    const tokenAddress = await myToken.getAddress();

    //send eth to wallet contract
    const oneEth = ethers.parseEther("1");
    const txFundEth = await controlledWallet.connect(user1).fundme({ value: oneEth });
    await txFundEth.wait();

    const decimals = await myToken.decimals();

    return { deployer, walletOwner, user1, user2, myToken, controlledWallet, walletAddress, initialSupply, oneEth, decimals };
}

describe("MyToken", function () {
    it("mints total supply to initial owner", async function () {
        const { myToken, walletOwner, initialSupply, decimals } = await loadFixture(deployFixture);

        const expectedTotal = initialSupply * 10n ** BigInt(decimals);
        const totalSupply = await myToken.totalSupply();
        const ownerBalance = await myToken.balanceOf(walletOwner.address);

        expect(totalSupply).to.equal(expectedTotal);
        expect(ownerBalance).to.equal(expectedTotal);
    });

    it("has correct name and symbol", async function () {
        const { myToken } = await loadFixture(deployFixture);

        expect(await myToken.name()).to.equal("Lion Coin");
        expect(await myToken.symbol()).to.equal("LEO");
    });
});

describe("ControlledWallet - pause / unpause", function () {
    it("owner can pause and unpause", async function () {
        const { controlledWallet, walletOwner } = await loadFixture(deployFixture);

        const txPause = await controlledWallet.connect(walletOwner).pause();
        await txPause.wait();
        expect(await controlledWallet.paused()).to.equal(true);

        const txUnpause = await controlledWallet.connect(walletOwner).unpause();
        await txUnpause.wait();
        expect(await controlledWallet.paused()).to.equal(false);
    });
});

describe("ControlledWallet - fundme", function () {
    it("accepts eth and increases contract balance", async function () {
        const { controlledWallet, user1, walletAddress } = await loadFixture(deployFixture);

        const before = await ethers.provider.getBalance(walletAddress);
        const amount = ethers.parseEther("0.2");

        const tx = await controlledWallet.connect(user1).fundme({ value: amount });
        await tx.wait();

        const after = await ethers.provider.getBalance(walletAddress);
        expect(after - before).to.equal(amount);
    });
});

describe("ControlledWallet - withdraw", function () {
    it("owner can withdraw eth from contract", async function () {
        const { controlledWallet, walletOwner, walletAddress, oneEth } = await loadFixture(deployFixture);

        const withdrawAmount = ethers.parseEther("0.5");
        const contractBalanceBefore = await ethers.provider.getBalance(walletAddress);
        expect(contractBalanceBefore).to.equal(oneEth);

        const tx = await controlledWallet.connect(walletOwner).withdraw(withdrawAmount);
        await tx.wait();

        const contractBalanceAfter = await ethers.provider.getBalance(walletAddress);
        expect(contractBalanceBefore - contractBalanceAfter).to.equal(withdrawAmount);
    });

});

describe("ControlledWallet - sendContractEth", function () {
    it("sends eth from contract to recipient and emits event", async function () {
        const { controlledWallet, walletOwner, walletAddress, user1 } = await loadFixture(deployFixture);

        const sendAmount = ethers.parseEther("0.25");

        const contractBalanceBefore = await ethers.provider.getBalance(walletAddress);
        const userBalanceBefore = await ethers.provider.getBalance(user1.address);

        await expect(controlledWallet.connect(walletOwner).sendContractEth(user1.address, sendAmount)).to.emit(controlledWallet, "EthTransferred").withArgs(user1.address, sendAmount);

        const contractBalanceAfter = await ethers.provider.getBalance(walletAddress);
        const userBalanceAfter = await ethers.provider.getBalance(user1.address);

        expect(contractBalanceBefore - contractBalanceAfter).to.equal(sendAmount);
        expect(userBalanceAfter).to.be.gt(userBalanceBefore);
    });
});

describe("ControlledWallet - sendToken", function () {
    it("sends erc20 tokens from wallet to recipient and emits event", async function () {
        const { controlledWallet, myToken, walletOwner, user1, walletAddress, decimals } = await loadFixture(deployFixture);
        const tokenFundAmount = 100n * 10n ** BigInt(decimals);
        const approvefortransfer = await myToken.connect(walletOwner).approve(walletOwner, tokenFundAmount);
        await approvefortransfer.wait();
        const txFundToken = await myToken.connect(walletOwner).transfer(walletAddress, tokenFundAmount);
        await txFundToken.wait();
        const sendAmount = tokenFundAmount / 2n;
        const walletTokenBefore = await myToken.balanceOf(walletAddress);
        const userTokenBefore = await myToken.balanceOf(user1.address);

        await expect(controlledWallet.connect(walletOwner).sendToken(await myToken.getAddress(), user1.address, sendAmount)).to.emit(controlledWallet, "TokenTransferred").withArgs(await myToken.getAddress(), user1.address, sendAmount);

        const walletTokenAfter = await myToken.balanceOf(walletAddress);
        const userTokenAfter = await myToken.balanceOf(user1.address);

        expect(walletTokenBefore - walletTokenAfter).to.equal(sendAmount);
        expect(userTokenAfter - userTokenBefore).to.equal(sendAmount);
    });

});
