export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, group) {
        const textureKey = 'enemy' + Phaser.Math.Between(1, 5);
        super(scene, x, y, textureKey);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setOrigin(0.5, 1); 
        this.setScale(0.35);

        this.body.setSize(120, 270);
        this.body.setOffset(0, 0);
        this.setImmovable(true);
        
        group.add(this);
    }
    
    update(speed) {
        this.setVelocityX(-speed * 200);
        
        if (this.x < -this.width * 2) {
            this.destroy();
        }
    }

    destroyEnemy() {
        if (this.body) {
            this.scene.physics.world.disable(this);
        }
        
        if (this.scene) {
            this.scene.children.remove(this);
        }
        
        super.destroy();
    }
}