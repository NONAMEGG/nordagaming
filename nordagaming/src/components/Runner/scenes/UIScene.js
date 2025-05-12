export default class UiScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UiScene', active: true });
        this.tileSize = 32; // Размер одного тайла в пикселях
        this.clusterOffset = { x: 20, y: 20 }; // Отступ от края экрана
    }
  
    async create() {
        this.bootScene = this.scene.get('BootScene');
        if (!this.bootScene.loadCompleted) {
            this.time.delayedCall(100, this.create.bind(this));
            return;
        }


        if (this.scoreText) this.scoreText.destroy();
        this.scoreText = this.add.text(50, 50, 'Score: 0', {
            fontSize: '48px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setScrollFactor(0);

        this.scoreText.x = this.game.config.width/2 - this.scoreText.width/2;

        if (this.coinsText) this.coinsText.destroy();
        this.coinsText = this.add.text(20, 20, 'Coins: 0', {
            fontSize: '32px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0);
    
        this.registry.events.on('changedata', this.updateData, this);

        this.registry.set('coins', 0);

        this.createClusterFromStorage();
    }

    async createClusterFromStorage() {
        try {
            const coordinates = JSON.parse(localStorage.getItem('coordinates')) || [];
            const coinSkins = JSON.parse(localStorage.getItem('coinSkins')) || [];

            if (!coordinates.length || !coinSkins.length) {
                console.warn('Нет данных координат или скинов в localStorage');
                return;
            }

            // 1. Сначала загружаем ВСЕ текстуры
            await this.loadAllCoinTextures(coinSkins);

            // 2. После загрузки создаем контейнер и спрайты
            this.createCoinSprites(coordinates, coinSkins);
            
        } catch (error) {
            console.error('Ошибка создания кластера:', error);
        }
    }

    async loadAllCoinTextures(coinSkins) {
        return new Promise((resolve) => {
            let loadedCount = 0;
            const total = coinSkins.length;

            if (total === 0) {
                resolve();
                return;
            }

            coinSkins.forEach(skin => {
                const textureKey = `coin_${skin.id}`;
                
                // Если текстура уже существует, пропускаем
                if (this.textures.exists(textureKey)) {
                    loadedCount++;
                    if (loadedCount === total) resolve();
                    return;
                }

                // Загружаем новую текстуру
                this.textures.addBase64(textureKey, skin.data);
                
                // Ждем когда текстура действительно будет готова
                this.textures.once(`addtexture-${textureKey}`, () => {
                    loadedCount++;
                    console.log(`Текстура ${textureKey} загружена`);
                    
                    if (loadedCount === total) {
                        resolve();
                    }
                });
            });
        });
    }

    createCoinSprites(coordinates, coinSkins) {
        const rightX = this.cameras.main.width - 50;
        const topY = 50;
        const container = this.add.container(rightX, topY).setDepth(100);

        coordinates.forEach(coord => {
            const skin = coinSkins.find(s => s.id === coord.id);
            if (!skin) {
                console.warn(`Не найден скин для id: ${coord.id}`);
                return;
            }

            const textureKey = `coin_${skin.id}`;
            if (!this.textures.exists(textureKey)) {
                console.error(`Текстура ${textureKey} не была загружена!`);
                return;
            }

            const sprite = this.add.sprite(
                parseInt(coord.x) * this.tileSize,
                parseInt(coord.y) * this.tileSize,
                textureKey
            ).setOrigin(0.5);
            
            container.add(sprite);
        });

        Phaser.Display.Align.In.TopRight(container, this.add.zone(
            rightX, topY, 100, 100
        ));
    }
  
    shutdown() {
        this.registry.events.off('changedata', this.updateData, this);
        
        if (this.scoreText) {
            this.scoreText.destroy();
            this.scoreText = null;
        }
        if (this.coinsText) {
            this.coinsText.destroy();
            this.coinsText = null;
        }
        if (this.clusterContainer) {
            this.clusterContainer.destroy(true);
            this.clusterContainer = null;
        }
    }

    updateData(parent, key, value) {
        if (key === 'score' && this.scoreText) {
            this.scoreText.setText(`Score: ${value}`);
        }

        if (key === 'coins' && this.coinsText) {
            this.coinsText.setText(`Coins: ${value} / ${Object.keys(JSON.parse(localStorage.getItem('coinSkins'))).length}`);
        }
    }
}