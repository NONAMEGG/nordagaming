import SoundManager from "../untils/SoundManager";
export default class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    init(data) {
        this.score = data.score || 0;
        this.coins = data.coins || 0;
        this.vueContext = data.vueContext;
    }

    async create() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.5)
            .setOrigin(0, 0);
            
        this.vueContext.onVictory();
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


        await this.saveProgress(this.score);
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
        )
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.stop('UiScene');
            this.scene.stop('MainScene');
            this.scene.stop('GameOverScene');
            this.scene.stop('VictoryScene');

            const bootScene = this.scene.get('BootScene');
            if (bootScene.soundManager) {
                bootScene.soundManager.destroy();
            }

            this.scene.start('UiScene');
            this.scene.start('BootScene');
        });
    }

    async saveProgress(score) {
      console.log(userStore.user.id)
      const response = await updateUserRecords(userStore.user.id, score);
      if(response){
        userStore.updateProfile({
          total_score: response.data.new_score,
        });
        console.log('Данные с сервера по рекорду', response)
      }
    }

    shutdown() {
        this.children.each(child => {
            if (child.destroy) child.destroy();
        });
    }
}
