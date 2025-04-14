export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player_run', 0);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Установка якоря в центр спрайта
        this.setOrigin(0.5, 1);
        
        // Физическое тело
        this.setScale(2);
        this.body.setSize(20, 30);
        this.body.setOffset(3, -10);
        this.setCollideWorldBounds(true);

        this.play('run');
        
        // Физические параметры
        this.body.setBounce(0.1);
        this.body.setDragX(200);
        
        // Управление
        this.cursors = scene.input.keyboard.createCursorKeys();
    }
    
    update() {
        if (this.body.onFloor()) {
            this.isJumping = false;
        }
        
        if ((this.cursors.space.isDown || this.cursors.up.isDown) && !this.isJumping) {
            this.jump();
        }
    }
    
    jump() {
        this.setVelocityY(-1000);
        this.isJumping = true;
    }
}