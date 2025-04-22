// scripts/deploy.js
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

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

    const configPath = path.join(__dirname, '../src/contracts/contract-address.json');
    const config = {
        VictoryReward: contractAddress,
        network: hre.network.name //сеть для отслеживания
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Адрес контракта сохранён в:', configPath);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
});