<template>
    <div ref="gameContainer" class="game-container"></div>
</template>
  
<script>
    import Phaser from 'phaser';
    import BootScene from './scenes/BootScene.js';
    import MainScene from './scenes/MainScene.js';
    import UiScene from './scenes/UIScene.js';
    import GameOverScene from './scenes/GameOverScene.js';
    import VictoryScene from './scenes/VictoryScene.js';
    import Web3 from 'web3';
    import VictoryRewardJson from '../../../artifacts/contracts/VictoryReward.sol/VictoryReward.json'

    
    export default {
        mounted() {
            const config = {
                type: Phaser.AUTO,
                parent: this.$refs.gameContainer,
                width: 2500,
                height: 700,
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { y: 2500 },
                        debug: true,
                        fixedStep: true
                    }
                },
                scene: [BootScene, MainScene, UiScene, GameOverScene, VictoryScene]
            };

            this.game = new Phaser.Game(config);
            
            // Связываем Phaser с Vue компонентом
            this.game.events.on('ready', () => {
                const mainScene = this.game.scene.getScene('MainScene');
                if (mainScene) {
                    mainScene.setVueContext(this); // Передаем контекст в сцену
                }
            });
        },
        beforeDestroy() {
            if (this.game) this.game.destroy(true);
        },
        methods: {
            // Отправка обновленного счета
            handleScoreUpdate(newScore) {
                this.$emit('update-score', newScore);
            },

            async claimVictoryReward() {
                console.log(VictoryRewardJson.abi)
                if (window.ethereum) {
                    try {
                    const web3 = new Web3(window.ethereum);
                    await window.ethereum.enable();
                    
                    const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"; // import from deploy.cjs
                    const contractABI = VictoryRewardJson.abi;
                    
                    const contract = new web3.eth.Contract(contractABI, contractAddress);
                    const accounts = await web3.eth.getAccounts();
                    
                    await contract.methods.claimReward().send({ from: accounts[0] });
                    alert("100 ETH успешно начислены!");
                    } catch (error) {
                        console.error("Ошибка:", error);
                    }
                } else {
                    alert("Установите MetaMask!");
                }
            }
        }
    };
</script>
    
<style scoped>
    .game-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
    }
</style>