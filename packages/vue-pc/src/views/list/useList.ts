import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { listMaterials, removeMaterial, removeMaterials, type MaterialRecord, type SearchFormData } from './service'

export function useList() {
  const loading = ref(false)
  const tableData = ref<MaterialRecord[]>([])
  const selectedRowKeys = ref<string[]>([])
  const searchParams = reactive<SearchFormData>({})
  const pagination = reactive({ current: 1, pageSize: 10, total: 0 })

  async function fetchData() {
    loading.value = true
    try {
      const res = await listMaterials({ page: pagination.current, pageSize: pagination.pageSize, search: searchParams })
      tableData.value = res.rows
      pagination.total = res.total
    } catch {
      message.error('获取数据失败')
    } finally {
      loading.value = false
    }
  }

  function handleSearch(params: SearchFormData) {
    Object.assign(searchParams, params)
    pagination.current = 1
    fetchData()
  }

  function handleReset() {
    Object.keys(searchParams).forEach(k => delete (searchParams as any)[k])
    pagination.current = 1
    fetchData()
  }

  function handlePageChange(page: number, pageSize: number) {
    pagination.current = page
    pagination.pageSize = pageSize
    fetchData()
  }

  function handleSelectionChange(keys: string[]) {
    selectedRowKeys.value = keys
  }

  function clearSelection() {
    selectedRowKeys.value = []
  }

  function handleAdd(open: (status: 'add', data?: MaterialRecord) => void) {
    open('add')
  }

  function handleEdit(record: MaterialRecord, open: (status: 'edit', data?: MaterialRecord) => void) {
    open('edit', record)
  }

  async function handleDelete(record: MaterialRecord) {
    await removeMaterial(record.id)
    message.success(`删除成功: ${record.materialName}`)
    fetchData()
  }

  async function handleBatchDelete() {
    if (!selectedRowKeys.value.length) return
    await removeMaterials(selectedRowKeys.value)
    message.success(`批量删除 ${selectedRowKeys.value.length} 项`)
    selectedRowKeys.value = []
    fetchData()
  }

  function handleExport() {
    message.info('导出功能')
  }

  function handleBatchExport() {
    message.info(`批量导出 ${selectedRowKeys.value.length} 项`)
  }

  return {
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
    handleAdd,
    handleEdit,
    handleDelete,
    handleBatchDelete,
    handleExport,
    handleBatchExport,
  }
}
