import Player from '@/components/Runner/objects/Player';
import Enemy from '@/components/Runner/objects/Enemy';
import GroundManager from '../objects/GroundManager';
import Coin from '../objects/Coins';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.groundTiles = []; 
        this.backgrounds = []; 
    }

    init() {
        this.score = 0;
        this.gameSpeed = 4;
        this.gameMaxSpeed = 6.5;
        this.enemies = this.add.group();
        this.coinsCollected = 0;
        this.nextCoinThreshold = 1;
        this.nextCoinThrough = 1;
        this.WINgame = 10;
    }

    create() {
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
        // this.createGround();
        
        //Игрок
        this.player = new Player(this, 100, this.cameras.main.height - 150).setDepth(10);
    
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
    }

    handlePlayerCoinCollision(player, coin) {
        coin.destroy();
        this.coinsCollected++;
        this.soundManager.playSound('PickUpCoinMusic'); 
        
        if (this.coinsCollected >= this.WINgame) {
            this.scene.start('VictoryScene', { coins: this.coinsCollected });
            this.scene.pause();
        }
    }

    spawnCoinIfNeeded() {
        if (this.score >= this.nextCoinThreshold) {
            this.spawnCoin();
            this.nextCoinThreshold += this.nextCoinThrough; 
        }
    }

    spawnCoin() {
        const x = this.cameras.main.width + Phaser.Math.Between(200, 400);
        const y = this.cameras.main.height - 250; // Позиция над землей
        new Coin(this, x, y, this.coinGroup);
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
        // Проверка расстояния до последнего врага
        const lastEnemy = this.getLastEnemy();
        const minDistanceBetweenWaves = 500; // Минимальное расстояние между волнами
        const minDistanceInGroup = 150;      // Минимальное расстояние в группе
        const maxDistanceInGroup = 200;      // Максимальное расстояние в группе
        
        // Если последний враг ещё слишком близко, откладываем спавн
        if (lastEnemy && lastEnemy.x > this.cameras.main.width - minDistanceBetweenWaves) {
            this.time.delayedCall(300, this.spawnEnemy, [], this);
            return;
        }
    
        const random = Phaser.Math.Between(1, 100);
        let enemyCount = random <= 60 ? 1 : 2;
    
        // Позиция Y
        const groundY = this.cameras.main.height - 200;
        
        // Спавн группы врагов с контролем расстояния
        let prevX = this.cameras.main.width + 100; 
        
        for (let i = 0; i < enemyCount; i++) {
            // Вычисляем расстояние до следующего врага в группе
            const distance = Phaser.Math.Between(minDistanceInGroup, maxDistanceInGroup);
            const x = prevX + distance;
            
            new Enemy(this, x, groundY, this.enemies);
            prevX = x; // Запоминаем позицию для следующего врага
        }
    
        // Интервал до следующего спавна (2-4 сек, зависит от скорости)
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
    }
}