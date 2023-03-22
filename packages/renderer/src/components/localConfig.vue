<template>
  <div>
    <el-form
      :form="config"
      inline
    >
      <el-form-item label="有票不提示">
        <el-switch v-model="config.noSend"></el-switch>
      </el-form-item>
      <el-form-item label="不自动付">
        <el-switch v-model="config.noAutoPay"></el-switch>
      </el-form-item>
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

    {{ config.dnsIp }}
    <el-button @click="refreshIp">更新dns</el-button>
  </div>
</template>

<script>
import {readFile, writeFile, cmd} from '#preload';
import {ElNotification} from 'element-plus';

export default {
  data() {
    return {
      config: {},
    };
  },
  created() {
    this.getConfig();
  },
  methods: {
    refreshIp() {
      cmd('nslookup leirensheng.dynv6.net', val => {
        console.log(val);
        let res = val.trim().match(/(\d.*$)/);
        if (res) {
          let ip = res[1];
          console.log(ip);
          this.config.dnsIp = ip;
          this.onSubmit();
        }
      });
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

<style></style>
