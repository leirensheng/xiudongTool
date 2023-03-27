<template>
  <div>
    <el-form
      :form="config"
      inline
    >
      <!-- <el-form-item label="有票不提示">
        <el-switch v-model="config.noSend"></el-switch>
      </el-form-item> -->
      <!-- <el-form-item label="不自动付">
        <el-switch v-model="config.noAutoPay"></el-switch>
      </el-form-item> -->
      <el-form-item label="服务器ip">
        <el-input v-model="config.checkServerIp"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          @click="onSubmit"
        >
          修改
        </el-button>
      </el-form-item>
    </el-form>

    <div>
      <span
        class="show-ip"
        @click="copyText(config.dnsIp + ':5678')"
      >
        <el-icon class="copy-icon"> <DocumentCopy /> </el-icon>{{ config.dnsIp }}:5678</span>
      <el-button
        :loading="loadingDns"
        @click="refreshDns"
      >
        更新DNS
      </el-button>
      <el-button
        style="margin-left: 20px"
        @click="refreshIp"
      >
        更新IP
      </el-button>
    </div>
    <div>
      <cmd-terminal2
        v-if="isStart"
        ref="terminal"
        cmd="node updateWanIp.js"
        @message="handleMessage"
        @exit="isStart = false"
      ></cmd-terminal2>
    </div>
  </div>
</template>

<script>
import {readFile, writeFile, copyText} from '#preload';
import {ElNotification} from 'element-plus';
import {getIp} from '../utils/index.js';
export default {
  data() {
    return {
      isStart: false,
      loadingDns:false,
      config: {},
    };
  },
  created() {
    this.getConfig();
  },
  beforeUnmount() {
    this.isStart && this.$refs.terminal.close();
  },
  methods: {
    copyText(str) {
      copyText(str);
      ElNotification({
        title: '成功',
        message: '复制成功',
        type: 'success',
      });
    },
    async handleMessage(val) {
      if (val.includes('成功')) {
        let dnsIp = val.match(/\[(.*?)\]/);
        await writeFile('localConfig.json', JSON.stringify({...this.config, dnsIp}, null, 4));
        ElNotification({
          title: '成功',
          message: 'WAN ip更新成功',
          type: 'success',
        });
      }
    },

    refreshIp() {
      this.isStart = true;
    },
    async refreshDns() {
      this.loadingDns = true;
      await getIp();
      this.getConfig();
      this.loadingDns = false;
    },
    async onSubmit() {
      await writeFile('localConfig.json', JSON.stringify(this.config, null, 4));
      ElNotification({
        title: '成功',
        message: '保存成功',
        type: 'success',
      });
    },
    async getConfig() {
      let str = await readFile('localConfig.json');
      let config = JSON.parse(str);
      this.config = config;
    },
  },
};
</script>

<style lang="scss" scoped>
.show-ip {
  cursor: pointer;

  i {
    position: relative;
    top: 2px;
    margin-right: 10px;
  }
}
</style>
