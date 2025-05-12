export default class UiScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UiScene', active: true });
    }
  
    create() {
        if (this.scoreText) this.scoreText.destroy();
        this.scoreText = this.add.text(50, 50, 'Score: 0', {
            fontSize: '48px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setScrollFactor(0);

        this.scoreText.x = this.game.config.width/2 - this.scoreText.width/2;

        if (this.coinsText) this.coinsText.destroy();
        this.coinsText = this.add.text(20, 20, 'Coins: 0', {
            fontSize: '32px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0);
    
        this.registry.events.on('changedata', this.updateData, this);

        this.registry.set('coins', 0);
    }
  
    shutdown() {
        this.registry.events.off('changedata', this.updateData, this);
        
        if (this.scoreText) {
            this.scoreText.destroy();
            this.scoreText = null;
        }
        if (this.coinsText) {
            this.coinsText.destroy();
            this.coinsText = null;
        }
    }

    updateData(parent, key, value) {
        if (key === 'score' && this.scoreText) {
            this.scoreText.setText(`Score: ${value}`);
        }

        if (key === 'coins' && this.coinsText) {
            this.coinsText.setText(`Coins: ${value} / ${Object.keys(JSON.parse(localStorage.getItem('coinSkins'))).length}`);
        }
    }
}