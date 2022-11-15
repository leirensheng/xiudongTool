<template>
  <div>
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
    </S-Table>
  </div>
</template>

<script>
import {readDir, rmDir, rename} from '#preload';
import {ElMessageBox} from 'element-plus';

export default {
  data() {
    return {
      tableBtnsConfig: [
        {
          editConfig: {
            handler: this.handleEdit,
          },
          name: '编辑',
          type: 'success',
        },

        {
          handler: this.remove,
          name: '删除',
          type: 'danger',
        },
      ],
      items: [
        {
          id: 'username',
          name: '文件名',
          width: 100,
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
    },
    async onDialogOpen(form) {
      this.current = form.username;
      return form;
    },
    async handleEdit({username}) {
      console.log(username);
      if (username !== this.current) {
        if (this.allData.find(one => one.username === username)) {
          throw new Error('有了' + username);
        } else {
          await rename('./checkData/' + this.current, './checkData/' + username);
        }
      }
    },

    async getData({queryItems}) {
      let allUser = await readDir('checkData');
      let allData = allUser.map(username => ({username}));
      this.allData = allData;

      let items = queryItems.filter(item => item.value);
      allData = allData.filter(one => {
        return items.every(({value, column}) => String(one[column]).indexOf(value) !== -1);
      });
      return {
        total: allData.length,
        records: allData,
      };
    },
  },
};
</script>

<style></style>
