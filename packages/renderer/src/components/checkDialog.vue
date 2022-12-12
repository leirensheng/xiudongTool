<template>
  <el-dialog
    v-bind="$attrs"
    width="80%"
    :title="runningCmd || cmd"
  >
    <div
      v-if="$attrs.modelValue"
      class="terminal-warp"
    >
      <start-check-config
        v-if="!isRunning"
        ref="config"
        :port="port"
        :ticket-types="ticketTypes"
        @cmd-change="cmdChange"
      ></start-check-config>
      <cmd-terminal2
        v-if="isRunning || showTerminal"
        :cmd="cmd"
        @exit="exit"
      ></cmd-terminal2>
    </div>
  </el-dialog>
</template>

<script>
import CmdTerminal2 from './cmdTerminal2.vue';
import StartCheckConfig from './startCheckConfig.vue';
import {useStore} from '/@/store/global';

export default {
  components: {
    CmdTerminal2,
    StartCheckConfig,
  },
  props: {
    port: {
      type: String,
      default: '',
    },
    ticketTypes: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['exit'],
  setup() {
    let store = useStore();
    let {pidInfo} = store;
    return {
      pidInfo,
    };
  },
  data() {
    return {
      cmd: '',
      showTerminal: false,
    };
  },
  computed: {
    isRunning() {
      let cmds = Object.keys(this.pidInfo);
      return cmds.some(cmd => cmd.includes(this.port));
    },
    runningCmd() {
      let cmds = Object.keys(this.pidInfo);
      return cmds.find(cmd => cmd.includes(this.port));
    },
  },
  methods: {
    cmdChange(val) {
      this.cmd = val;
      this.showTerminal = true;
    },
    exit() {
      this.showTerminal = false;
      this.cmd = '';
      this.$emit('exit');
    },
  },
};
</script>

<style></style>
