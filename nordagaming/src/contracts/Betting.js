import { ethers } from "ethers";
import NFTBetting from "./nftBetting.json"; // ABI для NFTBetting
import MockNFT from "./nftabi.json"; // ABI для MockNFT

// Адреса контрактов
const NFT_BETTING_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; // адрес NFTBetting
const MOCK_NFT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // адрес вашего MockNFT

// Функция для получения контракта NFTBetting
export async function getNFTBettingContract() {
  if (!window.ethereum) throw new Error("Metamask not found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  return new ethers.Contract(NFT_BETTING_ADDRESS, NFTBetting, signer);
}

// Функция для получения контракта MockNFT
export async function getMockNFTContract() {
  if (!window.ethereum) throw new Error("Metamask not found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  return new ethers.Contract(MOCK_NFT_ADDRESS, MockNFT, signer);
}