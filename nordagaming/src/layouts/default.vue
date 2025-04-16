<template>
  <AppHeader />
  <v-main class="blur-background">
    <router-view />
  </v-main>

</template>

<script setup>

</script>

<style>
  .blur-background {
  background: url('/src/assets/main_bg.png') center center;
  background-size: cover;
  position: relative;
  overflow: hidden;
}

.blur-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  filter: blur(10px);
  z-index: 1;
}

.blur-background::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2;
}

.blur-background > * {
  position: relative;
  z-index: 3;
}

</style>