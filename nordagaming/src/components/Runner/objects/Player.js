export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, soundManager) {
        super(scene, x, y, 'player_run', 0);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.soundManager = soundManager;

        this.setOrigin(0.5, 1);
        
        this.setScale(2);
        this.body.setSize(20, 30);
        this.body.setOffset(3, -10);
        this.setCollideWorldBounds(true);

        this.play('run');
        
        this.body.setBounce(0.1);
        this.body.setDragX(200);
        
        this.cursors = scene.input.keyboard.createCursorKeys();

        this.jumpCount = 0;
        this.jumpKeyReleased = true;
    }
    
    update() {
        const isJumpPressed = this.cursors.space.isDown || this.cursors.up.isDown;

        if (isJumpPressed) {
            if (this.jumpKeyReleased && this.jumpCount < 2) {
                this.jump();
                this.jumpKeyReleased = false;
            }
        } else {
            this.jumpKeyReleased = true;
        }

        if (this.body.onFloor() && this.jumpCount === 2) {
            this.isJumping = false;
            this.jumpCount = 0;
        }
    }

    jump() {
        if (this.jumpCount >= 2) return;

        this.soundManager.playSound('jumpMusic');
        this.setVelocityY(0);
        
        this.setVelocityY(-1000);
        
        this.isJumping = true;
        this.jumpCount++;
    }

    destroyPlayer() {
        if (this.body) {
            this.scene.physics.world.disable(this);
        }
        
        if (this.scene) {
            this.scene.children.remove(this);
        }
        
        if (this.cursors) {
            this.cursors.space.off('down');
            this.cursors.up.off('down');
        }
        
        super.destroy();
    }
}