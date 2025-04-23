import { ethers } from "ethers";
import NFTBetting from "./nftBetting.json"; 
import MockNFT from "./nftabi.json";

// Адреса контрактов
const NFT_BETTING_ADDRESS = "0x851356ae760d987E095750cCeb3bC6014560891C"; // адрес NFTBetting
const MOCK_NFT_ADDRESS = "0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8"; // адрес вашего MockNFT

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