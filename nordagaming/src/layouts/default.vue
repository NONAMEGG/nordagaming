<template>
  <GlobalErrorAlert />
  <AppHeader @show-login-dialog="loginDialog = true" @show-signup-page="goToSignUp" />
  <loginComponent v-model="loginDialog" />
  <v-main :class="theme.global.current.value.dark ?  'blur-background' : 'blur-backgroundlight'">
    <router-view />
  </v-main>
</template>


<script setup>
import { useTheme } from 'vuetify';
import { useUserStore } from '@/stores/userStore';
import GlobalErrorAlert from '@/components/GlobalErrorAlert.vue';
const theme = useTheme();
const userStore = useUserStore();
</script>

<script>
import AppHeader from "@/components/AppHeader.vue";
import loginComponent from "@/components/loginComponent.vue";

export default {
  components: { AppHeader, loginComponent },
  data() {
    return {
      loginDialog: false,
    };
  },
  methods: {
    goToSignUp() {
      this.$router.push("/sign_up");
    },
  },
};
</script>

<style>
  .blur-background, .blur-backgroundlight {
  background: url('/src/assets/main_bg.png') center center;
  background-size: cover;
  position: relative;
  overflow: hidden;
}

.blur-background::before, .blur-backgroundlight::before {
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

.blur-background > *, .blur-backgroundlight > * {
  position: relative;
  z-index: 3;
}

</style>