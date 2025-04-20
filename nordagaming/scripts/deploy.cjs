// scripts/deploy.js
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    
    const VictoryReward = await hre.ethers.getContractFactory("VictoryReward");
    
    const contract = await VictoryReward.deploy({
        value: hre.ethers.parseEther("1000")
    });

    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    
    console.log("Contract deployed to:", contractAddress);
    console.log("Deployer address:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(contractAddress);
    console.log("Contract balance:", hre.ethers.formatEther(balance), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
});