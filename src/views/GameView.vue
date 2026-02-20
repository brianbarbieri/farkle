<template>
  <div class="game-layout">
    <div class="left">
      <div class="panel">
        <h3>Dice</h3>

        <div class="dice-grid">
          <div
            v-for="(d, i) in visibleDice"
            :key="i"
            class="die"
            :class="{ selected: selected.has(i) }"
            @click="toggleSelect(i)"
            :title="`Die ${i + 1}: ${d}`"
          >
            {{ d }}
          </div>
        </div>

        <div class="controls">
          <button class="primary" @click="roll">
            Roll
          </button>
          <button @click="stop" :disabled="turnPoints === 0 && !(rolledDice.length > 0 && selected.size > 0)">Stop</button>
        </div>

        <div class="info-row">
          <div>Dice left: <strong>{{ diceRemaining }}</strong></div>
          <div>Banked: <strong>{{ turnPoints }}</strong></div>
          <div v-if="currentSelectionScore > 0">Selected: <strong>{{ currentSelectionScore }}</strong></div>
        </div>

        <div v-if="message" class="message">{{ message }}</div>
        <div v-if="finalPhase && !gameOver" class="message">
          Final round started — {{ finalPhaseRemaining }} players left to play their final turn
        </div>
        <div v-if="gameOver" class="winner">Game over — Winner: {{ winner?.name }} ({{ winner?.score }})</div>
      </div>
    </div>

    <div class="right">
      <div class="panel scoreboard">
        <h3>Scoreboard</h3>
        <ul class="players">
          <li
            v-for="(p, idx) in players"
            :key="idx"
            :class="{ active: idx === currentPlayer, entered: p.entered }"
          >
            <div class="player-name">{{ p.name }}</div>
            <div class="player-score">{{ p.score }}</div>
            <div class="player-flag" v-if="!p.entered"> ⏳ not entered</div>
          </li>
        </ul>

        <div class="turn-actions">
          <div><strong>Active:</strong> {{ players[currentPlayer]?.name }}</div>
          <div><strong>Total this turn:</strong> {{ turnPoints + currentSelectionScore }}</div>
        </div>

        <div class="settings">
          <div><strong>Enter threshold:</strong> {{ settings.enter_threshold }}</div>
          <div><strong>Finish threshold:</strong> {{ settings.finish_threshold }}</div>
          <div><strong>Penalty on Farkle:</strong> {{ settings.penalty }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed} from 'vue';
import { useStore } from 'vuex'; // Import useStore from Vuex
import { Player } from '../types';
import "./GameView.css";

const store = useStore(); // Initialize the store

const settings = computed(() => store.getters.settings); // Get settings from the store

const players = reactive<Player[]>(Array.from({ length: Math.max(1, settings.value.players) }, (_, i) => ({
  name: `Player ${i + 1}`,
  score: 0,
  entered: false,
})));

const currentPlayer = ref(0);
const diceRemaining = ref(6);
const rolledDice = ref<number[]>([]);
const selected = ref(new Set<number>());
const turnPoints = ref(0);
const message = ref('');
const winner = ref<Player | null>(null);

const finalPhase = ref(false);
const finalPhaseStarter = ref(-1);
const finalPhaseRemaining = ref(0);
const gameOver = ref(false);

const currentSelectionScore = computed(() => {
  if (selected.value.size === 0) return 0;
  const selectedVals = Array.from(selected.value).map(i => rolledDice.value[i]);
  return computeScore(selectedVals);
});

function resetTurnState() {
  diceRemaining.value = 6;
  rolledDice.value = [];
  selected.value = new Set();
  turnPoints.value = 0;
  message.value = '';
}

function rollAll(n: number) {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(Math.floor(Math.random() * 6) + 1);
  return out;
}

function computeScore(dice: number[]) {
  if (!dice || dice.length === 0) return 0;
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const d of dice) counts[d]++;
  
  let score = 0;
  // Calculate score for three of a kind or more
  for (let face = 1; face <= 6; face++) {
    const c = counts[face];
    if (c >= 3) {
      let base = face === 1 ? 1000 : face * 100;
      score += base * Math.pow(2, c - 3);
      counts[face] = 0; // Reset count for this face
    }
  }
  // Add score for 1s and 5s
  score += counts[1] * 100; // Each 1 is worth 100 points
  score += counts[5] * 50;   // Each 5 is worth 50 points
  
  return score;
}

function hasScoringCombination(dice: number[]) {
  return computeScore(dice) > 0;
}

function toggleSelect(index: number) {
  if (rolledDice.value.length === 0) return;
  
  const clickedValue = rolledDice.value[index];
  
  // If clicking a die that's already selected, deselect it (and potentially others in the same group)
  if (selected.value.has(index)) {
    const sel = new Set(selected.value);
    
    // Check if this die is part of a three-of-a-kind or more
    const allIndices = rolledDice.value
      .map((val, idx) => ({ val, idx }))
      .filter(d => d.val === clickedValue)
      .map(d => d.idx);
    
    if (allIndices.length >= 3) {
      // Deselect all dice of this value
      allIndices.forEach(idx => sel.delete(idx));
    } else {
      // Just deselect this one die
      sel.delete(index);
    }
    
    selected.value = sel;
    return;
  }
  
  // Selecting a new die
  const sel = new Set(selected.value);
  
  // Check if this value appears 3+ times (three-of-a-kind or more)
  const sameValueIndices = rolledDice.value
    .map((val, idx) => ({ val, idx }))
    .filter(d => d.val === clickedValue)
    .map(d => d.idx);
  
  if (sameValueIndices.length >= 3) {
    // Auto-select all dice of this value (three-of-a-kind combo)
    sameValueIndices.forEach(idx => sel.add(idx));
  } else {
    // Just add this single die
    sel.add(index);
  }
  
  // Verify the selection is valid
  const selectedVals = Array.from(sel).map(i => rolledDice.value[i]);
  const totalScore = computeScore(selectedVals);
  
  if (totalScore > 0) {
    selected.value = sel;
    return;
  }
  
  // Invalid selection
  message.value = 'Selected dice do not form a scoring set';
  setTimeout(() => (message.value = ''), 1400);
}

