export default {
  namespaced: true,

  state: () => ({
    list: []
  }),

  mutations: {
    ADD_NOTIFICATION(state, notification) {
      state.list.unshift(notification)
    }
  },

  actions: {
    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification)
    }
  },

  getters: {
    all: (state) => state.list
  }
}
