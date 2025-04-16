<template>
    <div class="game-timer">
      <h2>⏳ До окончания ставки:</h2>
      <p v-if="timeLeft">{{ timeLeft }}</p>
      <p v-else>Загрузка таймера...</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { ethers } from 'ethers'
  import contractABI from "../../contracts/nftBetting.json";
  
  // refs
  const timeLeft = ref('')
  const bettingEndTime = ref(0)
  const NFT_BETTING_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; 
  
  let contract
  
  const loadContract = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      contract = new ethers.Contract(NFT_BETTING_ADDRESS, contractABI, signer)
  
      const endTime = await contract.bettingEndTime()
      bettingEndTime.value = Number(endTime)
    } catch (err) {
      console.error('Ошибка загрузки контракта:', err)
      timeLeft.value = 'Ошибка загрузки таймера'
    }
  }
  
  const updateTimer = () => {
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
    updateTimer()
    setInterval(updateTimer, 1000)
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
  }
  </style>