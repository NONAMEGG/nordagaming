import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Развертывание контракта MockNFT
  const MockNFT = await ethers.getContractFactory("MockNFT");
  console.log("Deploying MockNFT...");
  const nftContract = await MockNFT.deploy();
  await nftContract.waitForDeployment(); // Ждем подтверждения развертывания

  const nftContractAddress = await nftContract.getAddress();
  console.log("MockNFT contract deployed to:", nftContractAddress);

  // Развертывание контракта NFTBetting
  const minimumBet = ethers.parseEther("0.1"); // 0.1 эфира
  const NFTBetting = await ethers.getContractFactory("NFTBetting");
  const nftBetting = await NFTBetting.deploy(minimumBet, nftContractAddress);
  await nftBetting.waitForDeployment();
  
  console.log("NFTBetting contract deployed to:", await nftBetting.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
