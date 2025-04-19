<template>
  <v-container class="fill-height d-flex align-center justify-center" fluid>
    <v-card class="mx-auto" min-width="350" max-width="400" width="100%">
      <v-card-title class="text-h5">Sign Up</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="login"
            label="Username"
            :rules="[rules.required, rules.username]"
            required
          />
          <v-text-field
            v-model="email"
            label="Email"
            :rules="[rules.required, rules.email]"
            required
          />
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            :rules="[rules.required, rules.password]"
            required
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" :disabled="!valid" @click="register">Sign Up</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const login = ref('');
const email = ref('');
const password = ref('');
const valid = ref(false);
const form = ref(null);

const rules = {
  required: v => !!v || 'Required.',
  email: v => /.+@.+\..+/.test(v) || 'E-mail must be valid.',
  username: v => /^[a-zA-Z0-9_]{3,}$/.test(v) || 'Username must be at least 3 characters.',
  password: v => v.length > 5 && /\d/.test(v) || 'Password must be longer than 5 chars and contain a digit.',
};

async function register() {
  if (await form.value?.validate()) {
    await userStore.updateProfile({
      name: login.value,
      email: email.value,
      password: password.value,
    });
    router.push('/');
  }
}
</script>
