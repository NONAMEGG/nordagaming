import { defineStore } from "pinia";
import { ethers } from "ethers";

export const useContractStore = defineStore("contract", {
  state: () => ({
    contract: null,
  }),
  actions: {
    async initializeContract() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contractAddress = "YOUR_CONTRACT_ADDRESS";
      const contractABI = []; // Add your contract's ABI here
      this.contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider.getSigner()
      );
    },
  },
});
