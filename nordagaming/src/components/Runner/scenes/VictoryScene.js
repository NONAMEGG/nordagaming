import SoundManager from "../untils/SoundManager";
export default class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    init(data) {
        this.coins = data.coins || 0;
        this.vueContext = data.vueContext;
    }

    create() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.5)
            .setOrigin(0, 0);

        this.vueContext.claimVictoryReward(); //

        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 50,
            'Победа!',
            { fontSize: '48px', fill: '#00ff00' }
        ).setOrigin(0.5);

        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            `Собрано монет: ${this.coins}`,
            { fontSize: '32px', fill: '#ffffff' }
        ).setOrigin(0.5);

        const bootScene = this.scene.get('BootScene');
        if (bootScene.soundManager) {
            bootScene.soundManager.stopMusic();
        }

        // Кнопка рестарта
        const restartText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 100,
            'Click to restart',
            { 
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }
        )
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.stop('VictoryScene');
            localStorage.removeItem('coinSkins');
            this.scene.start('MainScene');
                    
            this.scene.start('BootScene');
        });;
    }
}