import fs from 'fs';
import Web3 from 'web3';

async function main() {
  // Подключаемся к провайдеру (например, Hardhat)
  const web3 = new Web3('http://localhost:8545');
  
  // Получаем аккаунты
  const accounts = await web3.eth.getAccounts();
  const deployer = accounts[0];
  console.log("Deploying contracts with the account:", deployer);

  // Получаем ABI и bytecode контрактов
  const MockNFT = JSON.parse(fs.readFileSync('./artifacts/contracts/MockNFT.sol/MockNFT.json'));
  const NFTBetting = JSON.parse(fs.readFileSync('./artifacts/contracts/NFTBetting.sol/NFTBetting.json'));

  // Развертывание MockNFT
  const mockNFT = new web3.eth.Contract(MockNFT.abi);
  const nftContract = await mockNFT.deploy({
    data: MockNFT.bytecode
  }).send({
    from: deployer,
    gas: 5000000
  });
  const nftContractAddress = nftContract.options.address;

  // Развертывание NFTBetting
  const minimumBet = web3.utils.toWei('0.1', 'ether');
  const nftBetting = new web3.eth.Contract(NFTBetting.abi);
  const bettingContract = await nftBetting.deploy({
    data: NFTBetting.bytecode,
    arguments: [minimumBet, nftContractAddress]
  }).send({
    from: deployer,
    gas: 5000000
  });
  const nftBettingAddress = bettingContract.options.address;

  // Сохраняем адреса в JSON файл
  const networkId = await web3.eth.net.getId();
  const contractsData = {
    MockNFT: nftContractAddress,
    NFTBetting: nftBettingAddress,
    network: networkId.toString()
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