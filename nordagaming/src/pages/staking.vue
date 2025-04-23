<template>
  <div class="main_window">
   
    
    <div class="game-status">
      <p>Текущая игра: #{{ currentGameId }}</p>
      <p>Статус: {{ gameEnded ? 'Завершена' : 'Активна' }}</p>
      <p>Общая сумма ставок: {{ totalBets }} ETH</p>
      <p v-if="nftDeposited">NFT залогирован (ID: {{ nftId }})</p>
    </div>

    <div class="mb-4">
  <label for="customBet" class="block text-gray-700">Сумма ставки (ETH):</label>
  <input
    id="customBet"
    v-model="customBetAmount"
    type="number"
    step="0.01"
    min="0"
    class="border border-gray-300 rounded px-3 py-2 w-full"
    :disabled="!canBet"
  />
</div>
    
    <button
      @click="placeBet"
      class="button-primary"
      :disabled="!canBet"
    >
      Поставить ставку 
    </button>

    <button
      @click="depositNFT"
      class="button-success"
      :disabled="nftDeposited"
    >
      {{ nftDeposited ? 'NFT уже депозирован' : 'Внести NFT' }}
    </button>

    <button
      @click="endGameEarly"
      class="button-danger"
      :disabled="gameEnded"
    >
      Завершить досрочно
    </button>

    <div class="BidsList">
      <GetBets />
    </div>
  
    <div class="BidsList">
      <CountDown :end-time="bettingEndTime" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ethers } from 'ethers';
import { getNFTBettingContract, getMockNFTContract } from "../contracts/Betting";
import GetBets from "./stake_comp/GetBets.vue";
import CountDown from "./stake_comp/Countdown.vue";

const currentGameId = ref(0);
const gameEnded = ref(false);
const nftDeposited = ref(false);
const nftId = ref(null);
const minimumBet = ref('0.1');
const totalBets = ref('0');
const bettingEndTime = ref(0);
const customBetAmount = ref('');


const canBet = computed(() => {
  return !gameEnded.value && nftDeposited.value;
});

const initGameData = async () => {
  try {
    const contract = await getNFTBettingContract();
    currentGameId.value = await contract.gameId();
    
    const game = await contract.games(currentGameId.value);
    gameEnded.value = game.ended;
    totalBets.value = ethers.formatEther(game.totalAmount.toString());
    
    nftDeposited.value = await contract.nftDeposited();
    nftId.value = await contract.nftId();
    bettingEndTime.value = await contract.bettingEndTime();
    minimumBet.value = ethers.formatEther(await contract.minimumBet());
  } catch (error) {
    console.error('Ошибка инициализации:', error);
  }
};

const placeBet = async () => {
  try {
    const betValue = parseFloat(customBetAmount.value);
    if (isNaN(betValue) || betValue <= 0) {
      alert("Введите корректную сумму ставки.");
      return;
    }

    const betInWei = ethers.parseEther(betValue.toString());

    const contract = await getNFTBettingContract();
    const tx = await contract.placeBet({ value: betInWei });
    await tx.wait();

    alert("Ставка принята!");
    customBetAmount.value = ''; 
    await initGameData();
  } catch (error) {
    console.error(error);
    alert(`Ошибка при ставке: ${error.message}`);
  }
};
const depositNFT = async () => {
  try {
    const nft = await getMockNFTContract();
    const betting = await getNFTBettingContract();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const tokenId = 0;
    try {
      const owner = await nft.ownerOf(tokenId);
      if (owner.toLowerCase() !== signer.address.toLowerCase()) {
        const mintTx = await nft.mint(signer.address);
        await mintTx.wait();
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
    await initGameData();
  } catch (error) {
    console.error(error);
    alert(`Ошибка при депозите NFT: ${error.message}`);
  }
};


const endGameEarly = async () => {
  try {
    const contract = await getNFTBettingContract();
    const tx = await contract.endGameEarly();
    await tx.wait();
    alert("Игра завершена досрочно!");
    await initGameData();
  } catch (error) {
    console.error(error);
    alert(`Ошибка при завершении игры: ${error.message}`);
  }
};

// Проверка окончания игры
const checkGameEnd = async () => {
  try {
    const contract = await getNFTBettingContract();
    const tx = await contract.checkGameEnd();
    await tx.wait();
    await initGameData();
  } catch (error) {
    console.error('Ошибка проверки окончания:', error);
  }
};

// Периодическое обновление данных
onMounted(async () => {
  await initGameData();
  setInterval(initGameData, 15000); // Обновление каждые 15 сек
});
</script>

<style scoped>
/* Стили остаются без изменений */
.main_window {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.game-status {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.game-status p {
  margin: 5px 0;
  color: #334155;
}

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
  margin-right: 10px;
  margin-bottom: 10px;
}

.button-primary {
  background-color: #1d4ed8;
  color: white;
}

.button-primary:hover {
  background-color: #2563eb;
}

.button-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.button-success {
  background-color: #10b981;
  color: white;
}

.button-success:hover {
  background-color: #34d399;
}

.button-success:disabled {
  background-color: #a7f3d0;
  cursor: not-allowed;
}

.button-danger {
  background-color: #ef4444;
  color: white;
}

.button-danger:hover {
  background-color: #f87171;
}

.button-danger:disabled {
  background-color: #fca5a5;
  cursor: not-allowed;
}

.BidsList {
  margin-top: 30px;
}
</style>