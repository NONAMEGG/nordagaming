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
                class="text-none"
                color="indigo"
                text="Edit Profile"
                slim
                @click="showEditState = !showEditState"
              >
                <v-icon icon="mdi-pencil"></v-icon>
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
import avatarImage from '@/assets/logo.png'; // Make sure this path is correct

const userStore = useUserStore();
const showEditState = ref(false);
const newLogin = ref('');
const newEmail = ref('');
const newPassword = ref('');

const isPasswordValid = computed(() => {
  if (!newPassword.value) {
    return true; // Don't validate if the field is empty (user might not be changing password)
  }
  return newPassword.value.length > 5 && /\d/.test(newPassword.value);
});

const isEmailValid = computed(() => {
  if (!newEmail.value) {
    return true; // Don't validate if the field is empty (user might not be changing email)
  }
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(newEmail.value);
});

const isSaveButtonDisabled = computed(() => {
  // Disable the button if in edit mode and either email or password (if entered) is invalid
  return showEditState.value && ((newEmail.value !== '' && !isEmailValid.value) || (newPassword.value !== '' && !isPasswordValid.value));
});

const saveProfileChanges = () => {
  if (showEditState.value && (newEmail.value !== '' && !isEmailValid.value)) {
    return; // Don't save if email is invalid
  }
  if (showEditState.value && (newPassword.value !== '' && !isPasswordValid.value)) {
    return; // Don't save if password is invalid
  }

  const updatedData = {};

  if (newLogin.value !== '') {
    updatedData.name = newLogin.value;
  }
  if (newEmail.value !== '') {
    updatedData.email = newEmail.value;
  }
  if (newPassword.value !== '') {
    updatedData.password = newPassword.value;
  }

  userStore.updateProfile(updatedData);

  newLogin.value = '';
  newEmail.value = '';
  newPassword.value = '';
  showEditState.value = false;
};
</script>