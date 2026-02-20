<template>
  <div class="home">
    <div class="card">
      <h1>Farkle — Start</h1>

      <form @submit.prevent="startGame" class="form">
        <label>
          Players
          <input type="number" v-model.number="players" min="1" max="8" />
        </label>

        <label>
          Penalty points
          <input type="number" v-model.number="penalty" />
        </label>

        <label>
          Target score
          <input type="number" v-model.number="target" min="1" />
        </label>

        <div class="actions">
          <button type="submit" class="primary">Start Game</button>
        </div>
      </form>

      <p class="hint">Defaults: players 2, penalty -100, target 750</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const players = ref<number>(2);
const penalty = ref<number>(-100);
const target = ref<number>(750);

function startGame() {
  // basic validation
  if (players.value < 1) players.value = 1;
  if (target.value < 1) target.value = 750;

  router.push({
    name: 'game',
    query: {
      players: String(players.value),
      penalty: String(penalty.value),
      target: String(target.value),
    },
  });
}
</script>

<style scoped>
.home {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg,#0f172a 0%, #0b1218 100%);
  color: #e6eef8;
  padding: 2rem;
}
.card {
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.06);
  padding: 1.75rem;
  border-radius: 12px;
  width: 360px;
  box-shadow: 0 6px 18px rgba(2,6,23,0.6);
}
h1 { margin: 0 0 1rem; font-size: 1.25rem; }
.form label { display: block; margin-bottom: 0.75rem; font-size: 0.9rem; }
.form input[type="number"] {
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  color: #e6eef8;
  margin-top: 0.35rem;
}
.actions { margin-top: 1rem; display:flex; justify-content:flex-end; }
button.primary {
  background: linear-gradient(90deg,#06b6d4,#3b82f6);
  color: #06202a;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
.hint { margin-top: 0.8rem; font-size: 0.8rem; color: rgba(230,238,248,0.7); }
</style>