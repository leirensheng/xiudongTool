<template>
  <div class="config-manage">
    <el-switch
      v-model="isShow"
      class="switch"
    ></el-switch>
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
      <template #username="{row}">
        <div>
          <span v-if="!row.hasSuccess">{{ row.username }}</span>
          <el-tag
            v-else
            type="success"
            effect="dark"
          >
            {{ row.username }}-ok
          </el-tag>
        </div>
      </template>
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
import {useStore} from '/@/store/global';
import CmdTerminal2 from './cmdTerminal2.vue';

export default {
  components: {
    CmdTerminal2,
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
      isShow: false,
      loading: false,
      curRow: {},
      dialogVisible: false,
      cmd: '',
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
        {
          handler: this.copy,
          name: '复制配置',
          type: 'success',
        },
        {
          handler: this.copyDir,
          name: '复制文件',
          show: row => !row.state,
          type: 'warning',
        },
      ],
      items: [
        {
          id: 'hasSuccess',
          name: '是否已经成功',
          isShow: false,
          options: [
            {name: '是', id: true},
            {name: '否', id: false},
          ],
          support: {
            query: {
              type: 'select',
            },
          },
        },
        {
          id: 'username',
          name: '用户名',
          width: 100,
          valueType: 'slot',
          support: {
            query: {},
            add: {},
          },
        },
        {
          id: 'port',
          name: '启动端口',
          width: 80,
          support: {
            query: {},
            add: {},
            edit: {},
          },
        },

        {
          id: 'activityId',
          name: 'activityId',
          width: 50,
          support: {
            add: {},
            edit: {},
          },
        },
        {
          id: 'activityName',
          minWidth: 250,
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
          id: 'dateOrder',
          name: '日期序号',
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
          required: true,
          support:{
            add:{},
            query:{},
            edit:{},
          },
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
          id: 'hasSuccess',
          name: '是否成功',
          width: 100,
          isShow: false,
          support: {
            edit: {
              type: 'select',
            },
          },
          options: [
            {id: true, name: '是'},
            {id: false, name: '否'},
          ],
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
    getStyle(row) {
      return {
        color: row.hasSuccess ? 'green' : '',
      };
    },
    exit() {
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
    handleClose() {
      this.getList();
    },
    cmdCopy(value, username) {
      return new Promise(r => {
        cmd(`npm run add ${value} ${username}`, data => {
          if (data === 'done') {
            r();
          }
        });
      });
    },
    async copyDir(obj) {
      cmd(`npm run remove ${obj.username}`,async data => {
        if (data === 'done') {
          this.getList();
          await ElMessageBox.confirm(`复制完成,删除配置【${obj.username}】?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          });
          this.remove(obj);
        }
      });
    
    },
    start(row) {
      this.curRow = row;
      let cmds = Object.keys(this.pidInfo);
      let runningCmd = cmds.find(cmd => cmd.includes('npm run start '+ row.username));
      this.cmd = runningCmd || row.cmd + ' ' + (this.isShow ? 'show' : '');
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

      let cmds = Object.keys(this.pidInfo);
      data.forEach(one => {
        let cmd = `npm run start ${one.username}`;
        one.cmd = cmd;
        one.hasSuccess = Boolean(one.hasSuccess);
        one.status = cmds.some(cmd => cmd.includes('npm run start '+one.username)) ? 1 : 0;
      });
      return {
        total: data.length,
        records: data,
      };
    },
  },
};
</script>
<style lang="scss" scoped>
.config-manage {
  position: relative;
  .switch {
    position: absolute;
    top: 20px;
    right: 20px;
  }
}
</style>
