import Player from '@/components/Runner/objects/Player';
import Enemy from '@/components/Runner/objects/Enemy';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    init() {
        this.score = 0;
        this.gameSpeed = 5;
        this.enemies = this.add.group();
    }

    create() {
        this.soundManager = this.scene.get('BootScene').soundManager;

        // 1. Фон
        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'background')
            .setOrigin(0, 0)
            .setScrollFactor(0);
    
        // 2. Пол - создаем как физический спрайт
        this.ground = this.physics.add.staticSprite(
            this.cameras.main.width / 2, 
            this.cameras.main.height - 25, 
            'ground'
        );
        this.ground.setDisplaySize(this.cameras.main.width * 2, 50);
        
        // 3. Игрок
        this.player = new Player(this, 100, this.cameras.main.height - 150);
    
        // 4. Группа врагов
        this.enemies = this.physics.add.group();
    
        // 5. Коллайдеры
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.enemies, this.ground);
        this.physics.add.overlap(this.player, this.enemies, this.handleCollision, null, this);
    
        // 6. Таймер спавна
        this.spawnTimer = this.time.addEvent({
            delay: 2000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    createGround() {
        this.ground = this.add.rectangle(
            0, 
            this.sys.game.config.height - 50, 
            this.sys.game.config.width * 2, 
            100, 
            0x666666
        ).setOrigin(0, 0);
        this.physics.add.existing(this.ground, true);
    }

    spawnEnemy() {
        // Спавним врагов точно на уровне пола
        const enemy = new Enemy(
            this,
            this.cameras.main.width + 100,
            this.cameras.main.height - 100, // Фиксированная позиция по Y
            this.enemies
        );
        
        // Настраиваем физику
        enemy.body.setAllowGravity(false); // Отключаем гравитацию для врагов
        enemy.body.setImmovable(true);
    }

    setupCollisions() {
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.handleCollision,
            null,
            this
        );
    }

    handleCollision() {
        const currentScore = Math.floor(this.score);
        this.soundManager.pauseMusic();
        this.scene.launch('GameOverScene', { 
            score: currentScore
        })
        this.scene.pause();
    }

    update(time, delta) {
        this.player.update();
        this.enemies.getChildren().forEach(enemy => enemy.update(this.gameSpeed));
        this.incrementScore();
        
        // Увеличиваем сложность со временем
        this.gameSpeed += 0.0005;
    }

    incrementScore() {
        this.score += 0.02;
        this.registry.set('score', Math.floor(this.score));
    }
}