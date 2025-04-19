<template>
  <div class="game-timer">
    <h2>⏳ До окончания приёма ставок:</h2>

    <p v-if="!nftDeposited">🔒 Игра ещё не началась. Ожидается депозит NFT...</p>
    <p v-else-if="timeLeft">{{ timeLeft }}</p>
    <p v-else>Загрузка таймера...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ethers } from 'ethers'
import contractABI from '../../contracts/nftBetting.json'

const timeLeft = ref('')
const bettingEndTime = ref(0)
const nftDeposited = ref(false)
const NFT_BETTING_ADDRESS = '0x851356ae760d987E095750cCeb3bC6014560891C'

let contract
let timerInterval
let refreshInterval

const loadContract = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    contract = new ethers.Contract(NFT_BETTING_ADDRESS, contractABI, signer)
  } catch (err) {
    console.error('Ошибка инициализации контракта:', err)
  }
}

const fetchGameState = async () => {
  if (!contract) return

  try {
    const [endTime, isDeposited] = await Promise.all([
      contract.bettingEndTime(),
      contract.nftDeposited()
    ])
    bettingEndTime.value = Number(endTime)
    nftDeposited.value = isDeposited
  } catch (err) {
    console.error('Ошибка получения данных:', err)
    timeLeft.value = 'Ошибка загрузки таймера'
  }
}

const updateTimer = () => {
  if (!nftDeposited.value) {
    timeLeft.value = ''
    return
  }

  const now = Math.floor(Date.now() / 1000)
  const diff = bettingEndTime.value - now

  if (diff > 0) {
    const minutes = Math.floor(diff / 60)
    const seconds = diff % 60
    timeLeft.value = `${minutes} мин ${seconds} сек`
  } else {
    timeLeft.value = '⛔ Время вышло'
  }
}

onMounted(async () => {
  await loadContract()
  await fetchGameState()

  timerInterval = setInterval(updateTimer, 1000)
  refreshInterval = setInterval(fetchGameState, 5000)
})

onUnmounted(() => {
  clearInterval(timerInterval)
  clearInterval(refreshInterval)
})
</script>

<style scoped>
.game-timer {
  padding: 1rem;
  border: 2px dashed #999;
  border-radius: 12px;
  max-width: 300px;
  margin: 0 auto;
  text-align: center;
  background-color: #000000;
  font-family: 'Courier New', Courier, monospace;
  color: white;
}
</style>
