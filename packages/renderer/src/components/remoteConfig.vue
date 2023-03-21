<template>
  <div>
    <el-radio-group
      v-model="remotePc"
      size="large"
    >
      <el-radio-button
        v-for="one in pcs"
        :key="one"
        :disabled="one === pcName"
        :label="one"
      />
    </el-radio-group>

    <el-button
      type="success"
      @click="loadConfig"
    >
      读取
    </el-button>

    <div class="res">
      <div
        v-for="(item, index) in data"
        :key="index"
        class="item"
      >
        <div class="name">{{ item.username }}</div>
        <div class="activity">{{ item.activity }}</div>
        <el-button @click="clone(item)">拉取</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {getComputerName, cloneRemoteConfig, getRemoteIp, doTwice} from '#preload';
import axios from 'axios';
import {ElNotification} from 'element-plus';
import {getRunningUser} from '/@/utils/index.js';
export default {
  data() {
    return {
      remotePc: '',
      pcs: ['新电脑', '虚拟机4.3', '虚拟机4.4', '联想'],
      pcName: '',
      data: [],
    };
  },
  computed: {
    remoteIp() {
      return getRemoteIp(this.remotePc);
    },
  },
  created() {
    this.pcName = getComputerName();
    console.log(this.pcName);
  },
  methods: {
    async clone({username, config}) {
      try {
        let fn = doTwice(cloneRemoteConfig, this.remoteIp);
        await fn(username, JSON.parse(JSON.stringify(config)));
        ElNotification({
          title: '成功',
          message: '拉取成功',
          type: 'success',
        });
      } catch (e) {
        ElNotification({
          title: '失败',
          message: e.message,
          type: 'error',
        });
      }
    },
    async loadConfig() {
      try {
        this.data = [];

        let send = ip =>
          axios({
            timeout: 3000,
            url: `http://${ip}:4000/getAllUserConfig`,
          });

        let fn = doTwice(send, this.remoteIp);

        let {
          data: {config, pidToCmd},
        } = await fn();

        let pidInfo = {};
        Object.entries(pidToCmd).forEach(([key, value]) => {
          pidInfo[value] = key;
        });
        let runnings = getRunningUser(pidInfo);
        this.data = Object.entries(config)
          .map(([username, one]) => ({
            username,
            activity: one.activityName,
            config: one,
          }))
          .filter(one => !runnings.includes(one.username));
      } catch (e) {
        ElNotification({
          title: '失败',
          message: e.message,
          type: 'error',
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.res {
  margin-top: 20px;
}
.item {
  padding: 10px;
  display: flex;
  gap: 15px;
  border-bottom: 1px solid white;
  .name {
    width: 5%;
  }
  .activity {
    width: 70%;
  }
}
</style>
