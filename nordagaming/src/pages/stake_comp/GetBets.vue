<template>
  <div class="bids_main_container">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Ставки</h1>
    
    <div v-if="bets.length === 0" class="text-lg text-gray-500">Ставки ещё не сделаны.</div>

    <div v-for="(bet, index) in bets" :key="index" class="bid_item">
      <div class="player_id">
        <span class="font-bold text-lg text-gray-800">Игрок: </span>
        <span class="text-gray-600" style="color:red">{{ bet.player }}</span>
      </div>
      <div class="player_bid_amount">
        <span class="font-bold text-lg text-gray-800">Сумма ставки:</span>
        <span class="text-gray-600" style="color:red">{{ ethers.formatEther(bet.amount) }} ETH</span>
      </div>
    </div>

    <button @click="fetchBets" class="button-primary mt-6">
      Обновить список ставок
    </button>

    <div v-if="gameId !== null" class="text-lg text-gray-500 mt-4">
      Текущий ID игры: {{ gameId }}
    </div>

    <div v-if="bets_amount !== null" class="text-lg text-gray-500 mt-4">
      Сумма ставок {{ bets_amount }} ETH
    </div>
  </div>
</template>

<script setup>

import { getNFTBettingContract }  from "../../contracts/Betting";
import { ethers } from "ethers";
import { ref, onMounted, onUnmounted } from "vue";


let pollingInterval;
const bets = ref([]);
const gameId = ref(null);
const bets_amount = ref(null);

// Функция для получения текущего gameId из контракта
const fetchGameId = async () => {
  try {
    const contract = await getNFTBettingContract();
    gameId.value = await contract.gameId(); // Получаем текущий gameId из контракта
    
    const game = await contract.games(gameId.value);
    bets_amount.value = ethers.formatEther(game.totalAmount.toString());
    
    console.log(gameId.value);
    console.log(bets_amount.value);
    fetchBets(); 
  } catch (error) {
    console.error(error);
    alert("Ошибка при получении ID игры");
  }
};

// Функция для получения ставок для текущего gameId
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

// Вызываем fetchGameId при монтировании компонента
onMounted(() => {
  fetchGameId();

  pollingInterval = setInterval(() => {
    fetchGameId();
  }, 5000); 
});

onUnmounted(() => {
  clearInterval(pollingInterval); // очищаем интервал при размонтировании
});
</script>

<style scoped>
.bet-item {
  display: flex;
  flex-direction: column;
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
</style>
