import { ethers } from "ethers";
// import NFTBettingABI from "./nftBetting.json"; 
// import MockNFTABI from "./nftabi.json";
import MockNFT from '../../artifacts/contracts/MockNFT.sol/MockNFT.json';
import NFTBetting from '../../artifacts/contracts/NFTBetting.sol/NFTBetting.json';
import contractAddresses from "./contract-addresses.json";


export async function getNFTBettingContract() {
  if (!window.ethereum) throw new Error("Metamask not found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  console.log(contractAddresses)
  
  return new ethers.Contract(
    contractAddresses.NFTBetting, 
    //NFTBettingABI, 
    NFTBetting.abi,
    signer
  );
}


export async function getMockNFTContract() {
  if (!window.ethereum) throw new Error("Metamask not found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  return new ethers.Contract(
    contractAddresses.MockNFT, 
    //MockNFTABI,
    MockNFT.abi,
    signer
  );
}

export const NFT_BETTING_ADDRESS = contractAddresses.NFTBetting;
export const MOCK_NFT_ADDRESS = contractAddresses.MockNFT;