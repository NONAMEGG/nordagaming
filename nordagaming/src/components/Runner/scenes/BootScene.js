// scenes/BootScene.js
import backgroundImage from '@/components/Runner/assets/images/Background/background2.jpg';
import enemy1 from '@/components/Runner/assets/images/Enemy/enemy1.png'
import enemy2 from '@/components/Runner/assets/images/Enemy/enemy2.png';
import enemy3 from '@/components/Runner/assets/images/Enemy/enemy3.png';
import enemy4 from '@/components/Runner/assets/images/Enemy/enemy4.png';
import enemy5 from '@/components/Runner/assets/images/Enemy/enemy5.png';
import grib from '@/components/Runner/assets/images/Player/Grib1.png';
import grib2 from '@/components/Runner/assets/images/Player/Grib2.png';
import grib3 from '@/components/Runner/assets/images/Player/Grib3.png';
import grib4 from '@/components/Runner/assets/images/Player/Grib4.png';
import floor1 from '@/components/Runner/assets/images/Floor/floor1.png'
import floor2 from '@/components/Runner/assets/images/Floor/floor2.png'
import floor3 from '@/components/Runner/assets/images/Floor/floor3.png'
import floor4 from '@/components/Runner/assets/images/Floor/floor4.png'
import floor5 from '@/components/Runner/assets/images/Floor/floor5.png'
import coinImage from '@/components/Runner/assets/images/Coin/coin.png';

import gameMusic from '@/components/Runner/assets/sounds/plaing_song.mp3';
import PickUpCoinMusic from '@/components/Runner/assets/sounds/coin.mp3';
import jumpMusic from '@/components/Runner/assets/sounds/jump.mp3'

import SoundManager from '../untils/SoundManager.js';
import ImageService from '../untils/ImageService.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    async loadCoinSkins() {
        try {
            // Удаляем все текстуры монет из кэша Phaser
            const textureKeys = this.textures.getTextureKeys().filter(key => key.startsWith('coin_'));
            textureKeys.forEach(key => this.textures.remove(key));

            // Полная очистка localStorage
            localStorage.removeItem('coinSkins');
            
            // Загрузка новых данных
            const images = await ImageService.fetchCoinImages();
            const uniqueImages = images.filter((img, index, self) =>
                self.findIndex(i => i.id === img.id) === index
            );

            const skins = await Promise.all(uniqueImages.map(async img => {
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
        this.load.audio('jumpMusic', [jumpMusic]);

        localStorage.removeItem('coinSkins');

        await this.loadCoinSkins();

        const savedSkins = JSON.parse(localStorage.getItem('coinSkins')) || [];
        savedSkins.forEach(skin => {
            this.textures.addBase64(`coin_${skin.id}`, skin.data);
        });

        this.load.image('background', backgroundImage);

        this.load.image('enemy1', enemy1);
        this.load.image('enemy2', enemy2);
        this.load.image('enemy3', enemy3);
        this.load.image('enemy4', enemy4);
        this.load.image('enemy5', enemy5);

        this.load.image('player_frame1', grib);
        this.load.image('player_frame2', grib2);
        this.load.image('player_frame3', grib3);
        this.load.image('player_frame4', grib4);

        this.load.image('floor_frame1', floor1);
        this.load.image('floor_frame2', floor2);
        this.load.image('floor_frame3', floor3);
        this.load.image('floor_frame4', floor4);
        this.load.image('floor_frame5', floor5);

        //this.load.image('coin', coinImage);

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
        // Уничтожаем предыдущий SoundManager
        if (this.soundManager) {
            this.soundManager.destroy();
        }
        
        // Инициализируем новый SoundManager
        this.soundManager = new SoundManager(this);
        this.soundManager.initMusic();
            
        const startGame = () => {
            this.soundManager.playMusic();
            this.scene.stop('BootScene');
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