export default class UiScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UiScene', active: true });
    }
  
    create() {
        this.scoreText = this.add.text(50, 50, 'Score: 0', {
            fontSize: '48px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setScrollFactor(0);

        this.scoreText.x = this.game.config.width/2 - this.scoreText.width/2;

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
  
    updateData(parent, key, value) {
        if (key === 'score') {
            this.scoreText.setText(`Score: ${value}`);
        }

        if (key === 'coins') {
            this.coinsText.setText(`Coins: ${value}`);
        }
    }
}