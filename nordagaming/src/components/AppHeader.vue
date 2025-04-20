<template>
  <v-app-bar app style="position: relative;">
    <v-container class="d-flex align-center pa-0 px-5" fluid style="position: relative;">
      <div class="header-side">
        TheWall.gaming
      </div>

      <div class="header-center">
        <v-tabs center-active>
          <v-tab to="/">Home</v-tab>
          <v-tab to="/runner">Runner</v-tab>
          <v-tab to="/staking">Staking</v-tab>
          <v-tab to="/wheel">Wheel</v-tab>
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
            @click="openSignUp"
          >Sign Up</v-btn>
          <v-btn
            v-else
            icon
            class="ml-2"
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
          <v-list-item-subtitle>{{ user.points }} points</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>
  </v-navigation-drawer>
</template>

<script>
import { useUserStore } from "@/stores/userStore";
import { mapState } from "pinia";

export default {
  data() {
    return {
      showTopUsers: false,
      topUsers: [
        { id: 1, name: 'Player1', points: 1250, avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
        { id: 2, name: 'Player2', points: 1100, avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
        { id: 3, name: 'Player3', points: 950, avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
      ],
    };
  },
  computed: {
    ...mapState(useUserStore, ["isAuthenticated"]),
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