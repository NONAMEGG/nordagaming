<template>
    <div>
        <GameCanvas @update-score="handleUpdateScore" @update-coins="handleUpdateCoins"/>
    </div>
</template>

<script>
    import GameCanvas from '@/components/Runner/GameCanvas.vue';
    export default {
        components: { GameCanvas },
        data() {
            return {
                score: 0,
                totalCoins: 0
            };
        },
        methods: {
            handleUpdateScore(newScore) {
                this.score = newScore;
                localStorage.setItem('score', newScore);
            },
        },
        mounted() {
            this.score = parseInt(localStorage.getItem('score')) || 0;
        }
    };
</script>

<style scoped>
</style>