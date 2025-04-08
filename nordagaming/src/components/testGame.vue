<template>
    <div ref="gameContainer" style="width: 800px; height: 600px;"></div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import Phaser from 'phaser';
  import skyImage from '@/assets/skies/images.jpg';
  const gameContainer = ref(null);
  let game = null;
  
  onMounted(() => {
    if (!gameContainer.value) return;
  
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameContainer.value,
      physics: { default: 'arcade' },
      scene: {
        preload() {
          this.load.image('sky', skyImage);
        },
        create() {
          this.add.image(400, 300, 'sky');
        }
      }
    };
  
    game = new Phaser.Game(config);
  });
  
  onUnmounted(() => {
    game?.destroy(true); // Cleanup
  });
  </script>