<template>
  <div class="data-table-container">
    <a-table
      :columns="columns"
      :data-source="orderList"
      :loading="loading"
      :pagination="paginationConfig"
      :scroll="{ x: 1200 }"
      row-key="id"
      size="middle"
      @change="handleTableChange"
    >
      <!-- 状态列自定义渲染 -->
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ record.applyFormWideStatus }}
        </a-tag>
      </template>

      <!-- 操作列自定义渲染 -->
      <template #action="{ record }">
        <a-space
          :size="8"
          wrap
        >
          <a-button
            v-for="action in getActionsByStatus(record.status)"
            :key="action"
            type="link"
            size="small"
            :danger="action === '关闭'"
            @click="handleAction(action, record)"
          >
            {{ action }}
          </a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { storeToRefs } from 'pinia';
  import type { TableColumnsType, TableProps } from 'ant-design-vue';
  import type { OrderItem, OrderStatus } from '../types';
  import { useOrderStore } from '../store';

  const orderStore = useOrderStore();
  const { orderList, loading, pagination } = storeToRefs(orderStore);

  // 表格列定义
  const columns: TableColumnsType<OrderItem> = [
    {
      title: '团订单号',
      dataIndex: 'groupOrderId',
      key: 'groupOrderId',
      width: 120,
      fixed: 'left',
    },
    {
      title: '投保单位',
      dataIndex: 'entName',
      key: 'entName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '销售商品名称',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '销售方案编码',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 120,
    },
    {
      title: '销售渠道',
      dataIndex: 'salesChannel',
      key: 'salesChannel',
      width: 100,
    },
    {
      title: '订单类型',
      dataIndex: 'applyTypeDesc',
      key: 'applyTypeDesc',
      width: 80,
    },
    {
      title: '所属机构',
      dataIndex: 'regionCode',
      key: 'regionCode',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      slots: { customRender: 'status' },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      slots: { customRender: 'action' },
    },
  ];

  // 分页配置
  const paginationConfig = computed(() => ({
    current: pagination.value.current,
    pageSize: pagination.value.pageSize,
    total: pagination.value.total,
    showSizeChanger: pagination.value.showSizeChanger,
    showQuickJumper: pagination.value.showQuickJumper,
    showTotal: pagination.value.showTotal,
    pageSizeOptions: ['10', '20', '50', '100'],
    onShowSizeChange: (current: number, size: number) => {
      orderStore.handlePageChange(current, size);
    },
  }));

  // 获取状态颜色
  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      进行中: 'processing',
      待支付: 'warning',
      已支付: 'success',
      已完成: 'default',
      关闭: 'error',
    };
    return colorMap[status] || 'default';
  };

  // 获取状态对应的操作按钮
  const getActionsByStatus = (status: OrderStatus): string[] => {
    return orderStore.getActionsByStatus(status);
  };

  // 表格变化处理（分页、排序、筛选）
  const handleTableChange: TableProps<OrderItem>['onChange'] = (pagination) => {
    if (pagination) {
      orderStore.handlePageChange(
        pagination.current || 1,
        pagination.pageSize || 10
      );
    }
  };

  // 操作按钮处理
  const handleAction = (action: string, record: OrderItem) => {
    orderStore.handleOrderAction(action, record);
  };
</script>

<style scoped>
  .data-table-container {
    padding: 0 24px 24px;
  }

  :deep(.ant-table) {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #fafafa;
    font-weight: 600;
  }

  :deep(.ant-table-tbody > tr > td) {
    padding: 12px 16px;
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background: #f5f5f5;
  }

  :deep(.ant-pagination) {
    margin-top: 16px;
    text-align: right;
  }

  :deep(.ant-btn-link) {
    padding: 0 4px;
    height: auto;
  }

  :deep(.ant-tag) {
    margin: 0;
    border-radius: 4px;
  }
</style>
