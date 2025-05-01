import { defineStore } from "pinia";
import avatarImage from "@/assets/logo.png";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: {
      id: "123",
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: avatarImage,
      wallet: "walletnum1231350dko3dkK@)3",
      currentPoints: 10,
      password: "",
    },
  }),
  getters: {
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
      //if (
      //  updatedData.password !== undefined &&
      //  updatedData.password !== null &&
      //  updatedData.password !== ""
      //) {
      //  this.user.password = updatedData.password;
      //}
      console.log("Profile updated:", this.user);
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
    }
  },
});
