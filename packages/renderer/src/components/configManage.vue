<template>
  <div>
    <S-Table
      ref="table"
      v-loading="loading"
      :highlight-current-row="false"
      :is-auto-height="true"
      :items="items"
      :api="getData"
      :add-config="addConfig"
      one-page-hide-pagination
      :table-btns-config="tableBtnsConfig"
      :on-dialog-open="onDialogOpen"
    >
      <template #targetTypes="{row}">
        <el-tag
          v-for="(item, i) in row.targetTypes"
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

    <el-dialog
      v-model="dialogVisible"
      :title="curRow.username"
      width="80%"
      @close="handleClose"
    >
      <div
        v-if="dialogVisible"
        class="terminal-warp"
      >
        <cmd-terminal2
          :cmd="cmd"
          @exit="exit"
        ></cmd-terminal2>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {readFile, cmd, writeFile} from '#preload';
import {ElMessageBox} from 'element-plus';
import { useStore } from '/@/store/global';
import CmdTerminal2 from './cmdTerminal2.vue';

export default {
  components:{
    CmdTerminal2,
  },
  setup(){
    let store = useStore();
    let {pidInfo} = store;
    return {
      pidInfo,
    };
  },
  data() {
    return {
      loading: false,
      curRow:{},
      dialogVisible:false,
      cmd:'',
      addConfig: {
        handler: this.handlerAdd,
      },
      types: ['', 'success', 'danger', 'warning'],
      tableBtnsConfig: [
        {
          type: 'success',
          handler: this.start,
          show: row => row.status ===0,
          name: '启动',
        },
        {
          type: 'danger',
          handler: this.start,
          show: row => row.status ===1,
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
        {
          handler: this.copy,
          name: '复制',
          type: 'success',
        },
      ],
      items: [
        {
          id: 'username',
          name: '用户名',
          width: 100,
          support: {
            query: {},
            add: {},
          },
        },
        {
          id: 'port',
          name: '启动端口',
          width: 100,
          support: {
            query: {},
            add: {},
            edit: {},
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
          id: 'activityName',
          name: '演出',
          support: {
            query: {},
          },
        },

        {
          id: 'nameIndex',
          name: '用户序号',
          width: 50,
          support: {
            edit: {
              type: 'number',
            },
            add: {
              defaultValue: 0,
              type: 'number',
            },
          },
        },

        {
          id: 'phone',
          name: '手机',
        },
        {
          id: 'showTime',
          name: '演出时间',
        },

        {
          id: 'targetTypes',
          name: '目标',
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
        {
          id: 'remark',
          name: '备注',
          width: 100,
          support: {
            query: {},
            add: {},
            edit: {},
          },
        },
        {
          id: 'recordTime',
          name: '创建时间',
          width: 100,
          formatter: val => val && val.replace(/\..*$/, ''),
        },

        {
          id: 'uid',
          name: 'uid',
          support: {
            edit: {},
            add: {},
          },
        },
      ],
    };
  },
  methods: {
    exit(){
      this.dialogVisible = false;
      this.curRow.status = 0;
    },
    getList() {
      this.$refs.table.getList();
    },
    async copy({username}) {
      let {value} = await ElMessageBox.prompt('', '输入新用户');
      this.loading = true;
      await this.cmdCopy(value, username);
      this.getList();
      this.loading = false;
    },
    handleClose(){
      this.getList();
    },
    cmdCopy(value, username) {
      return new Promise(r => {
        cmd(`cd ../xiudongPupp && npm run add ${value} ${username}`, data => {
          if (data === 'done') {
            r();
          }
        });
      });
    },
    start(row) {
      // 1. 是否自动付款
      // 2. 服务器地址
      this.curRow =  row;
      this.cmd = row.cmd;
      console.log(this.cmd);
      this.dialogVisible = true;
      row.status = 1;
    },
    async handlerAdd(val) {
      await this.updateFile({key: val.username, val, isAdd: true});
      await this.getList();
    },
    async handleEdit(val) {
      let obj = {...val};
      delete obj.ticketTypes;
      delete obj.username;
      await this.updateFile({
        key: val.username,
        val: obj,
      });
      await this.$refs.table.getList();
    },
    async updateFile({key, val, isAdd}) {
      let fileData = await this.getConfigFile();
      if (isAdd && fileData[key] !== undefined) {
        throw new Error('已经有了' + key);
      }
      fileData[key] = val;
      await writeFile('config.json', JSON.stringify(fileData, null, 4));
    },
    async onDialogOpen(form) {
      let target = this.items.find(one => one.id === 'targetTypes');
      target.options = (form.ticketTypes || []).map(one => ({id: one, name: one}));
      return form;
    },
    async remove(obj) {
      await ElMessageBox.confirm(`确定删除【${obj.username}】?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      let fileData = await this.getConfigFile();
      delete fileData[obj.username];
      await writeFile('config.json', JSON.stringify(fileData, null, 4));
      await this.getList();
    },
    async getConfigFile() {
      let str = await readFile('config.json');
      return JSON.parse(str);
    },
    async getData({queryItems}) {
      let obj = await this.getConfigFile();
      let data = Object.entries(obj).map(([key, val]) => ({
        ...val,
        ticketTypes: Object.keys(val.typeMap || []),
        username: key,
      }));

      let items = queryItems.filter(item => item.value);
      data = data.filter(one => {
        return items.every(({value, column}) => String(one[column]).indexOf(value) !== -1);
      });
      data.sort((a, b) => new Date(b.recordTime) - new Date(a.recordTime));
     
      data.forEach(one=>{
        let cmd = `cd d:/xiudongPupp && npm run start ${one.username}\n`;
        one.cmd = cmd;
        one.status = this.pidInfo[cmd]?1:0;
      });
      return {
        total: data.length,
        records: data,
      };
    },
  },
};
</script>
