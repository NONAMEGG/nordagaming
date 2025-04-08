export default class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.music = null;
        this.soundEnabled = true;
        this._musicConfig = {
            loop: true,
            volume: 0.5
        };
    }

    initMusic() {
        // Создаем новый экземпляр музыки, если его нет или предыдущий был уничтожен
        if (!this.music || this.music.isDestroyed) {
            this.music = this.scene.sound.add('gameMusic', this._musicConfig);
        }
    }

    playMusic() {
        if (!this.soundEnabled) return;
        
        this.initMusic(); // Инициализируем перед воспроизведением
        
        if (!this.music.isPlaying) {
            this.music.play();
        }
    }

    stopMusic() {
        if (this.music) {
            this.music.stop();
            // Не уничтожаем, чтобы можно было переиспользовать
        }
    }

    // Пауза музыки
    pauseMusic() {
        if (this.music && this.music.isPlaying) {
            this.music.pause();
        }
    }

    // Воспроизведение звукового эффекта (например, прыжка)
    playSound(key, config = {}) {
        if (!this.soundEnabled) return;
        
        const sound = this.scene.sound.add(key, {
            volume: 0.3,
            ...config
        });
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
        return this.soundEnabled; // Возвращаем текущее состояние
    }
}