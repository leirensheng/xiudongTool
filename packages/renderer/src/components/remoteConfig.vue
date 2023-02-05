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
import {getComputerName, cloneRemoteConfig} from '#preload';
import axios from 'axios';
import {ElNotification} from 'element-plus';
import {getRunningUser} from '/@/utils/index.js';
export default {
  data() {
    return {
      remotePc: '',
      pcs: ['新电脑', '虚拟机4.3', '虚拟机4.4'],
      pcName: '',
      data: [],
    };
  },
  computed: {
    remoteIp() {
      let map = {
        新电脑: this.pcName.includes('虚拟机') ? '192.168.4.1' : 'leirensheng.dynv6.net',
        '虚拟机4.3': '192.168.4.3',
        '虚拟机4.4': '192.168.4.4',
      };
      return map[this.remotePc];
    },
  },
  created() {
    this.pcName = getComputerName();
    console.log(this.pcName);
  },
  methods: {
    async clone({username, config}) {
      try {
        await cloneRemoteConfig(this.remoteIp, username, JSON.parse(JSON.stringify(config)));
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
        let {
          data: {config, pidToCmd},
        } = await axios({
          timeout: 3000,
          url: `http://${this.remoteIp}:4000/getAllUserConfig`,
        });

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
