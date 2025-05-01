<template>
  <v-container class="main_window" fluid>
    <v-card class="mb-6 pa-4">
      <v-row>
        <v-col cols="12" md="6">
          <v-list dense>
            <v-list-item>
              <v-list-item-icon>
                <v-icon color="primary">mdi-gamepad-variant</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Текущая игра: #{{ currentGameId }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon color="success">mdi-timer-sand</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Статус: {{ gameEnded ? 'Завершена' : 'Активна' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon color="amber">mdi-currency-eth</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Общая сумма ставок: {{ totalBets }} ETH</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="nftDeposited">
              <v-list-item-icon>
                <v-icon color="deep-purple">mdi-diamond-stone</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>NFT залогирован (ID: {{ nftId }})</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="customBetAmount"
            :disabled="!canBet"
            label="Сумма ставки (ETH)"
            type="number"
            step="0.01"
            min="0"
            prepend-inner-icon="mdi-currency-eth"
            outlined
            dense
            class="mb-4"
          />
          <v-btn
            color="primary"
            :disabled="!canBet"
            class="mb-2 mr-2"
            @click="placeBet"
            prepend-icon="mdi-cash-plus"
          >
            Поставить ставку
          </v-btn>
          <v-btn
            color="success"
            :disabled="nftDeposited"
            class="mb-2 mr-2"
            @click="depositNFT"
            prepend-icon="mdi-diamond-stone"
          >
            {{ nftDeposited ? 'NFT уже депозирован' : 'Внести NFT' }}
          </v-btn>
          <v-btn
            color="error"
            :disabled="gameEnded"
            class="mb-2"
            @click="endGameEarly"
            prepend-icon="mdi-stop-circle"
          >
            Завершить досрочно
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
    <v-row align="center">
      <v-col cols="12" md="6">
        <GetBets />
      </v-col>
      <v-col cols="12" md="6">
        <CountDown :end-time="bettingEndTime" />
      </v-col>
    </v-row>
  </v-container>
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
const totalBets = ref('0');
const bettingEndTime = ref(0);
const customBetAmount = ref('');

const canBet = computed(() => !gameEnded.value && nftDeposited.value);

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

onMounted(async () => {
  await initGameData();
  setInterval(initGameData, 15000);
});
</script>

<style scoped>
.main_window {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
</style>
