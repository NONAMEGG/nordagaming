import SoundManager from "../untils/SoundManager";

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.score = data.score || 0;
    }

    create() {
        // Затемнение фона
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.5)
            .setOrigin(0, 0);

        // Текст Game Over
        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 50,
            'Game Over',
            { 
                fontSize: '48px',
                fill: '#ff0000',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5);

        // Отображение счета
        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            `Score: ${this.score}`,
            { 
                fontSize: '32px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5);

        // Кнопка рестарта
        const restartText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 100,
            'Click to menu',
            { 
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5);

        const bootScene = this.scene.get('BootScene');
        if (bootScene.soundManager) {
            bootScene.soundManager.stopMusic();
        }

        restartText.setInteractive();
        restartText.on('pointerdown', () => {
            // Корректная остановка звуков через SoundManager
            const bootScene = this.scene.get('BootScene');
            if (bootScene.soundManager) {
                bootScene.soundManager.destroy();
            }
        
            // Остановка всех активных сцен
            this.scene.stop('MainScene');
            this.scene.stop('GameOverScene'); // или VictoryScene
            
            // Полный перезапуск игры через BootScene
            this.scene.start('BootScene');
        });
    }
}