<template>
  <div>
    <div class="wrap">
      <el-button
        v-if="['', 'check'].includes(mode)"
        :loading="loading"
        type="primary"
        @click="clean"
      >
        清理checkData文件({{ checkDataLength }})
      </el-button>
      <el-button
        v-if="['', 'config'].includes(mode)"
        :loading="loading"
        type="success"
        @click="cleanUser"
      >
        清理userData文件({{ userDataLength }})
      </el-button>

      <el-button
        v-if="loading"
        type="danger"
        @click="stop"
      >
        停止
      </el-button>
    </div>
    <div>
      <cmd-terminal
        v-if="loading"
        ref="terminal"
        :cmd-str="cmdStr"
        @done="reset"
      ></cmd-terminal>
    </div>
  </div>
</template>

<script>
import {readDir} from '#preload';
import {useStore} from '/@/store/global';
import {ref} from 'vue';
export default {
  setup() {
    let store = useStore();
    let {pidInfo} = store;
    let cmdStr = ref('');
    let terminal = ref(null);
    let loading = ref(false);
    let mode = ref('');
    let checkDataLength = ref(0);
    let userDataLength = ref(0);

    let getLength = async () => {
      let userData = await readDir('userData');
      let checkData = await readDir('checkData');
      checkDataLength.value = checkData.length;
      userDataLength.value = userData.length;
    };

    let reset = () => {
      mode.value = '';
      loading.value = false;
      getLength();
    };
    let clean = () => {
      mode.value = 'check';
      let cmd = Object.keys(pidInfo).find(one => one.includes('npm run check'));
      let ignoreStr = '';
      if (cmd && cmd.match(/check \d+ (\d+-\d+)/)) {
        let [start, end] = cmd.match(/check \d+ (\d+-\d+)/)[1].split('-');
        let isNotData = cmd.includes('useNot');

        let startWith = isNotData ? 'not_data' : 'data';
        let length = end - start + 1;
        let arr = Array.from({length}, (_, index) => startWith + (index + Number(start)));
        ignoreStr = arr.join(',');
      }
      cmdStr.value = 'npm run cleanCheck ' + ignoreStr;
      loading.value = true;
    };
    let cleanUser = () => {
      mode.value = 'config';
      let cmds = Object.keys(pidInfo).filter(one => one.includes('npm run start'));
      let names = cmds.map(one => one.match(/npm run start (.*?) /)[1]);
      let ignoreStr = names.join(',');

      cmdStr.value = 'npm run cleanUser ' + ignoreStr;
      loading.value = true;
    };

    let stop = () => {
      terminal.value.close();
    };

    getLength();
    return {
      mode,
      checkDataLength,
      userDataLength,
      reset,
      terminal,
      cleanUser,
      loading,
      cmdStr,
      clean,
      stop,
    };
  },
};
</script>

<style>
.wrap {
  margin: 10px;
  width: 50vw;
  display: flex;
  justify-content: center;
  align-items: center;
}
button {
  margin: 0 10px;
}
</style>
