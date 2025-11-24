const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { JsonRpcProvider, Wallet, Contract } = require("ethers");
const { myTokenABI } = require("../abi/myTokenABI");
const { walletABI } = require("../abi/walletABI");

async function deployFixture() {
    const privateKey = process.env.PRIVATE_KEY;
    const rpcProvider = process.env.SEPOLIA_RPC_URL;
    const walletAddress = process.env.CONTROLLED_WALLET_ADDRESS;
    const myTokenAddress = process.env.MYTOKEN_ADDRESS;
    const initialSupply = 2000000;

    const provider = new JsonRpcProvider(rpcProvider);
    const signer = new Wallet(privateKey, provider);

    const myToken = new Contract(myTokenAddress, myTokenABI, signer);
    const controlledWallet = new Contract(walletAddress, walletABI, signer);

    const decimals = await myToken.decimals();
    const walletOwner = signer;

    return {
        signer,
        walletOwner,
        walletAddress,
        myTokenAddress,
        initialSupply,
        myToken,
        controlledWallet,
        decimals,
    };
}

describe("MyToken", function () {
    it("has correct name and symbol", async function () {
        const { myToken } = await deployFixture(deployFixture);

        expect(await myToken.name()).to.equal("Lion Coin");
        expect(await myToken.symbol()).to.equal("LEO");
    });
});


describe("ControlledWallet - pause / unpause", function () {
    it("owner can pause and unpause", async function () {
        const { controlledWallet, walletOwner } = await deployFixture(deployFixture);

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
        const { controlledWallet, signer } = await deployFixture(deployFixture);

        const before = await ethers.provider.getBalance(controlledWallet);
        const amount = ethers.parseEther("0.0001");

        const tx = await controlledWallet.connect(signer).fundme({ value: amount });
        await tx.wait();

        const after = await ethers.provider.getBalance(controlledWallet);
        expect(after - before).to.equal(amount);
    });
});

describe("ControlledWallet - withdraw", function () {
    it("owner can withdraw eth from contract", async function () {
        const { controlledWallet, signer, walletAddress, oneEth } = await deployFixture(deployFixture);

        const withdrawAmount = ethers.parseEther("0.00001");
        const contractBalanceBefore = await ethers.provider.getBalance(walletAddress);

        const tx = await controlledWallet.connect(signer).withdraw(withdrawAmount);
        await tx.wait();

        const contractBalanceAfter = await ethers.provider.getBalance(walletAddress);
        expect(contractBalanceBefore - contractBalanceAfter).to.equal(withdrawAmount);
    });

});

// describe("ControlledWallet - sendContractEth", function () {
//     it("sends eth from contract to recipient and emits event", async function () {
//         const { controlledWallet, walletOwner, walletAddress, user1 } = await loadFixture(deployFixture);

//         const sendAmount = ethers.parseEther("0.25");

//         const contractBalanceBefore = await ethers.provider.getBalance(walletAddress);
//         const userBalanceBefore = await ethers.provider.getBalance(user1.address);

//         await expect(controlledWallet.connect(walletOwner).sendContractEth(user1.address, sendAmount)).to.emit(controlledWallet, "EthTransferred").withArgs(user1.address, sendAmount);

//         const contractBalanceAfter = await ethers.provider.getBalance(walletAddress);
//         const userBalanceAfter = await ethers.provider.getBalance(user1.address);

//         expect(contractBalanceBefore - contractBalanceAfter).to.equal(sendAmount);
//         expect(userBalanceAfter).to.be.gt(userBalanceBefore);
//     });
// });

// describe("ControlledWallet - sendToken", function () {
//     it("sends erc20 tokens from wallet to recipient and emits event", async function () {
//         const { controlledWallet, myToken, walletOwner, user1, walletAddress, decimals } = await loadFixture(deployFixture);
//         const tokenFundAmount = 100n * 10n ** BigInt(decimals);
//         const approvefortransfer = await myToken.connect(walletOwner).approve(walletOwner, tokenFundAmount);
//         await approvefortransfer.wait();
//         const txFundToken = await myToken.connect(walletOwner).transfer(walletAddress, tokenFundAmount);
//         await txFundToken.wait();
//         const sendAmount = tokenFundAmount / 2n;
//         const walletTokenBefore = await myToken.balanceOf(walletAddress);
//         const userTokenBefore = await myToken.balanceOf(user1.address);

//         await expect(controlledWallet.connect(walletOwner).sendToken(await myToken.getAddress(), user1.address, sendAmount)).to.emit(controlledWallet, "TokenTransferred").withArgs(await myToken.getAddress(), user1.address, sendAmount);

//         const walletTokenAfter = await myToken.balanceOf(walletAddress);
//         const userTokenAfter = await myToken.balanceOf(user1.address);

//         expect(walletTokenBefore - walletTokenAfter).to.equal(sendAmount);
//         expect(userTokenAfter - userTokenBefore).to.equal(sendAmount);
//     });

// });
