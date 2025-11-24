const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const walletModule = buildModule("TokenModule", (m) => {

    const owner = process.env.METAMASK_PUBLIC_KEY;

  const wallet = m.contract("ControlledWallet", [owner]);

  return { wallet };
});

module.exports = walletModule;

