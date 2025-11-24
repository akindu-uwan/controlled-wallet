
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
require("dotenv").config();


module.exports = buildModule("MyTokenModule", (m) => {
  const tokenName ="Lion Coin";
  const symbol ="LEO";
  const initialSupply = 2000000;
  const initialOwner =process.env.METAMASK_PUBLIC_KEY;
  const walletAddress =process.env.CONTROLLED_WALLET_ADDRESS;
  
  const myToken = m.contract("MyToken", [tokenName, symbol, initialSupply, initialOwner], {
    id: "MyTokenContract"
  });

  m.call(myToken, "approve", [initialOwner, 20000000], {
    id: "approveToken1"
  });

  m.call(myToken, "transfer", [walletAddress, 1000000], {
    id: "transferToken1"
  });

  return { myToken };
});