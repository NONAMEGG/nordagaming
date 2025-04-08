export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, group) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Физическое тело
        this.setScale(0.5);
        this.body.setSize(80, 270);
        this.body.setOffset(10, 10);
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