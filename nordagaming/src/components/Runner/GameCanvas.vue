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