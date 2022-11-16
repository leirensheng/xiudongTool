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
  </div>
</template>

<script>
import {readFile, cmd, writeFile} from '#preload';
import {ElMessageBox} from 'element-plus';

export default {
  data() {
    return {
      addConfig: {
        handler: this.handlerAdd,
      },
      types: ['', 'success', 'danger', 'warning'],
      tableBtnsConfig: [
        {
          type: 'success',
          handler: this.start,
          name: '启动',
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
    getList() {
      this.$refs.table.getList();
    },
    async copy({username}) {
      let {value} = await ElMessageBox.prompt('', '输入新用户');
      await this.cmdCopy(value, username);
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
    start() {},
    runOne(port, checkIndex) {
      return new Promise((resolve, reject) => {
        let child = cmd(
          `cd ../xiudongPupp && npm run check ${port} ${checkIndex}-${checkIndex}`,
          data => {
            if (data.includes('演出时间')) {
              child.close();
              resolve();
            }
          },
        );
        setTimeout(() => {
          reject('timeout');
        }, 10000);
      });
    },
    async handlerAdd(val) {
      await this.updateFile({key: val.username, val, isAdd: true});
      // try {
      //   await this.runOne(val.port, val.checkIndex);
      // } catch (e) {
      //   ElNotification({
      //     title: 'Error',
      //     message: '获取信息失败!',
      //     type: 'error',
      //   });
      // }
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
      return {
        total: data.length,
        records: data,
      };
    },
  },
};
</script>

<style></style>
