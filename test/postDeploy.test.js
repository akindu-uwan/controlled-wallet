require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Post-deployment checks", function () {
    let myToken;
    let controlledWallet;
    let owner;
    let user1;

    before(async function () {
        
        const signers = await ethers.getSigners();
        owner = signers[0]; 

        user1 = signers[1];

        myToken = await ethers.getContractAt(
            "MyToken",
            process.env.MYTOKEN_ADDRESS
        );

        controlledWallet = await ethers.getContractAt(
            "ControlledWallet",
            process.env.CONTROLLED_WALLET_ADDRESS
        );
    });

    it("token: has correct name, symbol and supply owner", async function () {
        expect(await myToken.name()).to.equal("Lion Coin");
        expect(await myToken.symbol()).to.equal("LEO");

        const decimals = await myToken.decimals();
        const totalSupply = await myToken.totalSupply();
        const ownerBalance = await myToken.balanceOf(owner.address);

        const expectedTotal = 2_000_000n * 10n ** BigInt(decimals);
        expect(totalSupply).to.equal(expectedTotal);
        expect(ownerBalance).to.equal(expectedTotal);
    });

    it("wallet: owner can pause/unpause", async function () {
        const txPause = await controlledWallet.connect(owner).pause();
        await txPause.wait();
        expect(await controlledWallet.paused()).to.equal(true);

        const txUnpause = await controlledWallet.connect(owner).unpause();
        await txUnpause.wait();
        expect(await controlledWallet.paused()).to.equal(false);
    });

    it("wallet: sendContractEth works from deployed contract", async function () {
        const walletAddress = await controlledWallet.getAddress();
        const sendAmount = ethers.parseEther("0.05");

        const contractBalanceBefore = await ethers.provider.getBalance(walletAddress);
        const userBalanceBefore = await ethers.provider.getBalance(user1.address);

        await expect(
            controlledWallet.connect(owner).sendContractEth(user1.address, sendAmount)
        ).to.emit(controlledWallet, "EthTransferred")
         .withArgs(user1.address, sendAmount);

        const contractBalanceAfter = await ethers.provider.getBalance(walletAddress);
        const userBalanceAfter = await ethers.provider.getBalance(user1.address);

        expect(contractBalanceBefore - contractBalanceAfter).to.equal(sendAmount);
        expect(userBalanceAfter).to.be.gt(userBalanceBefore);
    });

    it("wallet: sendToken works from deployed contract", async function () {
        const decimals = await myToken.decimals();
        const walletAddress = await controlledWallet.getAddress();

        const tokenFundAmount = 100n * 10n ** BigInt(decimals);

        // fund wallet with tokens if needed
        const txFundToken = await myToken.connect(owner).transfer(walletAddress, tokenFundAmount);
        await txFundToken.wait();

        const sendAmount = tokenFundAmount / 2n;

        const walletTokenBefore = await myToken.balanceOf(walletAddress);
        const userTokenBefore = await myToken.balanceOf(user1.address);

        await expect(
            controlledWallet
                .connect(owner)
                .sendToken(await myToken.getAddress(), user1.address, sendAmount)
        ).to.emit(controlledWallet, "TokenTransferred")
         .withArgs(await myToken.getAddress(), user1.address, sendAmount);

        const walletTokenAfter = await myToken.balanceOf(walletAddress);
        const userTokenAfter = await myToken.balanceOf(user1.address);

        expect(walletTokenBefore - walletTokenAfter).to.equal(sendAmount);
        expect(userTokenAfter - userTokenBefore).to.equal(sendAmount);
    });
});
