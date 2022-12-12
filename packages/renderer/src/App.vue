<template>
  <div class="app">
    <el-tabs
      v-model="activeName"
      class="demo-tabs"
    >
      <el-tab-pane
        v-for="({title, name}, index) in tabs"
        :key="index"
        :label="title"
        :name="name"
      >
      </el-tab-pane>
    </el-tabs>
    <div class="content">
      <component :is="activeName"></component>
    </div>
  </div>
</template>

<script>
import SearchActivity from '/@/components/searchActivity.vue';
import ConfigManage from '/@/components/configManage.vue';
import CheckMapManage from '/@/components/checkMapManage.vue';
import OrderPage from '/@/components/orderPage.vue';
import CheckFileManage from '/@/components/checkFileManage.vue';
import CheckFileFileRename from '/@/components/checkFileFileRename.vue';
import onlyTest from '/@/components/onlyTest.vue';


export default {
  components: {
    SearchActivity,
    CheckMapManage,
    ConfigManage,
    OrderPage,
    CheckFileManage,
    CheckFileFileRename,
    onlyTest,
  },
  data() {
    return {
      activeName: 'CheckMapManage',
      tabs: [
        {
          name: 'SearchActivity',
          title: '演出查询',
        },
        {
          name: 'CheckMapManage',
          title: 'checkMap',
        },
        {
          name: 'ConfigManage',
          title: '用户配置',
        },

        {
          name: 'OrderPage',
          title: '订单页',
        },
        {
          name: 'CheckFileManage',
          title: '文件清理',
        },
        {
          name: 'CheckFileFileRename',
          title: 'check重命名',
        },
        {
          name: 'onlyTest',
          title: '测试',
        },
      ],
    };
  },
  mounted() {},
  methods: {},
};
</script>

<style scoped lang="scss">
#terminal {
  height: 100%;
  width: 100%;
}
.app {
  height: 100vh;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  .content {
    flex: 1;
    overflow: auto;
  }
}
</style>
