import { defineStore } from "pinia";
import avatarImage from "@/assets/logo.png";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: {
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: avatarImage,
      wallet: "walletnum1231350dko3dkK@)3",
      currentPoints: 10,
      password: "",
    },
  }),
  actions: {
    updateProfile(updatedData) {
      if (updatedData.name !== undefined && updatedData.name !== null) {
        this.user.name = updatedData.name;
      }
      if (updatedData.email !== undefined && updatedData.email !== null) {
        this.user.email = updatedData.email;
      }
      if (
        updatedData.password !== undefined &&
        updatedData.password !== null &&
        updatedData.password !== ""
      ) {
        this.user.password = updatedData.password;
      }

      console.log("Profile updated:", this.user);
    },
  },
});
