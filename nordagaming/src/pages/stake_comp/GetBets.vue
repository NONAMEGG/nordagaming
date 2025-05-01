<template>
  <v-container class="py-8">
    <v-row>
      <v-col cols="12">
        <v-card class="pa-6">
          <v-card-title class="text-h4 font-weight-bold mb-4">Ставки</v-card-title>

          <v-btn
            color="primary"
            class="mt-6"
            @click="fetchBets"
            prepend-icon="mdi-refresh"
          >
            Обновить список ставок
          </v-btn>

          <v-divider class="my-6"></v-divider>
          <v-alert v-if="bets.length === 0" type="info" class="mb-4">
            Ставки ещё не сделаны.
          </v-alert>

          <v-list v-else>
            <v-list-item
              v-for="(bet, index) in bets"
              :key="index"
              class="mb-4"
              color="grey-lighten-4"
            >
              <v-list-item-content>
                <div class="d-flex flex-column">
                  <div>
                    <span class="font-weight-bold">Игрок:</span>
                    <span class="text-red-darken-2 ms-2">{{ bet.player }}</span>
                  </div>
                  <div>
                    <span class="font-weight-bold">Сумма ставки:</span>
                    <span class="text-red-darken-2 ms-2">{{ ethers.formatEther(bet.amount) }} ETH</span>
                  </div>
                </div>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <v-alert v-if="gameId !== null" type="info" class="mb-4">
            Текущий ID игры: {{ gameId }}
          </v-alert>

          <v-alert v-if="bets_amount !== null" type="info">
            Сумма ставок {{ bets_amount }} ETH
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<!-- <script setup>
import { getNFTBettingContract } from "../../contracts/Betting";
import { ethers } from "ethers";
import { ref, onMounted, onUnmounted } from "vue";

let pollingInterval;
const bets = ref([]);
const gameId = ref(null);
const bets_amount = ref(null);

const fetchGameId = async () => {
  try {
    const contract = await getNFTBettingContract();
    gameId.value = await contract.gameId();
    const game = await contract.games(gameId.value);
    bets_amount.value = ethers.formatEther(game.totalAmount.toString());
    fetchBets();
  } catch (error) {
    console.error(error);
    alert("Ошибка при получении ID игры");
  }
};

const fetchBets = async () => {
  try {
    if (!gameId.value) {
      alert("Идентификатор игры не найден");
      return;
    }
    const contract = await getNFTBettingContract();
    const betList = await contract.getBets(gameId.value);
    bets.value = betList;
  } catch (error) {
    console.error(error);
    alert("Ошибка при загрузке ставок");
  }
};

onMounted(() => {
  fetchGameId();
  pollingInterval = setInterval(() => {
    fetchGameId();
  }, 5000);
});

onUnmounted(() => {
  clearInterval(pollingInterval);
});
</script> -->

<!-- <template>
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
</template> -->

<script setup>
import { getNFTBettingContract } from "../../contracts/Betting";
import { ethers } from "ethers";
import { ref, onMounted, onUnmounted, computed } from "vue";

const bets = ref([]);
const currentGameId = ref(null); // Переименовано из gameId в currentGameId
const totalAmount = ref("0");
const winner = ref(null);
const winningAmount = ref("0");
const isGameEnded = ref(false);
const PLATFORM_FEE_PERCENT = 10;
const WINNER_PERCENT = 90;

const formatEth = (wei) => {
  return parseFloat(ethers.formatEther(wei)).toFixed(4);
};

const calculateWinChance = (betAmount) => {
  if (totalAmount.value === "0") return "0.00";
  const chance = (parseFloat(ethers.formatEther(betAmount)) / parseFloat(ethers.formatEther(totalAmount.value))) * 100;
  return chance.toFixed(2);
};

const calculatePotentialWin = (betAmount) => {
  if (totalAmount.value === "0") return "0.00";
  const totalPool = parseFloat(ethers.formatEther(totalAmount.value));
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
    currentGameId.value = await contract.gameId();
    const game = await contract.games(currentGameId.value);
    totalAmount.value = game.totalAmount.toString();
    winner.value = game.winner;
    winningAmount.value = game.winningAmount.toString();
    isGameEnded.value = game.ended;
    
    fetchBets();
  } catch (error) {
    console.error("Ошибка при получении данных игры:", error);
  }
};

const fetchBets = async () => {
  try {
    if (!currentGameId.value) return;

    const contract = await getNFTBettingContract();
    const betList = await contract.getBets(currentGameId.value);
    bets.value = betList;
  } catch (error) {
    console.error("Ошибка при загрузке ставок:", error);
  }
};

const startNewGame = async () => {
  try {
    const contract = await getNFTBettingContract();
    const tx = await contract.startNewGame();
    await tx.wait();
    await fetchGameData();
  } catch (error) {
    console.error("Ошибка при старте новой игры:", error);
    alert(`Ошибка: ${error.reason || error.message}`);
  }
};

let pollingInterval;
onMounted(() => {
  fetchGameData();
  pollingInterval = setInterval(fetchGameData, 5000);
});

onUnmounted(() => {
  clearInterval(pollingInterval);
});
</script>

<!-- <style scoped>
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
</style> -->