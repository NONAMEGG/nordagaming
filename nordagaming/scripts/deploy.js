import fs from 'fs';
import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Развертывание контрактов
  const MockNFT = await ethers.getContractFactory("MockNFT");
  const nftContract = await MockNFT.deploy();
  await nftContract.waitForDeployment();
  const nftContractAddress = await nftContract.getAddress();

  const minimumBet = ethers.parseEther("0.1");
  const NFTBetting = await ethers.getContractFactory("NFTBetting");
  const nftBetting = await NFTBetting.deploy(minimumBet, nftContractAddress);
  await nftBetting.waitForDeployment();
  const nftBettingAddress = await nftBetting.getAddress();

  // Сохраняем адреса в JSON файл
  const contractsData = {
    MockNFT: nftContractAddress,
    NFTBetting: nftBettingAddress,
    network: (await ethers.provider.getNetwork()).name
  };

  fs.writeFileSync('./src/contracts/contract-addresses.json', JSON.stringify(contractsData, null, 2));
  
  console.log("Contracts deployed and addresses saved:");
  console.log("- MockNFT:", nftContractAddress);
  console.log("- NFTBetting:", nftBettingAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
