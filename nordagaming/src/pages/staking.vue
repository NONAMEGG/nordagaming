<template>
  <div class="main_window">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">NFT Betting Game</h1>
    
    <button
      @click="placeBet"
      class="button-primary"
    >
      Поставить ставку (0.1 ETH)
    </button>

    <button
      @click="deposit"
      class="button-success"
    >
      Внести депозит NFT
    </button>

    <button
      @click="endGame"
      class="button-danger"
    >
      Закончить игру
    </button>
    <div class="BidsList">
  <GetBets />
  </div>
  
  <div class="BidsList">
  <CountDown />
  </div>
  

</div>
  
</template>

<script setup>
import { getNFTBettingContract, getMockNFTContract } from "../contracts/Betting";
import { ethers } from "ethers";
import GetBets from "./stake_comp/GetBets.vue";
import CountDown from "./stake_comp/Countdown.vue";

const placeBet = async () => {
  try {
    const contract = await getNFTBettingContract();
    const tx = await contract.placeBet({
      value: ethers.parseEther("0.1"),
    });
    await tx.wait();
    alert("Ставка принята!");
  } catch (error) {
    console.error(error);
    alert("Ошибка при ставке");
  }
};

const deposit = async () => {
  try {
    const nft = await getMockNFTContract();
    const betting = await getNFTBettingContract();
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const tokenId = 0;
    try {
      const owner = await nft.ownerOf(tokenId);
      if (owner.toLowerCase() !== signer.address.toLowerCase()) {
        throw new Error("Вы не владелец NFT с ID 0");
      }
    } catch (e) {
      const mintTx = await nft.mint(signer.address);
      await mintTx.wait();
    }

    const approveTx = await nft.approve(betting.target, tokenId);
    await approveTx.wait();

    const depositTx = await betting.depositNFT(tokenId);
    await depositTx.wait();

    alert("NFT внесён успешно!");
  } catch (error) {
    console.error(error);
    alert("Ошибка при депозите NFT");
  }
};

const endGame = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = await getNFTBettingContract();
    const tx = await contract.connect(signer).endGame();
    await tx.wait();
    alert("Игра завершена, началась новая!");
  } catch (error) {
    console.error(error);
    alert("Ошибка при завершении игры");
  }
};
</script>

<style scoped>
/* Кнопки */
.button-primary,
.button-success,
.button-danger {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.button-primary {
  background-color: #1d4ed8; /* Синий */
  color: white;
}

.button-primary:hover {
  background-color: #2563eb;
  box-shadow: 0 4px 8px rgba(29, 78, 216, 0.3);
}

.button-success {
  background-color: #10b981; /* Зеленый */
  color: white;
}

.button-success:hover {
  background-color: #34d399;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.button-danger {
  background-color: #ef4444; /* Красный */
  color: white;
}

.button-danger:hover {
  background-color: #f87171;
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}
</style>
