<template>
  <v-alert
    v-if="errorStore.show"
    type="error"
    closable
    class="global-error-alert"
    @click:close="errorStore.clearError"
  >
    <div v-if="errorStore.code">
      <strong>Error {{ errorStore.code }}:</strong>
    </div>
    <span>{{ errorStore.message }}</span>
  </v-alert>
</template>

<script setup>
import { useErrorStore } from '@/stores/errorStore';
const errorStore = useErrorStore();
</script>

<style scoped>
.global-error-alert {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  min-width: 320px;
  max-width: 90vw;
}
</style>
