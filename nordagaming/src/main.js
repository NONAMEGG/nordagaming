/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins";
// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";
// Vue.config.productionTip = false;
// Vue.config.ignoredElements = [/ion-\w*/];

const app = createApp(App);
// defineIonPhaser(window);
registerPlugins(app);

app.mount("#app");
// new Vue({
//   render: (h) => h(App),
// }).$mount("#app");
