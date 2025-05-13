<template>
  <v-container>
    <v-row>
      <v-col
        v-for="(bet, index) in bets"
        :key="index"
        cols="12"
        class="py-1"
      >
        <v-card
          class="mb-2 py-2 px-3"
          :class="{ 'winner-bet': isWinner(bet.player) }"
          color="grey-darken-4"
          elevation="2"
          style="min-height:unset;"
        >
          <v-card-text class="py-2 px-0">
            <v-row dense align="center">
              <v-col cols="12" md="3" class="py-1">
                <div class="font-weight-bold">Игрок:</div>
                <div :class="isWinner(bet.player) ? 'text-green' : 'text-grey'">
                  {{ bet.player }}
                </div>
              </v-col>
              <v-col cols="12" md="3" class="py-1">
                <div class="font-weight-bold">Сумма ставки:</div>
                <div :class="isWinner(bet.player) ? 'text-green' : 'text-grey'">
                  {{ formatEth(bet.amount) }} ETH
                </div>
              </v-col>
              <v-col cols="12" md="3" class="py-1">
                <div class="font-weight-bold">Шанс на победу:</div>
                <div :class="isWinner(bet.player) ? 'text-green' : 'text-grey'">
                  {{ calculateWinChance(bet.amount) }}%
                </div>
              </v-col>
              <v-col cols="12" md="3" class="py-1">
                <div class="font-weight-bold">Потенциальный выигрыш:</div>
                <div :class="isWinner(bet.player) ? 'text-green' : 'text-grey'">
                  {{ calculatePotentialWin(bet.amount) }} ETH
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-divider class="my-6"></v-divider>

    <v-alert v-if="bets.length === 0" type="info" class="mb-4">
      Ставки ещё не сделаны.
    </v-alert>

    <v-row>
      <v-col cols="12" v-if="currentGameId !== null">
        <v-chip color="primary" class="ma-2">
          Текущий ID игры: {{ currentGameId }}
        </v-chip>
      </v-col>
      <v-col cols="12" v-if="totalAmount !== null">
        <v-chip color="secondary" class="ma-2">
          Общая сумма ставок: {{ formatEth(totalAmount) }} ETH
        </v-chip>
      </v-col>
    </v-row>

    <v-row v-if="winner && winner !== '0x0000000000000000000000000000000000000000'">
      <v-col cols="12">
        <v-alert type="success" class="winner-announcement mt-6">
          <div>
            <h2 class="text-h5 font-weight-bold mb-2">Победитель игры #{{ currentGameId }}:</h2>
            <p class="text-subtitle-1 mb-1">{{ winner }}</p>
            <p class="text-subtitle-2 mb-2">Выигрыш: {{ formatEth(winningAmount) }} ETH</p>
            <v-btn
              color="primary"
              class="mt-2"
              :disabled="!canStartNewGame"
              @click="startNewGame"
            >
              Начать новую игру
            </v-btn>
          </div>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { getNFTBettingContract } from "../../contracts/Betting";
import { ethers } from "ethers";
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useErrorStore } from '@/stores/errorStore';

const errorStore = useErrorStore();

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
    errorStore.showError("Ошибка при загрузке ставок: " + (error?.response?.data?.message || 'Неизвестная ошибка'));
  }
};

const startNewGame = async () => {
  try {
    const contract = await getNFTBettingContract();
    const tx = await contract.startNewGame();
    await tx.wait();
    await fetchGameData();
  } catch (error) {
    errorStore.showError("Ошибка при старте новой игры: " + (error?.response?.data?.message || 'Неизвестная ошибка'));
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
