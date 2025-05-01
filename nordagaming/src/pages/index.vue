<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height mx-auto" max-width="900">
      <v-card class="pa-8">
        <v-list-item>
          <template v-slot:title>
            <div class="text-body-3 font-weight-light mb-n1 text-center">Welcome to</div>
            <h1 class="text-h2 font-weight-bold text-center">Nordagaming</h1>
          </template>
          <template v-slot:prepend>
            <v-icon icon="mdi-alpha"></v-icon>
          </template>
          <template v-slot:append>
            <v-icon icon="mdi-alpha"></v-icon>
          </template>
        </v-list-item>

        <v-divider class="my-6"><div class="text-body-2 text-medium-emphasis">1</div></v-divider>
        <v-list-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-account-question-outline"></v-icon>
          </template>
          <div>
            <h2 class="text-h4 font-weight-bold mb-2">Who we are?</h2>
            <div class="text-body-1 mb-2">
              Nordagaming is a decentralized gamification platform built for <a class="cursor-pointer text-decoration-none" href="https://thewall.global/" target="_blank">TheWall.global</a>. We empower users to play engaging mini-games and earn cryptocurrency rewards, all while contributing to a vibrant blockchain community.
            </div>
            <div class="text-body-2 mb-1">
              Our mission is to make blockchain gaming accessible, fun, and rewarding for everyone.
            </div>
          </div>
        </v-list-item>

        <v-divider class="my-6"><div class="text-body-2 text-medium-emphasis">2</div></v-divider>
        <v-list-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-currency-eth"></v-icon>
          </template>
          <div>
            <h2 class="text-h4 font-weight-bold mb-2">How does it work?</h2>
            <div class="text-body-1 mb-2">
              Nordagaming leverages the Ethereum blockchain for transparency and security. Connect your wallet, choose a game, and start playing. Earn tokens and exclusive NFTs as you climb the leaderboards!
            </div>
            <ul class="text-body-2 pl-4 mb-1">
              <li>Connect with MetaMask or any Ethereum wallet</li>
              <li>Play mini-games and complete challenges</li>
              <li>Earn crypto rewards and NFTs</li>
              <li>Compete with friends and top players</li>
            </ul>
          </div>
        </v-list-item>

        <v-divider class="my-6"><div class="text-body-2 text-medium-emphasis">3</div></v-divider>
        <v-list-item>
          <div>
            <div class="d-flex mb-2 align-center">
              <v-icon icon="mdi-star-outline"></v-icon>
            <h2 class="text-h4 font-weight-bold mb-2 ml-4">What do we offer?</h2>
          </div>
            <div class="text-body-1 mb-2">
              Explore a variety of games, earn rewards, and join a growing community of blockchain gamers.
            </div>
            <v-carousel height="300" hide-delimiter-background show-arrows>
              <template v-slot:prev="{ props }">
                <v-btn color="success" variant="elevated" @click="props.onClick">Previous</v-btn>
              </template>
              <template v-slot:next="{ props }">
                <v-btn color="info" variant="elevated" @click="props.onClick">Next</v-btn>
              </template>
              <v-carousel-item v-for="(slide, i) in slides" :key="i">
                <v-sheet :color="colors[i]" height="100%">
                  <div class="d-flex fill-height justify-center align-center">
                    <div class="text-h4 font-weight-bold white--text">
                      {{ slide.title }}
                    </div>
                  </div>
                  <div class="pa-4 text-body-2 white--text">
                    {{ slide.desc }}
                  </div>
                </v-sheet>
              </v-carousel-item>
            </v-carousel>
          </div>
        </v-list-item>

        <v-divider class="my-6"><div class="text-body-2 text-medium-emphasis">4</div></v-divider>
        <v-list-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-trophy-outline"></v-icon>
          </template>
          <div>
            <h2 class="text-h4 font-weight-bold mb-2">Top Players</h2>
            <div class="text-body-1 mb-2">See who's leading the Nordagaming community this week!</div>

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
          <v-list-item-subtitle>{{ user.total_score }} points</v-list-item-subtitle>
        </v-list-item>
      </v-list>


            <v-table density="compact" class="mb-2">
              <thead>
                <tr>
                  <th class="text-left">Rank</th>
                  <th class="text-left">Player</th>
                  <th class="text-left">Score</th>
                  <th class="text-left">Rewards</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(user, idx) in topUsers" :key="user.name">
                  <td>{{ idx + 1 }}</td>
                  <td>
                    <v-avatar size="24" class="mr-2">
                      <v-img :src="user.avatar" v-if="user.avatar"/>
                      <v-icon v-else icon="mdi-account-circle"></v-icon>
                    </v-avatar>
                    {{ user.name }}
                  </td>
                  <td>{{ user.score }}</td>
                  <td>
                    <v-chip color="success" size="small" v-if="user.rewards > 0">
                      {{ user.rewards }} ETH
                    </v-chip>
                    <span v-else>-</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-list-item>

        <v-divider class="my-6"><div class="text-body-2 text-medium-emphasis">5</div></v-divider>
        <v-list-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-gamepad-variant-outline"></v-icon>
          </template>
          <div>
            <h2 class="text-h4 font-weight-bold mb-2">Ready to play?</h2>
            <div class="text-body-1 mb-2">Connect your wallet and start earning rewards today. New games and challenges are added regularly!</div>
          </div>
        </v-list-item>

        <v-divider class="my-6"></v-divider>
        <v-list-item>
          <div class="text-body-2 font-weight-light mb-n1 text-center">Happy gaming! &copy; {{ new Date().getFullYear() }} Nordagaming</div>
        </v-list-item>
      </v-card>
    </v-responsive>
  </v-container>
</template>

<script>
import { useUserStore } from "@/stores/userStore";
import { mapState } from "pinia";
import {fetchRecords} from "../http/recordsAPI.js"

export default {
  data() {
    return {
      topUsers: [],
      page: 1,
      limit: 1,
      loading: false,
      hasMore: false,
      colors: [
  'indigo',
  'warning',
  'pink darken-2',
  'red lighten-1',
  'deep-purple accent-4',
],
      slides: [
        {
          title: 'Mini-Games',
          desc: 'Enjoy a growing library of fun, skill-based mini-games designed for all players.',
        },
        {
          title: 'Crypto Rewards',
          desc: 'Earn Ethereum and exclusive NFTs as you play and win.',
        },
        {
          title: 'Leaderboards',
          desc: 'Compete with friends and climb the global rankings.',
        },
        {
          title: 'Community Events',
          desc: 'Participate in tournaments and special events for extra prizes.',
        },
        {
          title: 'Secure & Transparent',
          desc: 'All transactions are on-chain, ensuring fairness and security.',
        },
      ],
    };
  },
  watch: {
    showTopUsers(val) {
      if (val) {
        if (this.topUsers.length === 0) {
          this.loadUsers();
        }
      } else {
       this.resetTopUsers();
      }
    },
  },
  methods: {
    async loadUsers() {
      if (!this.hasMore) return;
      if (this.loading || !this.hasMore) return;
      this.loading = true;
      try {
        const res = await fetchRecords(this.limit, this.page);
        const newUsers = res.data.records || [];
        console.log(res);
        if (newUsers.length < this.limit) {
          this.hasMore = false;
        }
        this.topUsers.push(...newUsers);
        this.page++;
      } catch (error) {
        console.error("Ошибка при загрузке пользователей:", error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
