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

import gameMusic from '@/components/Runner/assets/sounds/plaing_song.mp3';
import PickUpCoinMusic from '@/components/Runner/assets/sounds/coin.mp3';
import jumpMusic from '@/components/Runner/assets/sounds/jump.mp3'

import SoundManager from '../untils/SoundManager.js';
import ImageService from '../untils/ImageService.js';
import { getImage } from '@/graph/imagesAPI.js';
import { map } from 'fp-ts/lib/Functor.js';
import { mapActions } from 'pinia';
import { mapBoth } from 'fp-ts/lib/ReaderEither.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
        this.loadCompleted = false;
    }

    async loadCoinSkins() {
        try {
            // Очистка предыдущих текстур
            // this.textures.getTextureKeys()
            //     .filter(key => key.startsWith('coin_'))
            //     .forEach(key => this.textures.remove(key));
            
            // localStorage.removeItem('coinSkins');

            const images = await ImageService.fetchCoinImages();

            const filteredData = images
            .filter(image => image.url !== null)
            .map(({ id, x, y }) => ({ id, x, y }));

            localStorage.setItem('coordinates', JSON.stringify(filteredData))
            
            const skins = await Promise.all(images.map(async img => {
                try {
                    const response = await getImage(img.url);
                    const blob = response.data;
                    
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve({
                            id: img.id,
                            data: reader.result
                        });
                        reader.readAsDataURL(blob);
                    });
                } catch (error) {
                    console.error(`Failed to load image ${img.id}:`, error);
                    return null;
                }
            }));

            const validSkins = skins.filter(skin => skin !== null);
            localStorage.setItem('coinSkins', JSON.stringify(validSkins));
            
            validSkins.forEach(skin => {
                try {
                    const textureKey = `coin_${skin.id}`;
                    if (!this.textures.exists(textureKey)) {
                        this.textures.addBase64(textureKey, skin.data);
                    } else {
                        console.warn(`Текстура ${textureKey} уже существует, пропускаем`);
                    }
                } catch (e) {
                    console.error(`Ошибка добавления текстуры coin_${skin.id}:`, e);
                }
            });
            
        } catch (error) {
            console.error('Failed to load coin skins:', error);
        }
    }

    async preload() {
        this.loadCompleted = false;
        this.load.image('player_frame1', grib);
        this.load.image('player_frame2', grib2);
        this.load.image('player_frame3', grib3);
        this.load.image('player_frame4', grib4);

        this.load.audio('gameMusic', [gameMusic]);
        this.load.audio('PickUpCoinMusic', [PickUpCoinMusic]);
        this.load.audio('jumpMusic', [jumpMusic]);

        this.load.image('background', backgroundImage);

        this.load.image('enemy1', enemy1);
        this.load.image('enemy2', enemy2);
        this.load.image('enemy3', enemy3);
        this.load.image('enemy4', enemy4);
        this.load.image('enemy5', enemy5);

        this.load.image('floor_frame1', floor1);
        this.load.image('floor_frame2', floor2);
        this.load.image('floor_frame3', floor3);
        this.load.image('floor_frame4', floor4);
        this.load.image('floor_frame5', floor5);

        this.createExtendedProgressBar();

        //await this.loadCoinSkins();

        // const savedSkins = JSON.parse(localStorage.getItem('coinSkins')) || [];
        // savedSkins.forEach(skin => {
        //     this.textures.addBase64(`coin_${skin.id}`, skin.data);
        // });

        await this.loadAllResources();
    }

    createExtendedProgressBar(){
        const { width, height } = this.cameras.main;
        this.fullProgress = {
            box: this.add.graphics(),
            bar: this.add.graphics(),
            total: 2
        };

        this.fullProgress.box.fillStyle(0x222222, 0.8)
            .fillRect(width/2 - 160, height/2 - 30, 320, 50);
    }

    async loadAllResources() {
        await new Promise(resolve => {
            this.load.once('complete', resolve);
            this.load.start();
        });
        this.updateProgress(1);

        if (!localStorage.getItem('coinSkins')) await this.loadCoinSkins(); 
        this.updateProgress(2);
        
        this.fullProgress.bar.destroy();
        this.fullProgress.box.destroy();
        this.loadCompleted = true;
    }

    updateProgress(completedSteps) {
        const progress = completedSteps / this.fullProgress.total;
        const { width, height } = this.cameras.main;
        
        this.fullProgress.bar.clear()
            .fillStyle(0xffffff, 1)
            .fillRect(
                width/2 - 150, 
                height/2 - 20, 
                300 * progress, 
                30
            );
    }

    create() {
        this.scene.launch('UiScene');

        if (!this.loadCompleted) {
            this.time.delayedCall(100, this.create.bind(this));
            return;
        }
        if (this.soundManager) {
            this.soundManager.destroy();
        }

        this.soundManager = new SoundManager(this);
        this.soundManager.initMusic();

        const startButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 100,
            'Click to start',
            {
                fontSize: '32px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                backgroundColor: '#444',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5);

        startButton.setInteractive();
        startButton.on('pointerdown', () => {
            this.soundManager.playMusic();
            this.scene.start('MainScene');
        });

        const panel = this.add.graphics()
            .fillStyle(0x333333, 0.8)
            .fillRect(50, 50, 800, 300);

        this.add.text(70, 70, 'Sound Settings', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        });

        this.createPhaserSlider('Music Volume', 120, 'music');
        this.createPhaserSlider('Jump Volume', 180, 'jump');
        this.createPhaserSlider('Coin Volume', 240, 'coin');

        this.createToggleButton();

    }

    shutdown() {
        if (this.soundManager) {
            this.soundManager.destroy();
            this.soundManager = null;
        }
        
        this.children.each(child => {
            if (child.destroy) child.destroy();
        });

        this.scene.stop('UiScene');
    }

    createPhaserSlider(label, y, type) {
        const x = 100;
        const sliderWidth = 300;

        this.add.text(x, y, label, {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        });

        const track = this.add.rectangle(x + 200, y + 20, sliderWidth, 10, 0x666666)
            .setOrigin(0, 0.5);

        const thumb = this.add.circle(track.x + (this.soundManager.volumeSettings[type] * sliderWidth), y + 20, 15, 0xffffff)
            .setInteractive()
            .setDataEnabled();

        const valueText = this.add.text(track.x + sliderWidth + 20, y, `${Math.round(this.soundManager.volumeSettings[type] * 100)}%`, {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        });

        thumb.data.set('type', type);
        thumb.data.set('track', track);
        thumb.data.set('text', valueText);

        this.input.setDraggable(thumb);

        this.input.on('drag', (pointer, thumb, dragX) => {
            const track = thumb.data.get('track');
            const minX = track.x;
            const maxX = track.x + track.width;
            const newX = Phaser.Math.Clamp(dragX, minX, maxX);

            thumb.x = newX;
            const value = (newX - minX) / track.width;
            thumb.data.get('text').setText(`${Math.round(value * 100)}%`);
            this.soundManager.updateVolume(thumb.data.get('type'), value);
        });
    }

    createToggleButton() {
        const button = this.add.text(100, 300, `Sound: ${this.soundManager.soundEnabled ? 'ON' : 'OFF'}`, {
            fontSize: '28px',
            fill: '#fff',
            backgroundColor: '#444',
            padding: { x: 20, y: 10 }
        })
        .setInteractive()
        .on('pointerdown', () => {
            const newState = this.soundManager.toggleSound();
            button.setText(`Sound: ${newState ? 'ON' : 'OFF'}`);
        });
    }
}