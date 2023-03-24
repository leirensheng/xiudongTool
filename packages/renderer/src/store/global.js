import {defineStore} from 'pinia';
export const useStore = defineStore('global', {
  state: () => {
    return {
      pidInfo: {},
    };
  },
  actions: {
    setPidInfo(val) {
      this.pidInfo = val;
    },
  },
  getters: {},
});
