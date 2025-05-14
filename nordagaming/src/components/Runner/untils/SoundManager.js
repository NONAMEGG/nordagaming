export default class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.music = null;
        this.sounds = [];
        this.soundEnabled = true;
        // this._musicConfig = {
        //     loop: true,
        //     volume: 0.5
        // };
        this.volumeSettings = {
            music: 0.5,
            jump: 1.0,
            coin: 1.0
        };

        this.loadSettings();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('soundSettings');
        if (savedSettings) {
            this.volumeSettings = JSON.parse(savedSettings);
        }
    }

    saveSettings() {
        localStorage.setItem('soundSettings', JSON.stringify(this.volumeSettings));
    }

    updateVolume(type, value) {
        this.volumeSettings[type] = value;
        if (type === 'music' && this.music) {
            this.music.setVolume(value);
        }
        this.saveSettings();
    }

    initMusic() {
        if (!this.music || this.music.isDestroyed) {
            this.music = this.scene.sound.add('gameMusic', this._musicConfig);
        }
    }

    playMusic() {
        if (!this.soundEnabled) return;
        
        this.initMusic();
        if (!this.music.isPlaying) {
            this.music.setVolume(this.volumeSettings.music);
            this.music.play();
        }
    }

    stopMusic() {
        if (this.music) {
            this.music.stop();
        }
    }

    // Пауза музыки
    pauseMusic() {
        if (this.music && this.music.isPlaying) {
            this.music.pause();
        }
    }

    // Воспроизведение звукового эффекта 
    playSound(key, config = {}) {
        if (!this.soundEnabled) return;
        
        let volume = 1;
        if (key === 'jumpMusic') volume = this.volumeSettings.jump;
        if (key === 'PickUpCoinMusic') volume = this.volumeSettings.coin;

        const sound = this.scene.sound.add(key, {
            volume: volume,
            ...config
        });
        
        this.sounds.push(sound);
        sound.play();
        return sound;
    }

    // Переключение звука (вкл/выкл)
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        if (!this.soundEnabled) {
            this.stopMusic();
        } else {
            this.playMusic();
        }
        return this.soundEnabled;
    }

    destroy() {
        if (this.music) {
            this.music.stop();
            this.music.destroy();
            this.music = null;
        }
        this.sounds.forEach(sound => {
            sound.stop();
            sound.destroy();
        });
        this.sounds.length = 0;
    }

    reset() {
        if (this.music) this.music.stop();
        this.sounds.forEach(sound => sound.stop());
        this.sounds = []; // Используем присваивание вместо clear()
    }
}