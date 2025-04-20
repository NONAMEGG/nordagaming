<template>
      <v-app-bar app class="px-0">
        <v-container class="d-flex align-center justify-space-between pa-0 px-5" fluid>
          <div class="">TheWall.gaming</div>

          <div class="">
            <v-tabs center-active>
              <v-tab to="/">Home</v-tab>
              <v-tab to="/runner">Runner</v-tab>
              <v-tab to="/staking">Staking</v-tab>
              <v-tab to="/wheel">Wheel</v-tab>
            </v-tabs>
          </div>

          <div class="">
            <v-btn icon @click="showTopUsers = !showTopUsers">
              <v-icon icon="mdi-podium"></v-icon>
            </v-btn>
            <v-btn
              v-if="!isAuthenticated"
              color="primary"
              @click="openLogin"
            >Login</v-btn>
            <v-btn
              v-if="!isAuthenticated"
              color="secondary"
              class="ml-2"
              @click="openSignUp"
            >Sign Up</v-btn>
            <v-btn
              v-else
icon
class="ml-2 pt-1"
@click="goToProfile"
>
              <v-icon icon="mdi-account"></v-icon>
            </v-btn>
          </div>
        </v-container>
      </v-app-bar>

      <v-navigation-drawer
        v-model="showTopUsers"
        app
        temporary
        width="300"
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
                    <v-img :src="user.avatar"></v-img>
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
  /* Custom styling if needed */
  .v-navigation-drawer__content {
    overflow-y: auto;
  }
  </style>
