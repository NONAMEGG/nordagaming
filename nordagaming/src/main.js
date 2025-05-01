/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins";
import Phaser from 'phaser';
// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";

const app = createApp(App);
// defineIonPhaser(window);
registerPlugins(app);

Phaser.GameObjects.GameObjectFactory.register('audio', function (key) {
    return this.scene.sound.add(key);
});

app.mount("#app");
// new Vue({
//   render: (h) => h(App),
// }).$mount("#app");
