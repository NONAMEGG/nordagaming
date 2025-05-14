/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins";
import Phaser from 'phaser';
import { createPinia } from 'pinia';
// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
// registerPlugins(app);
registerPlugins(app);

Phaser.GameObjects.GameObjectFactory.register('audio', function (key) {
    return this.scene.sound.add(key);
});

import { useUserStore } from '@/stores/userStore';
useUserStore().$subscribe((mutation, state) => {
  localStorage.setItem('userStoreLocal', JSON.stringify(state));
});

app.mount("#app");
// new Vue({
//   render: (h) => h(App),
// }).$mount("#app");
