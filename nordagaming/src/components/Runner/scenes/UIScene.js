export default class UiScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UiScene', active: true });
    }
  
    create() {
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '24px',
            fill: '#fff'
        });
    
        this.registry.events.on('changedata', this.updateData, this);
    }
  
    updateData(parent, key, value) {
        if (key === 'score') {
            this.scoreText.setText(`Score: ${value}`);
        }
    }
}