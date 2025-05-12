import { defineStore } from "pinia";
import avatarImage from "@/assets/logo.png";

export const useUserStore = defineStore("user", {
  state: () => {
    const saved = localStorage.getItem('userStoreLocal');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      user: {
        id: "",
        name: "",
        email: "",
        avatar: avatarImage,
        wallet: "",
        currentPoints: 0,
        password: "",
      },
      isAuthenticatedState: false, // renamed from isAuthenticated
    };
  },
  getters: {
    getCurrentPoints: (state) =>
      state.user.currentPoints,
    getUserId: (state) =>
      state.user.id,
    isAuthenticated: (state) =>
      !!state.user.name && !!state.user.email /*&& !!state.user.password*/,
  },
  actions: {
    updateProfile(updatedData) {
      if(updatedData.id){
        this.user.id = updatedData.id;
      }
      if (updatedData.name !== undefined && updatedData.name !== null) {
        this.user.name = updatedData.name;
      }
      if (updatedData.email !== undefined && updatedData.email !== null) {
        this.user.email = updatedData.email;
      }
      if(updatedData.avatar){
        this.user.avatar = updatedData.avatar;
      }
      if(updatedData.total_score){
        this.user.currentPoints = updatedData.total_score;
      }
      console.log("Profile updated:", this.user);
      this.saveToStorage();
    },
    reset() {
      this.user = {
        id: "",
        name: "",
        email: "",
        avatar: avatarImage,
        wallet: "",
        currentPoints: 0,
        password: "",
      };
      this.isAuthenticatedState = false;
      this.saveToStorage();
    },
    saveToStorage() {
      localStorage.setItem('userStoreLocal', JSON.stringify(this.$state));
    }
  },
});
