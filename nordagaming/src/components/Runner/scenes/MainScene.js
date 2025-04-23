import Player from '@/components/Runner/objects/Player';
import Enemy from '@/components/Runner/objects/Enemy';
import GroundManager from '../objects/GroundManager';
import Coin from '../objects/Coins';

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
        this.gameSpeed = 4;
        this.gameMaxSpeed = 5;
        this.acceleration = 0.0001;
        this.enemies = this.add.group();
        this.nextCoinThreshold = 1; //5
        this.nextCoinThrough = 1;  //10
    }

    create() {
        const existingTextures = this.textures.getTextureKeys().filter(key => key.startsWith('coin_'));
        existingTextures.forEach(key => this.textures.remove(key));

        // Загружаем скины заново
        this.availableSkins = this.loadCoinSkins();

        this.soundManager = this.scene.get('BootScene').soundManager;

        this.physics.world.createDebugGraphic();
        this.physics.world.drawDebug = true;

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
        // this.createGround();
        
        //Игрок
        this.player = new Player(this, 100, this.cameras.main.height - 150, this.soundManager).setDepth(10);
    
        //Группа врагов
        this.enemies = this.physics.add.group().setDepth(5);
    
        this.spawnEnemy(); // Первый спавн сразу
        this.spawnTimer = this.time.addEvent({
            delay: 2000,       // Начальная задержка
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

        // Увеличение скорости до максимальной
        if (this.gameSpeed < this.gameMaxSpeed) {
            this.gameSpeed += this.acceleration; // Настройте значение ускорения
        }

        // Ограничиваем скорость максимумом
        this.gameSpeed = Phaser.Math.Clamp(
            this.gameSpeed, 
            4, 
            this.gameMaxSpeed
        );
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
        coin.destroy();
        this.coinsCollected++;
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
        if (this.availableSkins.length === 0) return; // Защита от пустого списка
        
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

        // Создаем коллайдер между игроком и врагами
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
        // Создаем 3 фона для плавного перехода
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
        const lastEnemy = this.getLastEnemy();
        const minDistanceBetweenWaves = 500;
        
        const random = Phaser.Math.Between(1, 100);
        let enemyCount;
        if (random <= 50) {         // 50% на 1 врага
            enemyCount = 1;
        } else if (random <= 80) {  // 30% на 2 врагов
            enemyCount = 2;
        } else {                    // 20% на 3 врагов
            enemyCount = 3;
        }
    
        // Если последний враг ещё слишком близко - откладываем спавн
        if (lastEnemy && lastEnemy.x > this.cameras.main.width - minDistanceBetweenWaves) {
            this.time.delayedCall(300, this.spawnEnemy, [], this);
            return;
        }
    
        const groundY = this.cameras.main.height - 200;
        let prevX = this.cameras.main.width + 100;
    
        // Выбор множителя расстояния в зависимости от количества врагов
        let distanceMultiplier;
        switch(enemyCount) {
            case 1:
                distanceMultiplier = this.gameSpeed * 0.35;
                break;
            case 2:
                distanceMultiplier = this.gameSpeed * 0.25;
                break;
            case 3:
                distanceMultiplier = this.gameSpeed * 0.1;
                break;
            default:
                distanceMultiplier = 1;
        }
    
        for (let i = 0; i < enemyCount; i++) {
            // Динамическое расстояние с учетом множителя
            const baseDistance = Phaser.Math.Between(150, 200);
            const dynamicDistance = baseDistance * distanceMultiplier;
            
            const x = prevX + dynamicDistance;
            new Enemy(this, x, groundY, this.enemies);
            prevX = x;
        }
    
        // Настройка задержки следующего спавна
        const baseDelay = Phaser.Math.Between(2000, 4000);
        const scaledDelay = baseDelay / Math.max(1, this.gameSpeed / 5);
        this.time.delayedCall(scaledDelay, this.spawnEnemy, [], this);
    }
    
    getLastEnemy() {
        let lastEnemy = null;
        this.enemies.getChildren().forEach(enemy => {
            if (!lastEnemy || enemy.x > lastEnemy.x) {
                lastEnemy = enemy;
            }
        });
        return lastEnemy;
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