<template>
  <div class="test">
    <cmd-terminal2 :cmd="'ls'"></cmd-terminal2>
  </div>
</template>

<script>
import CmdTerminal2 from './cmdTerminal2.vue';
export default {
  data() {
    return {
      CmdTerminal2,
    };
  },
  created() {},
  mounted() {},
  methods: {},
};
</script>

<style scoped lang="scss"></style>
