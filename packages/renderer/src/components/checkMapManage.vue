<template>
  <div>
    <S-Table
      ref="table"
      :highlight-current-row="false"
      :is-auto-height="true"
      :items="items"
      :api="getData"
      :add-config="addConfig"
      one-page-hide-pagination
      :table-btns-config="tableBtnsConfig"
      :on-dialog-open="onDialogOpen"
    >
      <template #onlyMonitorType="{row}">
        <el-tag
          v-for="(item, i) in row.onlyMonitorType"
          :key="item"
          :type="types[i]"
          effect="dark"
          round
          style="margin: 4px"
        >
          {{ item }}
        </el-tag>
      </template>
    </S-Table>

    <check-dialog
      v-model="dialogVisible"
      :port="curRow.port"
      :config="curRow"
      @update-loop-type="updateLoopType"
      @close="getList"
    ></check-dialog>
  </div>
</template>

<script>
import {readFile, cmd, writeFile} from '#preload';
import {ElMessageBox, ElNotification} from 'element-plus';
import {useStore} from '/@/store/global';
import CheckDialog from '/@/components/checkDialog.vue';
import {readDir} from '#preload';

export default {
  components: {
    CheckDialog,
  },
  setup() {
    let store = useStore();
    let {pidInfo} = store;
    return {
      pidInfo,
    };
  },
  data() {
    return {
      curRow: {},
      dialogVisible: false,
      cmd: '',
      usefulCheckDir: 0,
      addConfig: {
        handler: this.handlerAdd,
      },
      types: ['', 'success', 'danger', 'warning'],
      tableBtnsConfig: [
        {
          type: 'success',
          handler: this.start,
          show: row => row.status === 0,
          name: '启动',
        },
        {
          type: 'danger',
          handler: this.start,
          show: row => row.status === 1,
          name: '查看',
        },
        {
          type: 'primary',
          editConfig: {
            handler: this.handleEdit,
          },
          name: '编辑',
        },
        {
          handler: this.remove,
          name: '删除',
          type: 'danger',
        },
      ],
    };
  },
  computed: {
    items() {
      return [
        {
          id: 'port',
          name: '启动端口',
          width: 100,
          support: {
            query: {},
            add: {},
          },
        },
        {
          id: 'checkIndex',
          name: 'checkData序号',
          isShow: false,
          support: {
            add: {
              type: 'number',
              defaultValue: this.usefulCheckDir,
            },
          },
        },
        {
          id: 'activityId',
          name: 'activityId',
          width: 100,
          support: {
            add: {},
          },
        },

        {
          id: 'curShowName',
          name: '名称',
          //   minWidth: 150,
          support: {
            query: {},
          },
        },

        {
          id: 'showTime',
          name: '演出时间',
        },
        {
          id: 'loopTicketType',
          name: '循环点击',
          isShow: false,
        },
        {
          id: 'waitForTime',
          name: '开抢时间',
          options: [],
          support: {
            edit: {
              type: 'date',
              // type:'radio',
            },
            add: {
              type: 'date',

              // type:'radio',
            },
          },
        },
        {
          id: 'onlyMonitorType',
          name: '检测类型',
          valueType: 'slot',
          options: [],
          support: {
            edit: {
              // type:'radio',
              type: 'multipleSelect',
            },
          },
        },
        {
          id: 'ticketTypes',
          name: '所有类型',
          isShow: false,
          //  valueType:'text',
          support: {
            edit: {
              type: 'text',
            },
          },
        },
      ];
    },
  },
  created() {
    this.getUsefulDir();
  },
  methods: {
    async getUsefulDir() {
      let res = await readDir('checkData');
      let startStr = 'data';
      res = res
        .filter(one => one.indexOf(startStr) === 0)
        .map(one => one.replace(startStr, ''))
        .map(one => Number(one));
      res = res.sort((a, b) => a - b);
      if (res.length) {
        this.usefulCheckDir = res[0];
      } else {
        ElNotification({
          title: 'Error',
          message: '没有有效的以data开头的目录！',
          type: 'error',
        });
      }
    },
    start(row) {
      this.curRow = row;
      this.dialogVisible = true;

      // this.cmd = row.cmd;
      // console.log(this.cmd);
      // row.status = 1;
    },
    runOne(port, checkIndex) {
      return new Promise((resolve, reject) => {
        let str = `cd ../xiudongPupp && npm run check ${port} ${checkIndex}-${checkIndex}`;
        console.log(str);
        let child = cmd(str, data => {
          if (data.includes('演出时间')) {
            child.close();
            resolve();
          }
        });
        setTimeout(() => {
          reject('timeout');
          child && child.close();
        }, 10000);
      });
    },
    async updateLoopType(loopTicketType) {
      let obj = {...this.curRow, loopTicketType};
      await this.updateFile({key: this.curRow.port, val: obj});
    },
    async handlerAdd(val) {
      let obj = {...val};
      delete obj.checkIndex;
      try {
        await this.updateFile({key: val.port, val: obj, isAdd: true});
        await this.runOne(val.port, val.checkIndex);
        await this.$refs.table.getList();
      } catch (e) {
        console.log(e);
      }
    },
    async handleEdit(val) {
      await this.updateFile({
        key: val.port,
        val: val,
      });
      await this.$refs.table.getList();
    },
    async updateFile({key, val, isAdd}) {
      let fileData = await this.getCheckFile();
      if (isAdd && fileData[key] !== undefined) {
        throw new Error('已经有了' + key);
      }
      fileData[key] = val;
      await writeFile('checkMap.json', JSON.stringify(fileData, null, 4));
    },
    async onDialogOpen(form) {
      let target = this.items.find(one => one.id === 'onlyMonitorType');
      target.options = (form.ticketTypes || []).map(one => ({id: one, name: one}));
      return form;
    },
    async remove(obj) {
      await ElMessageBox.confirm(`确定删除【${obj.curShowName}】?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      let fileData = await this.getCheckFile();
      delete fileData[obj.port];
      await writeFile('checkMap.json', JSON.stringify(fileData, null, 4));
      await this.$refs.table.getList();
    },
    getList() {
      this.$refs.table.getList();
    },
    async getCheckFile() {
      let str = await readFile('checkMap.json');
      return JSON.parse(str);
    },
    async getData({queryItems}) {
      let obj = await this.getCheckFile();
      let data = Object.values(obj);
      let items = queryItems.filter(item => item.value);
      data = data.filter(one => {
        return items.every(({value, column}) => String(one[column]).indexOf(value) !== -1);
      });

      let cmds = Object.keys(this.pidInfo);
      data.forEach(one => {
        one.status = cmds.some(cmd => cmd.includes(one.port)) ? 1 : 0;
      });
      return {
        total: data.length,
        records: data,
      };
    },
  },
};
</script>

<style></style>
