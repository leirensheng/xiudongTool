<template>
  <el-form
    :disabled="running"
    :inline="true"
    class="form"
    label-width="100px"
  >
    <el-form-item
      style="width: 40%"
      class="item"
      label="开始目录"
    >
      <el-input-number
        v-model="startNum"
        :min="min"
        :max="max"
        controls-position="right"
      />
    </el-form-item>
    <el-form-item
      style="width: 40%"
      class="item"
      label="停止目录"
    >
      <el-input-number
        v-model="endNum"
        :min="min"
        :max="max"
        controls-position="right"
      />
      <!-- <el-input v-model="endNum"></el-input> -->
    </el-form-item>
    <el-form-item
      class="item"
      label="打开浏览器"
    >
      <el-switch v-model="isOpen" />
    </el-form-item>
    <el-form-item
      class="item"
      label="notData目录"
    >
      <el-switch
        v-model="isUseNotDir"
        @change="getDirNumber"
      />
    </el-form-item>
    <el-form-item
      v-if="!isOpen"
      class="item"
      label="自动点击"
    >
      <el-switch v-model="isLoop" />
    </el-form-item>
    <el-form-item
      v-if="!isOpen && isLoop"
      class="item"
      label="监测"
    >
      <el-switch v-model="isCheck" />
    </el-form-item>
    <el-form-item
      v-if="!isOpen && isLoop"
      class="item"
      label="循环点击"
    >
      <el-select v-model="loopTicketType">
        <el-option
          v-for="item in options"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
  </el-form>
  <el-button
    v-if="!running"
    type="success"
    @click="confirm"
  >
    启动
  </el-button>
</template>

<script>
import {useStore} from '/@/store/global';
import {readDir} from '#preload';
import {ElNotification} from 'element-plus';

export default {
  components: {},
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
  emits: ['cmdChange'],
  setup() {
    let store = useStore();
    let {pidInfo} = store;
    return {
      pidInfo,
    };
  },
  data() {
    return {
      min: 0,
      max: 0,
      loading: false,
      startNum: 0,
      endNum: 0,
      isLoop: true,
      isOpen: false,
      isCheck: true,
      isUseNotDir: true,
      loopTicketType: '',
    };
  },
  computed: {
    options() {
      return this.ticketTypes.map(name => ({
        name,
        id: name,
      }));
    },
    running() {
      return !!this.pidInfo[this.cmd];
    },
    cmd() {
      let str = `npm run check ${this.port} ${this.startNum}-${this.endNum} `;
      let name = '';
      if (this.isCheck && this.isLoop) {
        name = 'loopAndCheck';
      }
      if (!this.isCheck && this.isLoop) {
        name = 'loop';
      }
      if (this.isCheck && !this.isLoop) {
        name = 'check';
      }
      let dir = this.isUseNotDir ? 'useNotDir' : 'useDataDir';
      str = this.isOpen ? `${str} show ${dir}` : `${str} ${name} ${dir} `;
      if (!this.isOpen && this.isLoop) {
        str += ` ${this.loopTicketType}`;
      }
      return 'cd d:/xiudongPupp && ' + str;
    },
  },
  created() {
    this.getDirNumber();
    this.loopTicketType = this.options.length ? this.options[0].id : '';
  },
  methods: {
    confirm() {
      this.$emit('cmdChange', this.cmd);
    },
    async getDirNumber() {
      this.loading = true;
      let res = await readDir('checkData');
      this.loading = false;
      let startStr = this.isUseNotDir ? 'not_data' : 'data';
      res = res
        .filter(one => one.indexOf(startStr) === 0)
        .map(one => one.replace(startStr, ''))
        .map(one => Number(one));
      res.sort((a, b) => a - b);

      let isNotOk = res.some((one, index) =>
        index !== res.length - 1 ? one + 1 !== res[index + 1] : false,
      );
      if (isNotOk) {
        ElNotification({
          title: 'Error',
          message: '目录名称不连续, 请修改checkData文件夹名称！',
          type: 'error',
        });
        return;
      }
      this.min = res[0];
      this.max = res[res.length - 1];
      this.startNum = this.min;
      this.endNum = this.max;
    },
  },
};
</script>

<style></style>
