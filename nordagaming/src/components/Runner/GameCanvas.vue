<template>
    <div ref="gameContainer" class="game-container"></div>
</template>
  
<script>
    import Phaser from 'phaser';
    import BootScene from './scenes/BootScene.js';
    import MainScene from './scenes/MainScene.js';
    import UiScene from './scenes/UiScene.js';
    import GameOverScene from './scenes/GameOverScene.js';
    
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
                gravity: { y: 1500 },
                debug: false,
                fixedStep: true
            }
            },
            scene: [BootScene, MainScene, UiScene, GameOverScene]
        };
    
        this.game = new Phaser.Game(config);
        },
        beforeDestroy() {
        if (this.game) this.game.destroy(true);
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