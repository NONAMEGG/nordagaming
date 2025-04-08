// scenes/BootScene.js
import backgroundImage from '@/components/Runner/assets/images/background.jpg';
import playerImage from '@/components/Runner/assets/images/player.png';
import enemyImage from '@/components/Runner/assets/images/enemy.png';
import gameMusic from '@/components/Runner/assets/sounds/plaing_song.mp3';
import SoundManager from '../untils/SoundManager';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }
  
    preload() {
        // Загрузка изображений
        this.load.image('background', backgroundImage);
        this.load.image('player', playerImage);
        this.load.image('enemy', enemyImage);

        // Загрузка звука
        this.load.audio('gameMusic', [
            gameMusic
        ]);

        // Прогресс-бар для визуализации загрузки
        const { width, height } = this.cameras.main;
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);
    
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
        });
    
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
        });
    }
  
    create() {

        // Инициализируем SoundManager
        if (!this.soundManager) {
            this.soundManager = new SoundManager(this);
        }
        
        this.soundManager.initMusic(); // Важно: инициализируем перед использованием
        
        const startGame = () => {
            this.soundManager.playMusic();
            this.input.off('pointerdown', startGame);
            this.scene.start('MainScene');
        };

        this.input.on('pointerdown', startGame);
        
        // Текст-инструкция
        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 50,
            'Click to start',
            { 
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
            }
        ).setOrigin(0.5);
    }
}