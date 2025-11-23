// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ControlledWallet is Ownable {
    bool public paused;

    event EthTransferred(address indexed to, uint256 amount);
    event TokenTransferred(address indexed token, address indexed to, uint256 amount);
    event Paused(address indexed account);
    event Unpaused(address indexed account);

    error InsufficientBalance(uint256 available, uint256 required);
    error TransferFailed(address recipient, uint256 amount);
    error ContractPaused();
    error ZeroValue();
    error InvalidRecipient();
    error TokenTransferFailed();

    constructor(address initialOwner) Ownable(initialOwner) {}

    modifier notPaused() {
        if (paused) {
            revert ContractPaused();
        }
        _;
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused(_msgSender());
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(_msgSender());
    }

    //add funds to contract
    function fundme() external payable notPaused {
        if (msg.value == 0) {
            revert ZeroValue();
        }
    }

    //withdraw contract funds
    function withdraw(uint256 amount) external onlyOwner notPaused {
        uint256 bal = address(this).balance;
        if (bal < amount) {
            revert InsufficientBalance(bal, amount);
        }

        (bool success, ) = owner().call{value: amount}("");
        if (!success) {
            revert TransferFailed(owner(), amount);
        }
    }

    //send contract eth
    function sendContractEth(address to, uint256 amount) external onlyOwner notPaused {
        if (to == address(0)) {
            revert InvalidRecipient();
        }

        uint256 bal = address(this).balance;
        
        if (bal < amount) {
            revert InsufficientBalance(bal, amount);
        }

        (bool success, ) = payable(to).call{value: amount}("");
        if (!success) {
            revert TransferFailed(to, amount);
        }

        emit EthTransferred(to, amount);
    }

    //send erc20 tokens
    function sendToken(address token, address to, uint256 amount) external onlyOwner notPaused {
        if (to == address(0)) {
            revert InvalidRecipient();
        }

        bool success = IERC20(token).transfer(to, amount);
        if (!success) {
            revert TokenTransferFailed();
        }

        emit TokenTransferred(token, to, amount);
    }
}
