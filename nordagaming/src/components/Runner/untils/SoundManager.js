export default class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.music = null;
        this.sounds = [];
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

    // Воспроизведение звукового эффекта 
    playSound(key, config = {}) {
        if (!this.soundEnabled) return;
        
        const sound = this.scene.sound.add(key, {
            volume: 1,
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
        }
        this.sounds.forEach(sound => {
            sound.stop();
            sound.destroy();
        });
        this.sounds = []; // Очищаем массив
    }

    reset() {
        if (this.music) this.music.stop();
        this.sounds.forEach(sound => sound.stop());
        this.sounds = []; // Используем присваивание вместо clear()
    }
}