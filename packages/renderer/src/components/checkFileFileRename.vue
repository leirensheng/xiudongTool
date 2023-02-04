<template>
  <div>
    <el-button @click="auto">一键处理</el-button>
    <S-Table
      ref="table"
      :highlight-current-row="false"
      :is-auto-height="true"
      :items="items"
      :api="getData"
      one-page-hide-pagination
      :on-dialog-open="onDialogOpen"
      :table-btns-config="tableBtnsConfig"
    >
      <template #username="{row}">
        <span v-if="!row.status">{{ row.username }}</span>
        <el-tag
          v-else
          effect="dark"
          class="ml-2"
          type="danger"
        >
          {{ row.username }}
        </el-tag>
      </template>
    </S-Table>
  </div>
</template>

<script>
import {readDir, rmDir, rename} from '#preload';
import {ElMessageBox} from 'element-plus';
let getNumber = str => Number(str.match(/data(\d+)/)[1]);
import {getRunningCheck} from '/@/utils/index.js';
import {useStore} from '/@/store/global';
import {ElNotification} from 'element-plus';

export default {
  setup() {
    let store = useStore();
    let {pidInfo} = store;
    return {
      pidInfo,
    };
  },
  data() {
    return {
      allData: [],
      isContinue: false,
      tableBtnsConfig: [
        {
          editConfig: {
            handler: this.handleEdit,
          },
          name: '重命名',
          disabled: row => row.disabled,
          type: 'success',
        },

        {
          handler: this.remove,
          name: '删除',
          disabled: row => row.disabled,
          type: 'danger',
        },
      ],
      items: [
        {
          id: 'username',
          name: '文件名',
          width: 100,
          valueType: 'slot',
          slotName: 'username',
          support: {
            edit: {},
            query: {},
          },
        },
      ],
    };
  },
  methods: {
    async remove({username}) {
      await ElMessageBox.confirm(`确定删除【${username}】?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      await rmDir('./checkData/' + username);
      await this.getList();
    },
    async onDialogOpen(form) {
      this.currentUsername = form.username;
      return form;
    },
    async handleEdit({username}) {
      console.log(username);
      if (username !== this.currentUsername) {
        if (this.allData.find(one => one.username === username)) {
          throw new Error('有了' + username);
        } else {
          await rename('./checkData/' + this.currentUsername, './checkData/' + username);
        }
      }
    },
    getList() {
      return this.$refs.table.getList();
    },
    checkIsContinue(data) {
      let startBreak = data.find((one, i) =>
        i !== data.length - 1
          ? getNumber(data[i + 1].username) !== getNumber(one.username) + 1
          : false,
      );
      if (startBreak) {
        startBreak.status = 1;
        this.startBreak = startBreak.username;
      } else {
        this.startBreak = '';
      }
    },
    getLastName() {
      let arr = [...this.allData].filter(one => !one.disabled);
      arr.reverse();
      if (arr.length) {
        return arr[0].username;
      }
      return '';
    },
    async auto() {
      console.time();
      await this.getList();
      console.timeEnd();

      while (this.startBreak) {
        let nextName = `data${getNumber(this.startBreak) + 1}`;
        console.log(nextName);

        this.currentUsername = this.getLastName();
        console.log('准备将' + this.currentUsername + '改成' + nextName);
        await this.handleEdit({username: nextName});
        await this.getList();
      }
      ElNotification({
        title: '成功',
        message: '处理成功',
        type: 'success',
      });
    },
    async getData({queryItems}) {
      let allUser = await readDir('checkData');
      let usedNames = await getRunningCheck(this.pidInfo);
      let allData = allUser.map(username => ({username, disabled: usedNames.includes(username)}));
      this.allData = allData;

      let items = queryItems.filter(item => item.value);
      allData = allData.filter(one => {
        return items.every(({value, column}) => String(one[column]).indexOf(value) !== -1);
      });

      allData.sort((a, b) => {
        return getNumber(a.username) - getNumber(b.username);
      });
      this.checkIsContinue(allData);
      this.allData = allData;
      return {
        total: allData.length,
        records: allData,
      };
    },
  },
};
</script>

<style></style>
