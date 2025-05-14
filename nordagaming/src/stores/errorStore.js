import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useErrorStore = defineStore('error', () => {
  const show = ref(false);
  const message = ref('');
  const code = ref(null);

  function showError(msg, errCode = null) {
    message.value = msg;
    code.value = errCode;
    show.value = true;
    console.log(msg);
  }

  function clearError() {
    show.value = false;
    message.value = '';
    code.value = null;
  }

  return { show, message, code, showError, clearError };
});
