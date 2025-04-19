export default class Coin extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, group, texture) {
        super(scene, x, y, texture || 'coin');
        scene.add.existing(this);
        scene.physics.add.existing(this);


        const targetSize = 80;
        this.setDisplaySize(targetSize, targetSize);

        const hitboxSize = 400; //размер хитбокса
        this.body
            .setSize(hitboxSize, hitboxSize)
            .setOffset(
                (this.width - hitboxSize) / 2,  // Центрирование
                (this.height - hitboxSize) / 2  // 
            )
            .allowGravity = false;

        this.setImmovable(true);
        group.add(this);
    }

    update(speed) {
        this.setVelocityX(-speed * 200);
        
        if (this.x < -this.displayWidth * 2) {
            this.destroy();
        }
    }
}