export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, group) {
        const textureKey = 'enemy' + Phaser.Math.Between(1, 5);
        super(scene, x, y, textureKey);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Физическое тело
        this.setOrigin(0.5, 1); // Якорь по центру внизу
        this.setScale(0.35);    // Масштаб

        this.body.setSize(120, 270);
        this.body.setOffset(0, 0);
        this.setImmovable(true);
        
        // Добавляем в группу
        group.add(this);
    }
    
    update(speed) {
        // Движение с постоянной скоростью
        this.setVelocityX(-speed * 200);
        
        // Уничтожение за пределами экрана
        if (this.x < -this.width * 2) {
            this.destroy();
        }
    }
}