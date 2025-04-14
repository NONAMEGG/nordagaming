export default class GroundManager {
    constructor(scene) {
        this.scene = scene;
        this.tiles = [];
        this.tileWidth = 1899 * 0.09;
        this.tileHeight = 100;
        this.init();
    }

    init() {
        this.clearTiles();
        const visibleWidth = this.scene.cameras.main.width;
        const tileCount = Math.ceil(visibleWidth * 1.5 / this.tileWidth) + 1;
        
        for (let i = 0; i < tileCount; i++) {
            this.createTile(i * this.tileWidth);
        }
    }

    createTile(x) {
        const y = this.scene.sys.game.config.height - this.tileHeight + 100;
        const frame = Phaser.Math.Between(1, 5);
        
        const tile = this.scene.add.image(x, y, `floor_frame${frame}`)
            .setOrigin(0, 1)
            .setScale(0.09)
            .setDepth(5);

        // Физическое тело с постоянной активацией
        this.scene.physics.add.existing(tile, true);
        tile.body
            .setSize(this.tileWidth, this.tileHeight)
            .setOffset(0, -this.tileHeight);

        this.tiles.push(tile);
        return tile;
    }

    update(speed) {
        const cameraRight = this.scene.cameras.main.scrollX + this.scene.cameras.main.width;
        let needsNewTile = false;

        this.tiles.forEach(tile => {
            tile.x -= speed;
            
            // Обновляем физическое тело без пересоздания
            tile.body.updateFromGameObject();
            
            // Если тайл полностью ушел за левую границу
            if (tile.x + this.tileWidth < this.scene.cameras.main.scrollX) {
                needsNewTile = true;
            }
        });

        // Перемещаем крайний левый тайл вправо вместо удаления
        if (needsNewTile) {
            const firstTile = this.tiles.shift();
            const lastTile = this.tiles[this.tiles.length - 1];
            
            firstTile.x = lastTile.x + this.tileWidth;
            firstTile.setTexture(`floor_frame${Phaser.Math.Between(1, 5)}`);
            firstTile.body.enable = true;
            
            this.tiles.push(firstTile);
        }
    }

    clearTiles() {
        this.tiles.forEach(tile => {
            tile.destroy();
        });
        this.tiles = [];
    }

    getCollisionGroup() {
        return this.tiles;
    }
}