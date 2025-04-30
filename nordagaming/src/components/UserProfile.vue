<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-4">
          <v-list-item>
            <template v-slot:title>
              <v-avatar size="64" class="mr-4">
                <img :src="userStore.user.avatar" alt="User Avatar" width="50" height="50" />
              </v-avatar>
            </template>

            <template v-slot:append>
              <v-btn
                icon
                class="text-none mr-2"
                color="indigo"
                text="Edit Profile"
                slim
                @click="showEditState = !showEditState"
              >
                <v-icon icon="mdi-pencil"></v-icon>
              </v-btn>
              <v-btn
                icon
                color="red"
                text="Logout"
                slim
                @click="logout"
              >
                <v-icon icon="mdi-logout"></v-icon>
              </v-btn>
            </template>
          </v-list-item>
          <v-list-item v-if="!showEditState">
            <div>
              <h2>{{ userStore.user.name }}</h2>
              <p>{{ userStore.user.email }}</p>
              <p>Wallet: <v-kbd>{{ userStore.user.wallet }}</v-kbd></p>
            </div>
          </v-list-item>
          <v-list-item v-else>
            <div>
              <v-file-input
                v-model="newAvatar"
                label="Avatar"
                accept="image/png, image/jpeg, image/bmp"
                class="cursor-pointer"
                placeholder="Pick an avatar"
                prepend-icon="mdi-camera"
              ></v-file-input>

              <v-text-field v-model="newLogin" label="Login"></v-text-field>

              <v-text-field
                v-model="newEmail"
                label="Email"
                :error="newEmail.value !== '' && !isEmailValid"
                :error-messages="newEmail.value !== '' && !isEmailValid ? 'Invalid email format' : ''"
              ></v-text-field>

              <v-text-field
                v-model="newPassword"
                label="Password"
                type="password"
                :error="newPassword.value !== '' && !isPasswordValid"
                :error-messages="newPassword.value !== '' && !isPasswordValid ? 'Password must be longer than 5 characters and contain at least one digit' : ''"
              ></v-text-field>
              <v-card-actions>
                <v-btn
                  color="primary"
                  @click="saveProfileChanges"
                  :disabled="isSaveButtonDisabled"
                >
                  Save Changes
                </v-btn>
              </v-card-actions>
            </div>
          </v-list-item>

          <v-card-text> </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useUserStore } from '../stores/userStore';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import avatarImage from '@/assets/logo.png';
import { update } from '../http/userAPI.js';


const userStore = useUserStore();
const router = useRouter();
const showEditState = ref(false);
const newLogin = ref('');
const newEmail = ref('');
const newPassword = ref('');
const newAvatar = ref('');

const validationPassword = () =>{
  return newPassword.value.length > 5 && /\d/.test(newPassword.value)
}

const validationEmail = () =>{
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(newEmail.value);
}

const isPasswordValid = computed(() => {
  if (!newPassword.value) {
    return true;
  }
  return validationPassword();
});

const isEmailValid = computed(() => {
  if (!newEmail.value) {
    return true;
  }
  return validationEmail()
});

const isSaveButtonDisabled = computed(() => {
  if(newEmail.value && !validationEmail()){
    return true
  }
  if(newPassword.value && !validationPassword()){
    return true
  }
  if(!(newEmail.value || newAvatar.value || newPassword.value || newLogin.value)){
    return true
  }
});

const saveProfileChanges = async () => {
  if (showEditState.value && (newEmail.value !== '' && !isEmailValid.value)) {
    return;
  }
  if (showEditState.value && (newPassword.value !== '' && !isPasswordValid.value)) {
    return;
  }

  const updatedData = {};

  const response = await update(newLogin.value, newEmail.value, newPassword.value, newAvatar.value);
  console.log(response);

  userStore.updateProfile(updatedData);

  newLogin.value = '';
  newEmail.value = '';
  newPassword.value = '';
  showEditState.value = false;
};

const logout = () => {
  userStore.reset();
  router.push({ name: '/' });
};
</script>
