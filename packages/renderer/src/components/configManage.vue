<template>
  <div class="config-manage">
    <div class="top">
      <el-form
        class="right"
        :inline="true"
      >
        <el-form-item>
          <el-button @click="startServer">重启服务器</el-button>
        </el-form-item>

        <el-form-item label="隐藏频繁">
          <el-switch v-model="isHideFre"></el-switch>
        </el-form-item>
        <el-form-item label="show">
          <el-switch v-model="isShow"></el-switch>
        </el-form-item>
      </el-form>
    </div>

    <S-Table
      ref="table"
      v-loading="loading"
      :table-row-class-name="tableRowClassName"
      :highlight-current-row="false"
      :is-auto-height="true"
      :items="items"
      :api="getData"
      :add-config="addConfig"
      one-page-hide-pagination
      :table-btns-config="tableBtnsConfig"
      :on-dialog-open="onDialogOpen"
      @beforeAssignToTable="beforeAssignToTable"
    >
      <template #username="{row}">
        <div>
          <el-dropdown trigger="contextmenu">
            <span class="el-dropdown-link">
              <template v-if="!row.hasSuccess">
                <span v-if="row.uid">{{ row.username }}</span>
                <el-tag
                  v-if="!row.uid"
                  type="danger"
                  effect="dark"
                >
                  {{ row.username }}
                </el-tag>
              </template>
              <el-tag
                v-else
                type="success"
                effect="dark"
              >
                {{ row.username }}-ok
              </el-tag>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="toOrder(row)">订单</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
      <template #activityId="{row}">
        <div>
          <el-icon
            class="copy-icon"
            @click="copyText(row.activityId)"
          >
            <DocumentCopy />
          </el-icon>
          <span>{{ row.activityId }}</span>
        </div>
      </template>
      <template #activityName="{row}">
        <div>
          <el-icon
            class="copy-icon"
            @click="copy(row)"
          >
            <DocumentCopy />
          </el-icon>
          <span>{{ row.activityName }}</span>
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
import {readFile, cmd, copyText,writeFile} from '#preload';
import {ElMessageBox} from 'element-plus';
import {useStore} from '/@/store/global';
import CmdTerminal2 from './cmdTerminal2.vue';
import axios from 'axios';
import {ElNotification} from 'element-plus';

