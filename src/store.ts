import { createStore } from 'vuex';

const store = createStore({
  state: {
    players: 2,
    penalty: -100,
    enter_threshold: 750,
    finish_threshold: 10000,
  },
  mutations: {
    setPlayers(state, players) {
      state.players = players;
    },
    setPenalty(state, penalty) {
      state.penalty = penalty;
    },
    setEnterThreshold(state, threshold) {
      state.enter_threshold = threshold;
    },
    setFinishThreshold(state, threshold) {
      state.finish_threshold = threshold;
    },
  },
  actions: {
    initializeSettings({ commit }, settings) {
      commit('setPlayers', settings.players);
      commit('setPenalty', settings.penalty);
      commit('setEnterThreshold', settings.enter_threshold);
      commit('setFinishThreshold', settings.finish_threshold);
    },
  },
  getters: {
    settings(state) {
      return {
        players: state.players,
        penalty: state.penalty,
        enter_threshold: state.enter_threshold,
        finish_threshold: state.finish_threshold,
      };
    },
  },
});

export default store;