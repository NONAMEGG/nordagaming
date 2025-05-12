<template>
      <v-alert
  v-if="showTimerAlert"
  type="warning"
  closable
  class="alert-auth"
  @click:close="showTimerAlert = false"
>
  You can't spin the wheel right now.
</v-alert>
  <v-container class="fill-height">

    <v-responsive class="fill-height mx-auto text-center" max-width="900">

<Roulette
    ref="wheel"
    :key="rouletteKey"
    :items="items"
    display-shadow
    display-border
    :display-indicator = "false"
    base-display
    base-display-indicator
    base-background="#dedede"
    base-display-shadow
    easing="bounce"
    @wheel-start="wheelStartedCallback"
    @wheel-end="wheelEndedCallback"
    @click="handleWheelClick"
  >
    <template #baseContent>
      <div>GO!</div>
    </template>
  </Roulette>
      </v-responsive>
  </v-container>
</template>


<script>
// If you use GSAP, import it here. Otherwise, comment out the next line.
// import { gsap, Power1, Power4 } from "gsap";

import { Roulette } from "vue3-roulette";
import { validateSpin, bonusSave } from "../http/bonusAPI.js"
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();

export default {
  components: {
    Roulette,
  },
  data() {
    return {
      rouletteKey: 0,
      showTimerAlert: false,
      isSpinning: false,
      canSpin: true,
      items: [
        // очки в топ юзеров
        {
          id: 1,
          name: "1",
          htmlContent: "1",
          textColor: "",
          background: "",
        },
        {
          id: 2,
          name: "10",
          htmlContent: "10",
          textColor: "",
          background: "",
        },
        {
          id: 3,
          name: "5",
          htmlContent: "5",
          textColor: "",
          background: "",
        },
        {
          id: 4,
          name: "15",
          htmlContent: "15",
          textColor: "",
          background: "",
        },
        {
          id: 41,
          name: "12",
          htmlContent: "12",
        },
        {
          id: 5,
          name: "20",
          htmlContent: "20",
        },
        {
          id: 7,
          name: "0",
          htmlContent: "0",
        },
      ],
    };
  },
  methods: {
    async handleWheelClick() {
      console.log('click')
      const bl = await validateSpin(userStore.getUserId);
      console.log(bl);
      if(bl.data.data){
        this.launchWheel();
      }else{
        this.showTimerAlert = true;
        return;
      }
    },
    launchWheel() {
      this.rouletteKey += 1;
      setTimeout(() => this.$refs.wheel.launchWheel(), 0);
    },
    wheelStartedCallback() {
      console.log("wheelStartedCallback");
    },
    async wheelEndedCallback(evt) {
      this.canSpin = false;
      console.log(evt);
      const response = await bonusSave(userStore.getUserId, evt.name)
    },
    canUseWheel() {
      return this.canSpin;
    }
  },
};

</script>

<style scoped>
.alert-auth {
  position: absolute;
  width: 100%;
  z-index: 100;
  top: -25px;
}
</style>
