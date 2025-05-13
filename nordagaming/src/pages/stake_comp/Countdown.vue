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
import Web3 from 'web3'
import contractABI from '../../contracts/nftBetting.json'
import contractAddresses from '../../contracts/contract-addresses.json'

const timeLeft = ref('')
const bettingEndTime = ref(0)
const nftDeposited = ref(false)

let contract
let timerInterval
let refreshInterval

const loadContract = async () => {
  try {
    if (!window.ethereum) throw new Error('MetaMask не установлен')
    
    const web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(
      contractABI,
      contractAddresses.NFTBetting
    )
  } catch (err) {
    console.error('Ошибка инициализации контракта:', err)
    throw err
  }
}

const fetchGameState = async () => {
  if (!contract) {
    await loadContract()
  }

  try {
    const [endTime, isDeposited] = await Promise.all([
      contract.methods.bettingEndTime().call(),
      contract.methods.nftDeposited().call()
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
    clearInterval(timerInterval)
  }
}

onMounted(async () => {
  try {
    await loadContract()
    await fetchGameState()

    timerInterval = setInterval(updateTimer, 1000)
    refreshInterval = setInterval(fetchGameState, 5000)
  } catch (error) {
    console.error('Ошибка инициализации:', error)
    timeLeft.value = 'Ошибка подключения к контракту'
  }
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