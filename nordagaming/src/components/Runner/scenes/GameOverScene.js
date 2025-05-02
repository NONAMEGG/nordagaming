import SoundManager from "../untils/SoundManager";
import { updateUserRecords } from '../../../http/recordsAPI'
import { useUserStore } from "../../../stores/userStore";

const userStore = useUserStore();

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.score = data.score || 0;
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
    async create() {    
        const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(0);
    
        this.uiElements = this.add.group();
        this.uiElements.add(bg);
    
        const gameOverText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 50,
            'Game Over',
            {
                fontSize: '48px',
                fill: '#ff0000',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5).setDepth(1);
        this.uiElements.add(gameOverText);
    
        const scoreText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            `Score: ${this.score}`,
            {
                fontSize: '32px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5).setDepth(1);
        this.uiElements.add(scoreText);
    
        await this.saveProgress(this.score);
    
        this.restartText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 100,
            'Click to menu',
            {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                backgroundColor: '#333',
                padding: { x: 20, y: 10 }
            }
        )
        .setOrigin(0.5)
        .setDepth(2)
        .setInteractive();
    
        this.uiElements.add(this.restartText);
    
        this.restartText.on('pointerdown', () => {
            this.cleanupGame();
            this.scene.start('BootScene');
            this.scene.start('UiScene');
        });
    }
    
    cleanupGame() {
        this.scene.stop('UiScene');
        this.scene.stop('MainScene');
        this.scene.stop('GameOverScene');
        this.scene.stop('VictoryScene');
    
        const bootScene = this.scene.get('BootScene');
        if (bootScene?.soundManager) {
            bootScene.soundManager.destroy();
        }
    }
    
    shutdown() {
        if (this.uiElements) {
            this.uiElements.clear(true, true);
        }
        if (this.restartText) {
            this.restartText.off('pointerdown');
        }
    }
}
