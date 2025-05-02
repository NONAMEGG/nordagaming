import Player from '@/components/Runner/objects/Player';
import Enemy from '@/components/Runner/objects/Enemy';
import GroundManager from '../objects/GroundManager';
import Coin from '../objects/Coins';
import { useUserStore } from '../../../stores/userStore'

const userStore = useUserStore();

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.groundTiles = [];
        this.backgrounds = [];
        this.vueContext = null; //для хранения контекста
    }

    init() {
        this.score = 0;
        this.currentSkinIndex = 0;
        this.coinsCollected = 0;
        this.gameSpeed = 1;
        this.gameMaxSpeed = 8;
        this.acceleration = 0.0005;
        this.enemies = this.add.group();
        this.nextCoinThreshold = 1; //15
        this.nextCoinThrough = 1;  //20
        this.baseWaveSpacing = 55;
        this.registry.set('coins', 0);
    }

    create() {
        const existingTextures = this.textures.getTextureKeys().filter(key => key.startsWith('coin_'));
        existingTextures.forEach(key => this.textures.remove(key));

        this.soundManager = this.scene.get('BootScene').soundManager;

        this.physics.world.createDebugGraphic();
        this.physics.world.drawDebug = false;

        this.createBackground();

        this.groundManager = new GroundManager(this);


        this.anims.create({
            key: 'run',
            frames: [
                { key: 'player_frame1' },
                { key: 'player_frame2' },
                { key: 'player_frame3' },
                { key: 'player_frame4' }
            ],
            frameRate: 10,
            repeat: -1
        });

        this.player = new Player(this, 100, this.cameras.main.height - 150, this.soundManager).setDepth(10);

        this.enemies = this.physics.add.group().setDepth(5);

        this.spawnEnemy();
        this.spawnTimer = this.time.addEvent({
            delay: 2000,       
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });


        this.coinGroup = this.physics.add.group({
            allowGravity: false,
            immovable: true
        }).setDepth(5);

        this.availableSkins = this.loadCoinSkins();
        this.collectedSkins = new Set();


        this.setupCollisions();
    }

    update(time, delta) {
        this.moveBackground();
        this.groundManager.update(this.gameSpeed * 1.5);

        this.physics.world.collide(this.player, this.enemies);

        this.player.update();
        this.enemies.getChildren().forEach(enemy => enemy.update(this.gameSpeed));

        this.spawnCoinIfNeeded();
        this.coinGroup.getChildren().forEach(coin => coin.update(this.gameSpeed));

        this.incrementScore();

        if (this.gameSpeed < this.gameMaxSpeed) {
            this.gameSpeed += this.acceleration;
        }

        this.gameSpeed = Phaser.Math.Clamp(
            this.gameSpeed,
            4,
            this.gameMaxSpeed
        );
    }

    shutdown() {
        this.enemies.clear(true, true);
        this.textures.getTextureKeys()
        .filter(key => key.startsWith('coin_'))
        .forEach(key => this.textures.remove(key));
        this.coinGroup.clear(true, true);
        
        if (this.groundManager) {
            this.groundManager.clearTiles();
            this.groundManager.destroy();
            this.groundManager = null;
        }
        
        if (this.player) {
            this.player.destroyPlayer();
            this.player = null;
        }
        
        this.anims.remove('run');
        
        this.registry.events.off('changedata');
        
        this.time.removeAllEvents();
        
        this.enemies = null;
        this.coinGroup = null;
        this.vueContext = null;
    }

    setVueContext(context) {
        this.vueContext = context;
    }

    loadCoinSkins() {
        const skins = JSON.parse(localStorage.getItem('coinSkins')) || [];
        skins.forEach(skin => {
            const textureKey = `coin_${skin.id}`;
            if (!this.textures.exists(textureKey)) {
                this.textures.addBase64(textureKey, skin.data);
            } else {
                console.warn(`Texture ${textureKey} already exists, skipping`);
            }
        });
        return skins;
    }

    handlePlayerCoinCollision(player, coin) {
        if (coin.destroyCoin) { 
            coin.destroyCoin();
        }
        this.coinsCollected++;
        this.registry.set('coins', this.coinsCollected);
        this.soundManager.playSound('PickUpCoinMusic');

        const textureKey = coin.texture.key;
        if (!textureKey.startsWith('coin_')) return; // Пропускаем базовые монеты

        if (this.coinsCollected === this.availableSkins.length) {
            this.scene.start('VictoryScene', {
                coins: this.coinsCollected,
                vueContext: this.vueContext
            });
        }
    }

    spawnCoinIfNeeded() {
        if (this.score >= this.nextCoinThreshold) {
            this.spawnCoin();
            this.nextCoinThreshold += this.nextCoinThrough;
        }
    }

    spawnCoin() {
        if (this.availableSkins.length === 0) return;

        const x = this.cameras.main.width + Phaser.Math.Between(200, 400);
        const y = this.cameras.main.height - 250;

        const skin = this.availableSkins[this.currentSkinIndex];
        new Coin(this, x, y, this.coinGroup, `coin_${skin.id}`);

        this.currentSkinIndex = (this.currentSkinIndex + 1) % this.availableSkins.length;
    }


    setupCollisions() {
        // Удаляем старые коллайдеры
        if (this.playerGroundCollider) {
            this.physics.world.removeCollider(this.playerGroundCollider);
        }

        // Создаем новые коллайдеры
        this.playerGroundCollider = this.physics.add.collider(
            this.player,
            this.groundManager.getCollisionGroup(),
            null, null, this
        );

        if (this.playerEnemyCollider) {
            this.physics.world.removeCollider(this.playerEnemyCollider);
        }

        // Коллайдер между игроком и врагами
        this.playerEnemyCollider = this.physics.add.overlap(
            this.player,
            this.enemies,
            this.handlePlayerEnemyCollision,
            null,
            this
        );

        // Коллайдер для врагов
        this.physics.add.collider(
            this.enemies,
            this.groundManager.getCollisionGroup()
        );

        // Коллайдер монет с игроком
        this.physics.add.overlap(
            this.player,
            this.coinGroup,
            this.handlePlayerCoinCollision,
            null,
            this
        );
    }

    createBackground() {
        this.backgrounds = [];
        const bgWidth = this.textures.get('background').getSourceImage().width;

        for (let i = 0; i < 3; i++) {
            const bg = this.add.image(bgWidth * i, 0, 'background')
                .setOrigin(0, 0)
                .setScrollFactor(0)
                .setDepth(0);
            this.backgrounds.push(bg);
        }
    }

    moveBackground() {
        const speed = this.gameSpeed * 2;
        const bgWidth = this.backgrounds[0].width;

        this.backgrounds.forEach(bg => {
            bg.x -= speed * 0.2;

            // Если фон ушел за экран - перемещаем его в конец цепочки
            if (bg.x <= -bgWidth) {
                const lastBg = this.backgrounds.reduce((prev, current) =>
                    (current.x > prev.x) ? current : prev
                );
                bg.x = lastBg.x + bgWidth;
            }
        });
    }

    spawnEnemy() {
        const rightmostEnemy = this.getRightmostEnemy();

        const waveSpacing = this.baseWaveSpacing * this.gameSpeed;

        if (rightmostEnemy) {
            const rightmostEdge = rightmostEnemy.x + rightmostEnemy.width;
            const spawnThreshold = this.cameras.main.width - waveSpacing;
            if (rightmostEdge > spawnThreshold) {
                const distanceToMove = rightmostEdge - spawnThreshold;
                const delay = (distanceToMove / this.gameSpeed) * 1000; // Время в мс
                this.time.delayedCall(delay, this.spawnEnemy, [], this);
                return;
            }
        }

        const random = Phaser.Math.Between(1, 100);
        let enemyCount;
        if (random <= 50) enemyCount = 1;
        else if (random <= 80) enemyCount = 2;
        else enemyCount = 3;

        const groundY = this.cameras.main.height - 100;
        let currentX = this.cameras.main.width + 200;

        for (let i = 0; i < enemyCount; i++) {
            if (i > 0) {
                const spacing = Phaser.Math.Between(50, 150);
                currentX += spacing;
            }
            new Enemy(this, currentX, groundY, this.enemies);
        }

        const baseDelay = Phaser.Math.Between(2000, 4000);
        const speedAdjustedDelay = baseDelay / this.gameSpeed;
        this.time.delayedCall(speedAdjustedDelay, this.spawnEnemy, [], this);
    }

    getRightmostEnemy() {
        return this.enemies.getChildren().reduce((max, enemy) =>
            enemy.x > (max?.x || 0) ? enemy : max, null);
    }

    handlePlayerEnemyCollision(player, enemy) {
        this.physics.pause();

        player.setActive(false).setVisible(false);

        this.time.removeAllEvents();

        this.scene.launch('GameOverScene', {
            score: Math.floor(this.score)
        });

        this.scene.pause();

    }

    incrementScore() {
        this.score += 0.02;
        this.registry.set('score', Math.floor(this.score));

        if (this.vueContext) {
            this.vueContext.handleScoreUpdate(Math.floor(this.score));
        }
    }
}
