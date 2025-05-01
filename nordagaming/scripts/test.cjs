const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const Contract = await ethers.getContractFactory("NFTBetting");
  const contract = Contract.attach(contractAddress);

  // Прямой вызов gameId()
  const gameId = await contract.gameId();
  console.log("Game ID из тестового скрипта:", gameId.toString());
}

main().catch(console.error);