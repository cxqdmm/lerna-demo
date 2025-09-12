<template>
  <div class="p-6 bg-gray-50 border-b border-gray-200">
    <a-form
      :model="searchForm"
      layout="inline"
      class="search-form"
      @finish="handleSearch"
    >
      <a-row :gutter="[16, 16]">
        <!-- 第一行 -->
        <a-col :span="6">
          <a-form-item
            label="团订单号"
            name="groupOrderNumber"
          >
            <a-input
              v-model="searchForm.groupOrderId"
              placeholder="请输入"
              allow-clear
            />
          </a-form-item>
        </a-col>

        <a-col :span="6">
          <a-form-item
            label="投保单位"
            name="insuredUnit"
          >
            <a-input
              v-model="searchForm.likeEntName"
              placeholder="请输入"
              allow-clear
            />
          </a-form-item>
        </a-col>

        <a-col :span="6">
          <a-form-item
            label="商品名称"
            name="productName"
          >
            <a-input
              v-model="searchForm.likeItemName"
              placeholder="请输入"
              allow-clear
            />
          </a-form-item>
        </a-col>

        <a-col :span="6">
          <a-form-item
            label="销售人员姓名"
            name="salesPersonName"
          >
            <a-input
              v-model="searchForm.likeMainAgentName"
              placeholder="请输入"
              allow-clear
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="[16, 16]">
        <!-- 第二行 -->
        <a-col :span="6">
          <a-form-item
            label="销售渠道"
            name="salesChannel"
          >
            <a-select
              v-model="searchForm.salesChannel"
              placeholder="请选择"
              allow-clear
              :loading="optionsLoading"
            >
              <a-select-option
                v-for="option in salesChannelOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :span="6">
          <a-form-item
            label="产品经理"
            name="productManager"
          >
            <a-input
              v-model="searchForm.likeMgrName"
              placeholder="请输入"
              allow-clear
            />
          </a-form-item>
        </a-col>

        <a-col :span="6">
          <a-form-item
            label="机构"
            name="organization"
          >
            <a-input
              v-model="searchForm.regionCode"
              placeholder="请输入"
              allow-clear
            />
          </a-form-item>
        </a-col>

        <a-col :span="6">
          <a-form-item
            label="状态"
            name="status"
          >
            <a-select
              v-model="searchForm.applyFormWideStatus"
              placeholder="请选择"
              allow-clear
              :loading="optionsLoading"
            >
              <a-select-option
                v-for="option in orderStatusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 操作按钮 -->
      <a-row
        :gutter="[16, 16]"
        class="mt-2 text-center"
      >
        <a-col>
          <a-space>
            <a-button
              type="primary"
              html-type="submit"
              :loading="loading"
              class="min-w-20 rounded"
            >
              查询
            </a-button>
            <a-button
              class="min-w-20 rounded"
              @click="handleReset"
            >
              重置
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useOrderStore } from '../store';
  import { getSalesChannelOptions, getOrderStatusOptions } from '../api';
  import type { SalesChannel, OrderStatus } from '../types';

  const orderStore = useOrderStore();
  const { searchForm, loading } = storeToRefs(orderStore);

  // 选项数据
  const salesChannelOptions = ref<{ label: string; value: SalesChannel }[]>([]);
  const orderStatusOptions = ref<{ label: string; value: OrderStatus }[]>([]);
  const optionsLoading = ref(false);

  // 加载选项数据
  const loadOptions = async () => {
    try {
      optionsLoading.value = true;
      const [channelData, statusData] = await Promise.all([
        getSalesChannelOptions(),
        getOrderStatusOptions(),
      ]);
      salesChannelOptions.value = channelData;
      orderStatusOptions.value = statusData;
    } catch (error) {
      console.error('加载选项数据失败:', error);
    } finally {
      optionsLoading.value = false;
    }
  };

  onMounted(() => {
    loadOptions();
  });

  // 搜索处理
  const handleSearch = async () => {
    await orderStore.searchOrders();
  };

  // 重置处理
  const handleReset = async () => {
    await orderStore.clearSearch();
  };
</script>

<style scoped>
  /* Tailwind CSS 类已经可以处理大部分样式，保留必要的自定义样式 */
  .search-form :deep(.ant-form-item) {
    margin-bottom: 16px;
  }

  .search-form :deep(.ant-form-item-label) {
    width: 100px;
    text-align: right;
  }

  .search-form :deep(.ant-form-item-control) {
    flex: 1;
  }

  :deep(.ant-input),
  :deep(.ant-select-selector) {
    border-radius: 4px;
  }
</style>
