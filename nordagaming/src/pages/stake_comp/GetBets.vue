<template>
  <div class="bids_main_container">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Список игроков, которые поставили ставку</h1>
    
    <div v-if="bets.length === 0" class="text-lg text-gray-500">Ставки ещё не сделаны.</div>

    <div v-for="(bet, index) in bets" :key="index" class="bid_item">
      <div class="flex justify-between">
        <span class="font-bold text-lg text-gray-800">Игрок:</span>
        <span class="text-gray-600">{{ bet.player }}</span>
      </div>
      <div class="flex justify-between mt-2">
        <span class="font-bold text-lg text-gray-800">Сумма ставки:</span>
        <span class="text-gray-600">{{ ethers.formatEther(bet.amount) }} ETH</span>
      </div>
    </div>

    <button @click="fetchBets" class="button-primary mt-6">
      Обновить список ставок
    </button>

    <div v-if="gameId !== null" class="text-lg text-gray-500 mt-4">
      Текущий ID игры: {{ gameId }}
    </div>
  </div>
</template>

<script setup>

import { getNFTBettingContract }  from "../../contracts/Betting";
import { ethers } from "ethers";
import { ref, onMounted } from "vue";

const bets = ref([]);
const gameId = ref(null);

// Функция для получения текущего gameId из контракта
const fetchGameId = async () => {
  try {
    const contract = await getNFTBettingContract();
    gameId.value = await contract.gameId(); // Получаем текущий gameId из контракта
    console.log(gameId);
    fetchBets(); // После получения gameId, запрашиваем ставки
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