export default {
  components: {
    CmdTerminal2,
  },
  setup() {
    let store = useStore();
    let {pidInfo} = store;

    let useServer = () => {
      let startServer = () => {
        cmd('cd ../xiudongServer && pm2 restart index.js');
      };

      return {
        startServer,
      };
    };

    return {
      ...useServer(),
      pidInfo,
    };
  },
  data() {
    return {
      isHideFre: true,
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
          handler: row => this.remove(row),
          name: '删除',
          type: 'danger',
        },
        {
          handler: this.copyDir,
          name: 'ToCheck',
          show: row => !row.state,
          type: 'warning',
        },
        // {
        //   handler: this.copyToRemote,
        //   name: '复制配置远程',
        //   show: row => !row.state,
        //   type: 'warning',
        // },
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
          name: '端口',
          width: 80,
          support: {
            query: {},
            add: {},
            edit: {},
          },
        },

        {
          id: 'activityId',
          name: '演出id',
          width: 100,
          valueType: 'slot',
          support: {
            add: {},
            edit: {},
          },
        },
        {
          id: 'activityName',
          minWidth: 200,
          name: '演出',
          valueType: 'slot',
          support: {
            query: {},
          },
        },

        {
          id: 'nameIndex',
          name: '观演人',
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
        // {
        //   id: 'dateOrder',
        //   name: '日期序号',
        //   width: 50,
        //   support: {
        //     edit: {
        //       type: 'number',
        //     },
        //     add: {
        //       defaultValue: 0,
        //       type: 'number',
        //     },
        //   },
        // },

        {
          id: 'phone',
          name: '手机',
          required: true,
          support: {
            add: {},
            query: {},
            edit: {},
          },
        },
        {
          id: 'showTime',
          name: '演出时间',
          width: 110,
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
        // {
        //   id: 'recordTime',
        //   name: '创建时间',
        //   width: 100,
        //   formatter: val => val && val.replace(/\..*$/, ''),
        // },
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
          width: 170,
          isShow: false,
          support: {
            edit: {},
            add: {},
          },
        },
      ],
    };
  },
  watch: {
    isHideFre() {
      this.getList();
    },
  },
  methods: {
    copyText(str){
      copyText(str);
      ElNotification({
              title: '成功',
              message: '复制成功',
              type: 'success',
            });
    },
    async toOrder(row) {
      if (!row.status) {
        cmd('npm run pay ' + row.username);
      } else {
        await ElMessageBox.confirm('运行中,是否终止?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        });
        await this.stop(row);

        cmd('npm run pay ' + row.username);
      }
    },
    async stop(row) {
      let pid = this.pidInfo[this.getCmd(row)];
      await axios.get('http://127.0.0.1:4000/close/' + pid);
      delete this.pidInfo[this.cmd];
      this.getList();
    },
    tableRowClassName({row, rowIndex}) {
      if (row.remark && row.remark.includes('频繁')) {
        return 'grey';
      }
      let colors = ['blue', 'green'];
      if (rowIndex === 0) {
        row.color = colors[0];
      } else if (row.port === this.tableData[rowIndex - 1].port) {
        row.color = this.tableData[rowIndex - 1].color;
      } else {
        let preColor = this.tableData[rowIndex - 1].color;
        row.color = colors.find(one => one !== preColor);
      }
      return row.color;
    },
    copyToRemote() {},
    beforeAssignToTable({records}) {
      this.tableData = records;
    },
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
      return this.$refs.table.getList();
    },
    async copy({username}) {
      let {value} = await ElMessageBox.prompt('', '输入新用户');
      let {value: phone} = await ElMessageBox.prompt('', '用户手机号');
      this.loading = true;

      await this.cmdCopy(value, username, phone);
      await this.getList();
      this.loading = false;
      let target = this.tableData.find(one => one.username === value);
      this.start(target);
    },
    handleClose() {
      this.getList();
    },
    cmdCopy(value, username, phone) {
      return new Promise(r => {
        cmd(`npm run add ${value} ${username} ${phone}`, data => {
          if (data === 'done') {
            r();
          }
        });
      });
    },
    async copyDir(obj) {
      cmd(`npm run remove ${obj.username}`, async data => {
        if (data === 'done') {
          this.getList();
          await ElMessageBox.confirm(`复制完成,删除配置【${obj.username}】?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          });
          this.remove(obj, true);
        }
      });
    },
    getCmd(row) {
      let cmds = Object.keys(this.pidInfo);
      let runningCmd = cmds.find(cmd => cmd.replace(/\s+show/, '') === row.cmd);
      let cmd = runningCmd || row.cmd + ' ' + (this.isShow ? 'show' : '');
      return cmd.trim();
    },
    start(row) {
      this.curRow = row;
      this.cmd = this.getCmd(row);
      console.log(this.cmd);
      this.dialogVisible = true;
      row.status = 1;
    },
    async handlerAdd(val) {
      await this.updateFile({key: val.username, val, isAdd: true});
      await this.getList();
      let target = this.tableData.find(one => one.username === val.username);
      this.start(target);
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
    async remove(obj, noShowConfirm) {
      if (!noShowConfirm) {
        await ElMessageBox.confirm(`确定删除【${obj.username}】?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        });
      }
      let fileData = await this.getConfigFile();
      delete fileData[obj.username];
      await writeFile('config.json', JSON.stringify(fileData, null, 4));
      await this.getList();
    },
    async getConfigFile() {
      let str = await readFile('config.json');
      return JSON.parse(str);
    },
    async stopFrequency(data) {
      let timer;
      data.forEach(one => {
        if (one.remark.includes('频繁')) {
          let cmd = this.getCmd(one);
          let prePid = this.pidInfo[cmd];
          if (prePid) {
            const socketURL = 'ws://127.0.0.1:4000/socket/';
            let ws = new WebSocket(socketURL + prePid);
            ws.onopen = () => {
              ws.close();
              delete this.pidInfo[cmd];
              clearTimeout(timer);
              timer = setTimeout(() => {
                this.getList();
              }, 200);
            };
          }
        }
      });
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
      data.sort((a, b) => new Date(b.port) - new Date(a.port));

      let cmds = Object.keys(this.pidInfo);
      data.forEach(one => {
        let cmd = `npm run start ${one.username}`;
        one.cmd = cmd;
        one.hasSuccess = Boolean(one.hasSuccess);
        one.status = cmds.some(cmd => cmd.replace(/\s+show/, '') === one.cmd) ? 1 : 0;
      });
      data = data.filter(one => (this.isHideFre ? !one.remark.includes('频繁') : true));
      this.stopFrequency(data);
      this.tableData = data;
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
  .table-page-container {
    padding-top: 0;
  }
  .copy-icon {
    position: relative;
    top: 3px;
    cursor: pointer;
    margin-right: 5px;
  }
}
</style>

<style lang="scss">
.el-table {
  color: white;
}
.el-table .blue {
  --el-table-tr-bg-color: rgba(6, 216, 231, 0.5);
}
.el-table .green {
  --el-table-tr-bg-color: rgba(98, 232, 31, 0.5);
}
.el-table .grey {
  --el-table-tr-bg-color: rgba(35, 35, 35, 0.5);
}
.el-dropdown-link {
  width: 100%;
  padding: 15px 25px;
}
</style>
