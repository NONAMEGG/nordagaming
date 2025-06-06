<template>
    <!-- <v-alert
  v-if="userStore.showAuthAlert"
  type="warning"
  closable
  position="absolute"
  class="alert-auth"
  @click:close="userStore.showAuthAlert = false"
>
  You must sign in or sign up to continue.
</v-alert> -->

  <v-app-bar app style="position: sticky;">
    <v-container class="d-flex align-center pa-0 px-5" fluid style="position: relative;">
      <div class="header-side">
        TheWall.gaming
      </div>

      <div class="header-center">
        <v-tabs
          v-model="mainTabValue"
          center-active
          :slider-color="isMainTab ? undefined : 'transparent'"
        >
          <v-tab to="/" value="/">Home</v-tab>
            <v-tab
            to="/runner"
            :value="isAuthenticatedState ? '/runner' : '/'"
            @click="handleTabClick"
            >
            Runner
            </v-tab>
          <v-tab 
          to="/staking" 
          @click="handleTabClick" 
          :value="isAuthenticatedState ? '/staking' : '/'">
          Staking
        </v-tab>
          <v-tab
           to="/wheel"
             :value="isAuthenticatedState ? '/wheel' : '/'"
             @click="handleTabClick">
             Wheel
            </v-tab>
        </v-tabs>
      </div>

      <div class="header-side header-side-right-absolute">
        <div class="header-actions">
          <v-btn icon @click="showTopUsers = !showTopUsers">
            <v-icon icon="mdi-podium"></v-icon>
          </v-btn>
          <v-btn
            v-if="!isAuthenticatedState"
            color="primary"
            class="ml-2"
            @click="openLogin"
          >Login</v-btn>
          <v-btn
            v-if="!isAuthenticatedState"
            color="secondary"
            class="ml-2"
            :variant= "isSignUpPage ? 'tonal' : 'text'"
            @click="openSignUp"
          >Sign Up</v-btn>
          <v-btn
            v-else
            icon
            class="ml-2"
            :color="isProfilePage ? 'primary' : undefined"
            :variant="isProfilePage ? 'tonal' : undefined"
            @click="goToProfile"
          >
            <v-icon icon="mdi-account"></v-icon>
          </v-btn>
          <v-btn icon class="ml-2" @click="toggleTheme">
            <v-icon :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-sunglasses'"></v-icon>
          </v-btn>
        </div>
      </div>
    </v-container>
  </v-app-bar>

  <v-navigation-drawer
    v-model="showTopUsers"
    right
    temporary
    width="400"
  >
    <v-card flat>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Top Users</span>
        <v-btn icon @click="showTopUsers = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-list>
        <v-list-item
          v-for="(user, index) in topUsers"
          :key="user.id"
          :prepend-avatar="user.avatar"
          class="mb-2"
        >
          <template v-slot:prepend>
            <v-badge
              :content="index + 1"
              color="amber"
            >
             <v-avatar size="40">
                      <v-img :src="user.users.avatar_url" v-if="user.users.avatar_url"/>
                      <v-icon v-else icon="mdi-account-circle" size="40"></v-icon>
              </v-avatar>
            </v-badge>
          </template>
          <div class="ml-2">
          <v-list-item-title>{{ user.users.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ user.total_score }} points</v-list-item-subtitle>
        </div>
        </v-list-item>
      </v-list>
      <!-- Кнопка "Загрузить еще" -->
      <div class="text-center pa-3">
        <v-btn
          v-if="hasMore && !loading"
          color="primary"
          @click="loadUsers"
        >Загрузить ещё</v-btn>
        <v-progress-circular
          v-else-if="loading"
          indeterminate
          color="primary"
        ></v-progress-circular>
      </div>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup>
import { useTheme } from 'vuetify'
import { useThemeStore } from '@/stores/themeStore'
const theme = useTheme();
const themeStore = useThemeStore();

function toggleTheme() {
  const newTheme = theme.global.name.value === 'darkTheme' ? 'lightTheme' : 'darkTheme';
  theme.global.name.value = newTheme;
  themeStore.setTheme(newTheme);
}
</script>

<script>
import { useErrorStore } from '@/stores/errorStore';
import { useUserStore } from "@/stores/userStore";
import { mapState } from "pinia";
import {fetchRecords} from "../http/recordsAPI.js"

const MAIN_TABS = ['/', '/runner', '/staking', '/wheel'];
const errorStore = useErrorStore();

// const useTheme = () => {
//   const theme = ref('light');
//   const toggleTheme = () => {
//     theme.value = theme.value === 'light' ? 'dark' : 'light';
//     document.body.setAttribute('data-theme', theme.value);
//   };
//   return { theme, toggleTheme };
// };
export default {
  emits: ['show-login-dialog', 'show-signup-page'],
  data() {
    return {
      showTopUsers: false,
      topUsers: [],
      page: 1,
      limit: 10,
      loading: false,
      hasMore: true,
      mainTabValue: MAIN_TABS.includes(this?.$route?.path) ? this.$route.path : null,
    };
  },
  computed: {
    ...mapState(useUserStore, ["isAuthenticatedState"]),
    route() {
      return this.$route;
    },
    isMainTab() {
      return MAIN_TABS.includes(this.route.path);
    },
    isProfilePage() {
      return this.route.path === '/profile';
    },
    isSignUpPage() {
      return this.route.path === '/sign_up';
    },
  },
  watch: {
    showTopUsers(val) {
      if (val) {
        if (this.topUsers.length === 0) {
          this.loadUsers();
        }
      } else {
        this.resetTopUsers();
      }
    },
    // Sync route changes to mainTabValue
    '$route.path'(newPath) {
      if (MAIN_TABS.includes(newPath)) {
        this.mainTabValue = newPath;
      } else {
        this.mainTabValue = null;
      }
    },
    // Sync mainTabValue changes to route
    mainTabValue(newVal) {
      if (newVal && this.$route.path !== newVal) {
        this.$router.push(newVal);
      }
    },
  },
  methods: {
    handleTabClick() {
        if (!this.isAuthenticatedState) {
          errorStore.showError('You must sign in or sign up to continue.');
        };
    },
    openLogin() {
      this.$emit("show-login-dialog");
    },
    openSignUp() {
      this.$emit("show-signup-page");
    },
    goToProfile() {
      this.$router.push("/profile");
    },
    async loadUsers() {
      if (!this.hasMore) return;
      if (this.loading || !this.hasMore) return;
      this.loading = true;
      try {
        const res = await fetchRecords(this.limit, this.page);
        const newUsers = res.data.records || [];
        console.log(res);
        if (newUsers.length < this.limit) {
          this.hasMore = false;
        }
        this.topUsers.push(...newUsers);
        this.page++;
      } catch (error) {
        console.error("Ошибка при загрузке пользователей:", error);
      } finally {
        this.loading = false;
      }
    },
    resetTopUsers() {
      this.topUsers = [];
      this.page = 1;
      this.limit = 10;
      this.hasMore = true;
      this.loading = false;
    }
  },
};
</script>

<style>
.header-side {
  z-index: 2;
}
.header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  display: flex;
  justify-content: center;
  width: max-content;
}
.header-side-right-absolute {
  position: absolute;
  right: 32px;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  z-index: 3;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.v-navigation-drawer__content {
  overflow-y: auto;
}

.alert-auth {
  position: sticky;
  top: 40px;
  width: 100%;
  z-index: 100;
  margin-top: 16px;
}
</style>
