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
    import contractData from '@/contracts/contract-address.json'

    
    export default {
        data() {
            return {
                game: null,
                isGameDestroyed: false
            };
        },
        mounted() {
            if (this.game || this.isGameDestroyed) return;

            const config = {
                type: Phaser.AUTO,
                parent: this.$refs.gameContainer,
                width: 2500,
                height: 700,
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { y: 2500 },
                        debug: false,
                        fixedStep: true
                    }
                },
                scale: {
                    mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
                    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
                },
                scene: [BootScene, MainScene, UiScene, GameOverScene, VictoryScene]
            };

            this.game = new Phaser.Game(config);
            
            this.game.events.on('ready', () => {
                const mainScene = this.game.scene.getScene('MainScene');
                if (mainScene) {
                    mainScene.setVueContext(this);
                }
            });
        },
        beforeUnmount() {
            if (this.game) {
                this.game.scene.getScenes(true).forEach(scene => {
                    scene.events.off();
                    if (scene.shutdown) scene.shutdown();
                });
                
                this.game.destroy(true, false);
                this.game = null;
            }
        },
        methods: {
            handleScoreUpdate(newScore) {
                this.$emit('update-score', newScore);
            },

            async claimVictoryReward() {
                if (window.ethereum) {
                    try {
                    const web3 = new Web3(window.ethereum);
                    await window.ethereum.enable();
                    
                    const contractAddress = contractData.VictoryReward; // import from deploy.cjs
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
        width: 100% !important;
        /* height: 700px !important; */
        overflow: hidden;
        margin: 0 auto;
    }

    body {
        touch-action: none;
        zoom: reset;
    }
</style>