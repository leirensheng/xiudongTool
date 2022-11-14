<template>
  <div>
    <div class="wrap">
      <el-button
        v-if="['','check'].includes(mode)"
        :loading="loading"
        type="primary"
        @click="clean"
      >
        清理checkData文件
      </el-button>
      <el-button
        v-if="['','config'].includes(mode)"
        :loading="loading"
        type="success"
        @click="cleanUser"
      >
        清理userData文件
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
import { ref} from 'vue';
export default {
  setup() {
    let cmdStr = ref( '');
    let terminal = ref(null);
    let loading =ref(false);
    let mode =ref('');

  let reset = ()=>{
    mode.value='';
    loading.value=false;
  };
    let clean = () => {
      mode.value='check';
      cmdStr.value='cd ../xiudongPupp && npm run cleanCheck';
      loading.value =true;
    };
    let cleanUser = () => {
      mode.value='config';
      cmdStr.value='cd ../xiudongPupp && npm run cleanCheck true';
      loading.value =true;
    };

    return {
      mode,
      reset,
      terminal,
      cleanUser,
      loading,
      cmdStr,
      clean,
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