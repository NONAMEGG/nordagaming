import Web3 from 'web3';
import NFTBettingABI from '../../artifacts/contracts/NFTBetting.sol/NFTBetting.json';
import MockNFTABI from '../../artifacts/contracts/MockNFT.sol/MockNFT.json';
import contractAddresses from './contract-addresses.json';

// Инициализация Web3
let web3;

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  web3 = new Web3(window.ethereum);
} else {
  console.warn('MetaMask not detected. Using local provider');
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}

// Проверка структуры ABI (важное добавление)
const getValidABI = (abiData) => {
  if (abiData.abi) return abiData.abi; // Если файл имеет структуру {abi: [...]}
  if (Array.isArray(abiData)) return abiData; // Если файл содержит массив ABI напрямую
  throw new Error('Invalid ABI format');
};

export async function getNFTBettingContract() {
  if (!web3.currentProvider) throw new Error("Web3 provider not initialized");
  
  try {
    await window.ethereum?.request({ method: 'eth_requestAccounts' });
    const abi = getValidABI(NFTBettingABI);
    
    return new web3.eth.Contract(
      abi,
      contractAddresses.NFTBetting
    );
  } catch (error) {
    console.error('Error getting NFTBetting contract:', error);
    throw error;
  }
}

export async function getMockNFTContract() {
  if (!web3.currentProvider) throw new Error("Web3 provider not initialized");
  
  try {
    await window.ethereum?.request({ method: 'eth_requestAccounts' });
    const abi = getValidABI(MockNFTABI);
    
    return new web3.eth.Contract(
      abi,
      contractAddresses.MockNFT
    );
  } catch (error) {
    console.error('Error getting MockNFT contract:', error);
    throw error;
  }
}

// Проверка адресов контрактов
export const NFT_BETTING_ADDRESS = contractAddresses.NFTBetting || null;
export const MOCK_NFT_ADDRESS = contractAddresses.MockNFT || null;

// Добавим проверку при загрузке
console.log('NFTBetting Address:', NFT_BETTING_ADDRESS);
console.log('MockNFT Address:', MOCK_NFT_ADDRESS);
console.log('NFTBetting ABI:', getValidABI(NFTBettingABI));
console.log('MockNFT ABI:', getValidABI(MockNFTABI));