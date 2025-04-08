export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Физическое тело
        this.body.setSize(120, 240); // Увеличиваем хитбокс
        this.setScale(0.5);
        this.body.setOffset(10, 5);
        this.setCollideWorldBounds(true);
        
        // Физические параметры
        this.body.setBounce(0.2);
        this.body.setDragX(200);
        
        // Управление
        this.cursors = scene.input.keyboard.createCursorKeys();
    }
    
    update() {
        // Улучшенное управление
        if (this.body.onFloor()) {
            this.isJumping = false;
        }
        
        if ((this.cursors.space.isDown || this.cursors.up.isDown) && !this.isJumping) {
            this.jump();
        }
    }
    
    jump() {
        this.setVelocityY(-800);
        this.isJumping = true;
    }
}