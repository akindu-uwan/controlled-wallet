# Controlled-Wallet  

A smart-contract-based wallet system built with Solidity and Hardhat, designed to give controlled access.

## Table of Contents  
1. [Project description](#project-description)  
2. [Features](#features)  
3. [Tech stack](#tech-stack)  
4. [Prerequisites](#prerequisites)  
5. [Installation & setup](#installation-setup)  
6. [Usage](#usage)  
7. [Running tests](#running-tests)  
8. [Project structure](#project-structure)  

## Project description  
This project provides a controlled wallet smart contract system that allows designated controllers/owners to manage funds securely and enforce rules around spending, access and transfers. The aim is to give a structured and auditable wallet for decentralized applications or multi-party contexts.

## Features
- Smart contracts written in Solidity.  
- Hardhat development environment for compilation, deployment, and testing.  
- Controlled access logic: owners, controllers, spend-limits.  
- Unit tests included.  
- Modular project structure to allow extension.

## Tech stack  
- **Solidity** for writing the smart contract.  
- **Hardhat** for development, testing, deployment.  
- **Node.js / NPM** for project management.  
- **JavaScript/TypeScript** for scripts/tests.  
- **Ethers.js** for contract interaction.

## Prerequisites  
Before you begin, ensure you have the following installed:  
- [Node.js](https://nodejs.org/) (v16.x or higher recommended)  
- NPM (comes with Node.js)  
- Hardhat Ethereum development network
- An Ethereum wallet/address for test network deployment.

For get free [sepoliaETH](https://www.alchemy.com/faucets/ethereum-sepolia)

## Installation & setup  
1. Clone the repository:  
   ```bash  
   git clone https://github.com/akindu-uwan/controlled-wallet.git  
   cd controlled-wallet 

2. Install dependencies:
    ```bash
    npm install  
    npm install hardhat

3. Configure environmental variables:

    ```bash
    METAMASK_PUBLIC_KEY=your wallet public key
    PRIVATE_KEY=your wallet private key (required for Sepolia deployment)
    SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
    CONTROLLED_WALLET_ADDRESS=fill after ControlledWallet deployment
    MYTOKEN_ADDRESS=fill after MyToken deployment


## Usage
1. Compile the contract(s):
    ```bash
    npx hardhat compile  

2. Deploy ControlledWallet contract in to sepolia test network:
    ```bash
    npx hardhat run --network localhost ignition/modules/controlledWallet.js  

After deployment, copy the deployed address into CONTROLLED_WALLET_ADDRESS in .env

3. Deploy myToken contract in to sepolia test network:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/controlledWallet.js --network sepolia

After deployment, fill in MYTOKEN_ADDRESS in .env

## Running tests
1. Run the unit tests to ensure contract integrity:
    ```bash
    npx hardhat test test/postDeploy.test.js --network sepolia

This will execute the test suite under the test/ directory using Hardhat.

## Project structure
    ├── abi
    ├── contracts/          ← Solidity smart contracts  
    ├── ignition/           ← Deployment/interation scripts  
    ├── test/               ← Unit tests  
    ├── hardhat.config.js   ← Hardhat configuration  
    ├── package.json        ← Project manifest  
    └── …                   ← Other supporting files  








