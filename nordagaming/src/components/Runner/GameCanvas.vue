<template>
    <div ref="gameContainer" class="game-container"></div>
    <!-- Winner Popup Dialog -->
    <v-dialog v-model="haveWon" persistent>
      <v-card>
        <v-card-title class="text-h5 text-center">🎉 Congratulations! 🎉</v-card-title>
        <v-card-text class="text-center">
          You have won the game!
          <div class="mt-4">
            <canvas
              :width="compositeWidth"
              :height="compositeHeight"
              class="composite-canvas"
              ref="compositeCanvas"
            ></canvas>
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" @click="goToMainPage">Go to Main Page</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
                isGameDestroyed: false,
                haveWon: false,
                sortedCoinRows: [],
                compositeWidth: 0,
                compositeHeight: 0,
                pieceSize: 64,
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
        watch: {
            haveWon(newValue) {
                if (newValue) {
                    this.prepareCoinGrid();
                }
            }
        },
        methods: {
            handleScoreUpdate(newScore) {
                this.$emit('update-score', newScore);
            },
            closeDialog() {
                this.haveWon = false;
            },
            onVictory() {
                this.haveWon = true;
            },
            goToMainPage() {
                this.$router.push("/");
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
            },
            prepareCoinGrid() {
                const img = new Image();
                img.width = 100; 
                img.height = 100; 
                // Get coins as a flat, already sorted list (by y, then x)
                let coins = [];
                try {
                    coins = JSON.parse(localStorage.getItem('coinSkins')) || [];
                } catch (e) {
                    coins = [];
                    console.log(e);
                }
                const minX = Math.min(...coins.map(item => Number(item.x)));
                const maxX = Math.max(...coins.map(item => Number(item.x)));

                const rows = [];
                let currentRow = [];
                let lastY = null;
                let currentX = minX;
                coins.forEach((coin, idx) => {
                    const y = coin.y;
                    const x = coin.x;
                    if (lastY === null || y !== lastY) {
                        if (currentRow.length) rows.push(currentRow);
                        currentRow = [];
                        lastY = y;
                        currentX = minX;
                    }
                        while(currentX !== Number(x)) {
                            if (currentX < Number(x)) {
                                const emptyData = {
                                    x: currentX,
                                    y: y,
                                    data: null,
                                };
                                currentRow.push(emptyData);
                            }
                            currentX++;

                        }
                        currentRow.push(coin);
                    currentX++;

                });

                if (currentRow.length) rows.push(currentRow);
                this.sortedCoinRows = rows;
                console.log(this.sortedCoinRows);
                this.$nextTick(() => {
                    this.drawCompositeImage();
                });
            },
            async drawCompositeImage() {
                if (!this.sortedCoinRows.length) return;
                const rows = this.sortedCoinRows;
                const pieceSize = this.pieceSize;
                const rowCount = rows.length;
                const colCount = Math.max(...rows.map(r => r.length));
                this.compositeWidth = colCount * pieceSize;
                this.compositeHeight = rowCount * pieceSize;
                const canvas = this.$refs.compositeCanvas;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, this.compositeWidth, this.compositeHeight);

                // Draw each piece
                for (let y = 0; y < rowCount; y++) {
                    for (let x = 0; x < rows[y].length; x++) {
                        const coin = rows[y][x];
                        let src = coin.data || null;
                        if (!src) {
                            ctx.strokeRect(x * pieceSize, y * pieceSize, pieceSize, pieceSize);
                        }
                        else {
                            await this.drawImageToCanvas(ctx, src, x * pieceSize, y * pieceSize, pieceSize, pieceSize);
                        }
                    }
                }
            },
            drawImageToCanvas(ctx, src, x, y, w, h) {
                return new Promise(resolve => {
                    const img = new window.Image();
                    img.crossOrigin = "anonymous";
                    img.onload = () => {
                        ctx.drawImage(img, x, y, w, h);
                        resolve();
                    };
                    img.onerror = () => resolve();
                    img.src = src;
                });
            },
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

.composite-canvas {
    border-radius: 12px;
    border: 2px solid #eee;
    background: #222;
    margin: 0 auto;
    display: block;
}
</style>