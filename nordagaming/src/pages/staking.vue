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
import Web3 from 'web3';
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
    currentGameId.value = await contract.methods.gameId().call();
    
    const game = await contract.methods.games(currentGameId.value).call();
    gameEnded.value = game.ended;
    totalBets.value = Web3.utils.fromWei(game.totalAmount, 'ether');
    
    nftDeposited.value = await contract.methods.nftDeposited().call();
    nftId.value = await contract.methods.nftId().call();
    bettingEndTime.value = await contract.methods.bettingEndTime().call();
    minimumBet.value = Web3.utils.fromWei(await contract.methods.minimumBet().call(), 'ether');
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

    const betInWei = Web3.utils.toWei(betValue.toString(), 'ether');
    const contract = await getNFTBettingContract();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    await contract.methods.placeBet().send({
      from: accounts[0],
      value: betInWei
    });

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
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];

    const tokenId = 0;
    try {
      const owner = await nft.methods.ownerOf(tokenId).call();
      if (owner.toLowerCase() !== account.toLowerCase()) {
        await nft.methods.mint(account).send({ from: account });
      }
    } catch (e) {
      await nft.methods.mint(account).send({ from: account });
    }

    await nft.methods.approve(betting.options.address, tokenId).send({ from: account });
    await betting.methods.depositNFT(tokenId).send({ from: account });

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
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    await contract.methods.endGameEarly().send({ from: accounts[0] });
    alert("Игра завершена досрочно!");
    await initGameData();
  } catch (error) {
    console.error(error);
    alert(`Ошибка при завершении игры: ${error.message}`);
  }
};

onMounted(async () => {
  await initGameData();
  setInterval(initGameData, 15000);
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