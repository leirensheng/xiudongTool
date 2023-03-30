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

    <div class="ping">
      <el-input
        v-model="remoteTestIp"
        placeholder="远程ip"
        @contextmenu.prevent="rightClick"
      ></el-input>
      <el-button
        type="primary"
        @click="ping"
      >
        连通性测试
      </el-button>
    </div>

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
import { getComputerName, cloneRemoteConfig, getRemoteIp, doTwice } from '#preload';
import axios from 'axios';
import { ElNotification } from 'element-plus';
import { getRunningUser, getIp } from '/@/utils/index.js';
import { readClip } from '#preload';

export default {
  data() {
    return {
      remotePc: '',
      pcs: ['新电脑', '虚拟机4.3', '虚拟机4.4', '联想'],
      pcName: '',
      data: [],
      remoteTestIp: '',
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
    rightClick() {
      this.remoteTestIp = readClip().replace(':5678','');
    },
    async ping() {
      let startTime = Date.now();
      await axios(`http://${this.remoteTestIp}:4000/ping`);
      let timeUsed = Date.now() - startTime;
      ElNotification({
        title: '成功',
        message: timeUsed + 'ms',
        type: 'success',
      });
    },
    async clone({ username, config }) {
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
          data: { config, pidToCmd },
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
        getIp();
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

.ping {
  margin: 20px 0;
  display: flex;
  align-items: center;

  :first-child {
    width: 200px;
  }

  :last-child {
    flex-grow: 0;
    width: auto;
  }
}
</style>
