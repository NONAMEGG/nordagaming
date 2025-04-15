export default class Coin extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, group) {
        super(scene, x, y, 'coin');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setOrigin(0.5, 0.5);
        this.setScale(0.1);
        this.body
            .setSize(800, 800)
            .setOffset(0, 0)
            .allowGravity = false;
        this.setImmovable(true);
        
        group.add(this);
    }

    update(speed) {
        // Движение влево с общей скоростью игры
        this.setVelocityX(-speed * 200);
        
        // Уничтожение за пределами экрана
        if (this.x < -this.width * 2) {
            this.destroy();
        }
    }
}