const visibleDice = computed(() => rolledDice.value);

function endGame() {
  gameOver.value = true;
  // pick highest score
  let top = players[0];
  for (const p of players) if (p.score > top.score) top = p;
  winner.value = { ...top };
  message.value = `Game over — ${winner.value.name} wins with ${winner.value.score}`;
}

function advancePlayer(finishedIndex = currentPlayer.value, applyPenalty = 0) {
  // apply penalty if any
  if (applyPenalty !== 0) {
    players[finishedIndex].score += applyPenalty;
  }

  // If in final phase and the finished player is NOT the starter, that consumes one final turn
  if (finalPhase.value && finishedIndex !== finalPhaseStarter.value) {
    finalPhaseRemaining.value = Math.max(0, finalPhaseRemaining.value - 1);
  }

  // determine next player
  currentPlayer.value = (finishedIndex + 1) % players.length;

  // If final phase has completed, end game
  if (finalPhase.value && finalPhaseRemaining.value <= 0) {
    endGame();
    return;
  }

  // reset turn for next player
  resetTurnState();
}

function roll() {
  if (gameOver.value) return;

  if (rolledDice.value.length === 0) {
    // initial roll for this turn
    rolledDice.value = rollAll(diceRemaining.value);
    if (!hasScoringCombination(rolledDice.value)) {
      // Farkle: apply penalty only if player has entered
      if (players[currentPlayer.value].entered) {
        const penalty = settings.value.penalty;
        players[currentPlayer.value].score += penalty;
        message.value = `Farkle! ${penalty} applied`;
      } else {
        message.value = `Farkle! No penalty until you have entered (need ${settings.value.enter_threshold})`;
      }
      setTimeout(() => {
        advancePlayer(currentPlayer.value, 0);
      }, 800);
      return;
    }
    return;
  }

  // rolling again: must have selected scoring dice
  const selIndices = Array.from(selected.value).sort((a, b) => b - a);
  if (selIndices.length === 0) {
    message.value = 'Select scoring dice before rolling again';
    setTimeout(() => (message.value = ''), 1200);
    return;
  }

  const selVals = selIndices.map(i => rolledDice.value[i]);
  const selScore = computeScore(selVals);
  if (selScore <= 0) {
    message.value = 'Selected dice do not score';
    setTimeout(() => (message.value = ''), 1200);
    return;
  }

  // bank selected dice to turnPoints and remove them
  turnPoints.value += selScore;
  for (const idx of selIndices) rolledDice.value.splice(idx, 1);
  diceRemaining.value -= selIndices.length;

  // hot dice: all used -> reset
  if (diceRemaining.value <= 0) diceRemaining.value = 6;

  selected.value = new Set();
  // roll the remaining dice
  rolledDice.value = rollAll(diceRemaining.value);

  // check farkle after re-roll
  if (!hasScoringCombination(rolledDice.value)) {
    // Farkle: apply penalty only if player has entered
    if (players[currentPlayer.value].entered) {
      const penalty = settings.value.penalty;
      players[currentPlayer.value].score += penalty;
      message.value = `Farkle! ${penalty} applied`;
    } else {
      message.value = `Farkle! No penalty until you have entered (need ${settings.value.enter_threshold})`;
    }
    setTimeout(() => {
      advancePlayer(currentPlayer.value, 0);
    }, 800);
    return;
  }
}

function stop() {
  if (gameOver.value) return;

  // Calculate score from currently selected dice
  const selIndices = Array.from(selected.value);
  const selVals = selIndices.map(i => rolledDice.value[i]);
  const selScore = computeScore(selVals);
  
  // Add selected dice score to the total turn points
  const totalTurnScore = turnPoints.value + selScore;

  // If player hasn't "entered" the game yet, they must score at least settings.value.enter_threshold in a single turn
  if (!players[currentPlayer.value].entered) {
    if (totalTurnScore >= settings.value.enter_threshold) {
      players[currentPlayer.value].entered = true;
      players[currentPlayer.value].score += totalTurnScore;
      message.value = `${players[currentPlayer.value].name} entered the game with ${totalTurnScore} points`;
    } else {
      // does not enter — points don't count
      message.value = `Need at least ${settings.value.enter_threshold} in a single turn to enter. No points added.`;
    }
  } else {
    // normal banking: add all turn points including selected dice
    players[currentPlayer.value].score += totalTurnScore;
  }

  // Check if this player's score meets or exceeds finish threshold and final phase not already started
  if (!finalPhase.value && players[currentPlayer.value].score >= settings.value.finish_threshold) {
    finalPhase.value = true;
    finalPhaseStarter.value = currentPlayer.value;
    finalPhaseRemaining.value = Math.max(0, players.length - 1);
    message.value = `${players[currentPlayer.value].name} reached ${players[currentPlayer.value].score} — final round begins`;
    // Advance to next player (do not decrement remaining here)
    setTimeout(() => advancePlayer(currentPlayer.value, 0), 600);
    return;
  }

  // Normal advancement: mark this player's turn as finished
  setTimeout(() => advancePlayer(currentPlayer.value, 0), 300);
}

resetTurnState();
</script>