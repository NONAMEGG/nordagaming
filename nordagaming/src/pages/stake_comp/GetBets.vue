<template>
  <div class="bids_main_container">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Ставки</h1>
    
    <div v-if="bets.length === 0" class="text-lg text-gray-500">Ставки ещё не сделаны.</div>

    <div 
      v-for="(bet, index) in bets" 
      :key="index" 
      class="bid_item"
      :class="{ 'winner-bet': isWinner(bet.player) }"
    >
      <div class="player_id">
        <span class="font-bold text-lg text-gray-800">Игрок: </span>
        <span :class="isWinner(bet.player) ? 'text-green-500' : 'text-gray-600'">{{ bet.player }}</span>
      </div>
      <div class="player_bid_amount">
        <span class="font-bold text-lg text-gray-800">Сумма ставки:</span>
        <span :class="isWinner(bet.player) ? 'text-green-500' : 'text-gray-600'">{{ formatEth(bet.amount) }} ETH</span>
      </div>
      <div class="player_odds">
        <span class="font-bold text-lg text-gray-800">Шанс на победу:</span>
        <span :class="isWinner(bet.player) ? 'text-green-500' : 'text-gray-600'">{{ calculateWinChance(bet.amount) }}%</span>
      </div>
      <div class="potential_win">
        <span class="font-bold text-lg text-gray-800">Потенциальный выигрыш:</span>
        <span :class="isWinner(bet.player) ? 'text-green-500' : 'text-gray-600'">{{ calculatePotentialWin(bet.amount) }} ETH</span>
      </div>
    </div>

    <button @click="fetchBets" class="button-primary mt-6">
      Обновить список ставок
    </button>

    <div v-if="currentGameId !== null" class="text-lg text-gray-500 mt-4">
      Текущий ID игры: {{ currentGameId }}
    </div>

    <div v-if="totalAmount !== null" class="text-lg text-gray-500 mt-4">
      Общая сумма ставок: {{ formatEth(totalAmount) }} ETH
    </div>

    <div 
      v-if="winner && winner !== '0x0000000000000000000000000000000000000000'" 
      class="winner-announcement mt-6 p-4 bg-green-100 rounded-lg"
    >
      <h2 class="text-2xl font-bold text-green-800">Победитель игры #{{ currentGameId }}:</h2>
      <p class="text-xl text-green-600">{{ winner }}</p>
      <p class="text-lg text-green-600">Выигрыш: {{ formatEth(winningAmount) }} ETH</p>
      
      <button 
        @click="startNewGame"
        class="button-primary mt-4"
        :disabled="!canStartNewGame"
      >
        Начать новую игру
      </button>
    </div>
  </div>
</template>

<script setup>
import { getNFTBettingContract } from "../../contracts/Betting";
import Web3 from "web3";
import { ref, onMounted, onUnmounted, computed } from "vue";

const bets = ref([]);
const currentGameId = ref(null);
const totalAmount = ref("0");
const winner = ref(null);
const winningAmount = ref("0");
const isGameEnded = ref(false);
const PLATFORM_FEE_PERCENT = 10;
const WINNER_PERCENT = 90;

const formatEth = (wei) => {
  return parseFloat(Web3.utils.fromWei(wei, 'ether')).toFixed(4);
};

const calculateWinChance = (betAmount) => {
  if (totalAmount.value === "0") return "0.00";
  const chance = (parseFloat(Web3.utils.fromWei(betAmount, 'ether')) / 
                parseFloat(Web3.utils.fromWei(totalAmount.value, 'ether'))) * 100;
  return chance.toFixed(2);
};

const calculatePotentialWin = (betAmount) => {
  if (totalAmount.value === "0") return "0.00";
  const totalPool = parseFloat(Web3.utils.fromWei(totalAmount.value, 'ether'));
  const potentialWin = totalPool * (WINNER_PERCENT / 100);
  return potentialWin.toFixed(4);
};

const isWinner = (playerAddress) => {
  return winner.value && 
         winner.value !== '0x0000000000000000000000000000000000000000' && 
         winner.value.toLowerCase() === playerAddress.toLowerCase();
};

const canStartNewGame = computed(() => {
  return isGameEnded.value && 
         winner.value && 
         winner.value !== '0x0000000000000000000000000000000000000000';
});

const fetchGameData = async () => {
  try {
    const contract = await getNFTBettingContract();
    currentGameId.value = await contract.methods.gameId().call();
    
    const game = await contract.methods.games(currentGameId.value).call();
    totalAmount.value = game.totalAmount;
    winner.value = game.winner;
    winningAmount.value = game.winningAmount;
    isGameEnded.value = game.ended;
    
    await fetchBets();
  } catch (error) {
    console.error("Ошибка при получении данных игры:", error);
  }
};

const fetchBets = async () => {
  try {
    if (!currentGameId.value) return;

    const contract = await getNFTBettingContract();
    const betList = await contract.methods.getBets(currentGameId.value).call();
    bets.value = betList;
    console.log(betList);
    
  } catch (error) {
    console.error("Ошибка при загрузке ставок:", error);
  }
};

const startNewGame = async () => {
  try {
    const contract = await getNFTBettingContract();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    await contract.methods.startNewGame().send({ from: accounts[0] });
    await fetchGameData();
  } catch (error) {
    console.error("Ошибка при старте новой игры:", error);
    alert(`Ошибка: ${error.message}`);
  }
};

let pollingInterval;
onMounted(() => {
  fetchGameData();
  pollingInterval = setInterval(fetchGameData, 5000);
});

onMounted(() => {
  fetchGameData();
  pollingInterval = setInterval(fetchGameData, 5000);

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => {
      fetchGameData(); // повторный фетч при смене аккаунта
    });
  }
});
</script>

<style scoped>
.bids_main_container {
  margin: 0 auto;
  padding: 20px;
}

.bid_item {
  background: #212931;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.bid_item.winner-bet {
  background: #2d503c;
  border-left: 4px solid #4ade80;
}

.bid_item > div {
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  margin-left: 4%;
}

.button-primary {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  background-color: #1d4ed8;
  color: white;
}

.button-primary:hover {
  background-color: #2563eb;
  box-shadow: 0 4px 8px rgba(29, 78, 216, 0.3);
}

.button-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #cccccc;
}

.winner-announcement {
  border: 2px solid #4ade80;
}
</style>