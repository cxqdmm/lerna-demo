<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-0">订单列表</h2>
    </div>

    <div class="bg-white rounded-lg shadow-sm">
      <!-- 搜索表单组件 -->
      <SearchForm />

      <!-- 数据表格组件 -->
      <DataTable />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import SearchForm from './components/SearchForm.vue';
  import DataTable from './components/DataTable.vue';
  import { useOrderStore } from './store';

  const orderStore = useOrderStore();

  onMounted(() => {
    // 初始化加载数据
    orderStore.fetchOrderList();
  });
</script>
