<template>
  <v-app-bar app style="position: relative;">
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
          <v-tab to="/runner" value="/runner">Runner</v-tab>
          <v-tab to="/staking" value="/staking">Staking</v-tab>
          <v-tab to="/wheel" value="/wheel">Wheel</v-tab>
        </v-tabs>
      </div>

      <div class="header-side header-side-right-absolute">
        <div class="header-actions">
          <v-btn icon @click="showTopUsers = !showTopUsers">
            <v-icon icon="mdi-podium"></v-icon>
          </v-btn>
          <v-btn
            v-if="!isAuthenticated"
            color="primary"
            class="ml-2"
            @click="openLogin"
          >Login</v-btn>
          <v-btn
            v-if="!isAuthenticated"
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
        >
          <template v-slot:prepend>
            <v-badge
              :content="index + 1"
              color="amber"
              overlap
            >
              <v-avatar size="40">
                <v-img :src="user.users.avatar_url"></v-img>
              </v-avatar>
            </v-badge>
          </template>
          <v-list-item-title>{{ user.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ user.total_score }} points</v-list-item-subtitle>
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

  <script>
import { useUserStore } from "@/stores/userStore";
import { mapState } from "pinia";
import {fetchRecords} from "../http/recordsAPI.js"

const MAIN_TABS = ['/', '/runner', '/staking', '/wheel'];

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
    };
  },
  computed: {
    ...mapState(useUserStore, ["isAuthenticated"]),
    route() {
      return this.$route;
    },
    isMainTab() {
      return MAIN_TABS.includes(this.route.path);
    },
    isProfilePage() {
      return this.route.path === '/profile';
    },
    mainTabValue() {
      return this.isMainTab ? this.route.path : null;
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
  },
  methods: {
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
</style>
