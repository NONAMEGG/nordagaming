// contracts/VictoryReward.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VictoryReward {
    address public owner;
    mapping(address => bool) public claimed;
    uint public constant REWARD = 100 ether;

    constructor() payable {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function claimReward() external {
        require(!claimed[msg.sender], "Already claimed");
        require(
            address(this).balance >= REWARD,
            "Insufficient contract balance"
        );

        claimed[msg.sender] = true;
        payable(msg.sender).transfer(REWARD);
    }

    function fundContract() external payable onlyOwner {}

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }
}
