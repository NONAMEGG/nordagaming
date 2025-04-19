// scenes/BootScene.js
import backgroundImage from '@/components/Runner/assets/images/background2.jpg';
// import playerImage from '@/components/Runner/assets/images/player.png';
import enemyImage from '@/components/Runner/assets/images/enemy.png';
import gameMusic from '@/components/Runner/assets/sounds/plaing_song.mp3';
import PickUpCoinMusic from '@/components/Runner/assets/sounds/coin.mp3';
import grib from '@/components/Runner/assets/images/Grib1.png';
import grib2 from '@/components/Runner/assets/images/Grib2.png';
import grib3 from '@/components/Runner/assets/images/Grib3.png';
import grib4 from '@/components/Runner/assets/images/Grib4.png';
import floor1 from '@/components/Runner/assets/images/floor1.png'
import floor2 from '@/components/Runner/assets/images/floor1.png'
import floor3 from '@/components/Runner/assets/images/floor1.png'
import floor4 from '@/components/Runner/assets/images/floor1.png'
import floor5 from '@/components/Runner/assets/images/floor1.png'
import coinImage from '@/components/Runner/assets/images/coin.png';
import SoundManager from '../untils/SoundManager.js';

import ImageService from '../untils/ImageService.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    async loadCoinSkins() {
        try {
            const images = await ImageService.fetchCoinImages();
            const skins = await Promise.all(images.map(async img => {
                const response = await fetch(img.url);
                const blob = await response.blob();
                return new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = () => resolve({
                        id: img.id,
                        data: reader.result
                    });
                    reader.readAsDataURL(blob);
                });
            }));
            
            localStorage.setItem('coinSkins', JSON.stringify(skins));
        } catch (error) {
            console.error('Failed to load coin skins:', error);
        }
    }
  
    async preload() {
        this.load.audio('gameMusic', [gameMusic]);
        this.load.audio('PickUpCoinMusic', [PickUpCoinMusic]);

        await this.loadCoinSkins();

        const savedSkins = JSON.parse(localStorage.getItem('coinSkins')) || [];
        savedSkins.forEach(skin => {
            this.textures.addBase64(`coin_${skin.id}`, skin.data);
        });

        this.load.image('background', backgroundImage);
        // this.load.image('player', playerImage);
        this.load.image('enemy', enemyImage);

        this.load.image('player_frame1', grib);
        this.load.image('player_frame2', grib2);
        this.load.image('player_frame3', grib3);
        this.load.image('player_frame4', grib4);

        this.load.image('floor_frame1', floor1);
        this.load.image('floor_frame2', floor2);
        this.load.image('floor_frame3', floor3);
        this.load.image('floor_frame4', floor4);
        this.load.image('floor_frame5', floor5);

        this.load.image('coin', coinImage);

        // Прогресс-бар
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
        
        this.soundManager.initMusic(); //Инициализируем перед использованием
        
        const startGame = () => {
            this.soundManager.playMusic();
            this.input.off('pointerdown', startGame);
            this.scene.start('MainScene');
        };

        this.input.on('pointerdown', startGame);
        
        //Текст-инструкция
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