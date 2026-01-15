<template>
  <div class="list-page">
    <!-- 列表头 -->
    <ListHeader
      title="物料列表"
      description="管理系统中的所有物料信息"
      @add="handleAdd"
    >
      <template #actions>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><ExportOutlined /></template>
            导出
          </a-button>
          <a-button type="primary" @click="handleAdd">
            <template #icon><PlusOutlined /></template>
            新增物料
          </a-button>
        </a-space>
      </template>
    </ListHeader>
    
    <!-- 搜索模块 -->
    <SearchForm
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
    />
    
    <!-- 批量操作栏 -->
    <div v-if="selectedRowKeys.length > 0" class="batch-actions">
      <a-space>
        <span>已选择 {{ selectedRowKeys.length }} 项</span>
        <a-button size="small" @click="handleBatchDelete">
          批量删除
        </a-button>
        <a-button size="small" @click="handleBatchExport">
          批量导出
        </a-button>
        <a-button size="small" type="link" @click="clearSelection">
          取消选择
        </a-button>
      </a-space>
    </div>
    
    <!-- 数据表格 -->
    <DataTable
      :data-source="tableData"
      :loading="loading"
      :selected-row-keys="selectedRowKeys"
      @view="handleView"
      @edit="handleEdit"
      @copy="handleCopy"
      @delete="handleDelete"
      @selection-change="handleSelectionChange"
    />
    
    <!-- 分页器 -->
    <TablePagination
      :current="pagination.current"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      @change="handlePageChange"
    />
    
    <!-- 新增/编辑弹框 -->
    <AddMaterialModal
      v-model:open="modalVisible"
      :status="modalStatus"
      :data="editData"
      @submit="handleModalSubmit"
      @cancel="handleModalCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ExportOutlined, PlusOutlined } from '@ant-design/icons-vue';
import ListHeader from './components/ListHeader.vue';
import SearchForm from './components/SearchForm.vue';
import DataTable from './components/DataTable.vue';
import TablePagination from './components/TablePagination.vue';
import AddMaterialModal from './components/AddMaterialModal.vue';
import { useList } from './useList'
import type { MaterialRecord, SearchFormData } from './service'
const {
  loading,
  tableData,
  selectedRowKeys,
  searchParams,
  pagination,
  fetchData,
  handleSearch,
  handleReset,
  handlePageChange,
  handleSelectionChange,
  clearSelection,
  handleAdd: openAddByComposable,
  handleEdit: openEditByComposable,
  handleDelete,
  handleBatchDelete,
  handleExport,
  handleBatchExport,
} = useList()

const modalVisible = ref(false)
const modalStatus = ref<'add' | 'edit'>('add')
const editData = ref<any>(undefined)

function openModal(status: 'add' | 'edit', data?: MaterialRecord) {
  modalStatus.value = status
  editData.value = data
    ? {
        ...data,
        fileKey: data.fileKey || '',
        isEffective: !!data.isEffective,
      }
    : undefined
  modalVisible.value = true
}

function handleAdd() {
  openAddByComposable(openModal as any)
}

function handleEdit(record: MaterialRecord) {
  openEditByComposable(record, openModal as any)
}

function handleModalSubmit(data: any, status: 'add' | 'edit') {
  fetchData()
  modalVisible.value = false
}

function handleModalCancel() {
  modalVisible.value = false
  editData.value = undefined
}

function handleView(record: MaterialRecord) {}

function handleCopy(record: MaterialRecord) {}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.list-page {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.batch-actions {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 6px;
  padding: 8px 16px;
  margin-bottom: 16px;
}
</style>
