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
  </div>
</template>

<script>
import {readFile, cmd, writeFile} from '#preload';
import {ElMessageBox, ElNotification} from 'element-plus';

export default {
  data() {
    return {
      addConfig: {
        handler: this.handlerAdd,
      },
      types: ['', 'success', 'danger', 'warning'],
      tableBtnsConfig: [
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
      items: [
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
              defaultValue: 0,
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
      ],
    };
  },

  methods: {
    runOne(port, checkIndex) {
      return new Promise((resolve, reject) => {
        let child = cmd(`cd ../xiudongPupp && npm run check ${port} ${checkIndex}-${checkIndex}`, data => {
          if (data.includes('演出时间')) {
            child.close();
            resolve();
          }
        });
        setTimeout(() => {
          reject('timeout');
        }, 10000);
      });
    },
    async handlerAdd(val) {
      let obj = {...val};
      delete obj.checkIndex;
      await this.updateFile({key: val.port, val: obj, isAdd: true});
      try {
        await this.runOne(val.port, val.checkIndex);
      } catch (e) {
        ElNotification({
          title: 'Error',
          message: '获取信息失败!',
          type: 'error',
        });
      }
      await this.$refs.table.getList();
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
      return {
        total: data.length,
        records: data,
      };
    },
  },
};
</script>

<style>
</style>