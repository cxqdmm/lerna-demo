export interface MaterialRecord {
  id: string
  materialName: string
  materialType: string
  materialCode: string
  quantity: number
  status: string
  createTime: string
  updateTime: string
  fileKey?: string
  isEffective?: boolean
  effectiveTime?: string
}

export interface SearchFormData {
  materialName?: string
  materialCode?: string
  materialType?: string
  status?: string
  updateTime?: any[]
}

const KEY = 'list.materials'
const SEEDED = 'list.materials.seeded'

const seed: MaterialRecord[] = [
  { id: '1', materialName: '个人自主权书', materialType: '通用', materialCode: 'COMMON', quantity: 2, status: 'active', createTime: '2025-05-21 00:00:00', updateTime: '2025-05-21 00:00:00', fileKey: 'file_key_001', isEffective: true, effectiveTime: '2025-05-21 00:00:00' },
  { id: '2', materialName: '各种要求书', materialType: '通用', materialCode: 'COMMON', quantity: 8, status: 'active', createTime: '2025-05-21 00:00:00', updateTime: '2025-05-21 00:00:00', fileKey: 'file_key_002', isEffective: true, effectiveTime: '2025-05-21 00:00:00' },
  { id: '3', materialName: '主要要求书', materialType: '商品', materialCode: 'AMG00000793', quantity: 5, status: 'active', createTime: '2025-05-21 00:00:00', updateTime: '2025-05-21 00:00:00', fileKey: 'file_key_003', isEffective: true, effectiveTime: '2025-05-21 00:00:00' },
  { id: '4', materialName: '系统要求', materialType: '企业', materialCode: 'AMG00000794', quantity: 6, status: 'active', createTime: '2025-05-21 00:00:00', updateTime: '2025-05-21 00:00:00', fileKey: 'file_key_004', isEffective: false, effectiveTime: '2025-05-21 00:00:00' },
  { id: '5', materialName: '全部要求书', materialType: '商品', materialCode: '911101056851353021', quantity: 7, status: 'inactive', createTime: '2025-05-21 00:00:00', updateTime: '2025-05-21 00:00:00', fileKey: 'file_key_005', isEffective: false, effectiveTime: '2025-05-21 00:00:00' },
]

function read(): MaterialRecord[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try { return JSON.parse(raw) as MaterialRecord[] } catch { return [] }
}

function write(items: MaterialRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

function ensureSeed() {
  if (localStorage.getItem(SEEDED)) return
  const items = read()
  write(items.length ? items : seed)
  localStorage.setItem(SEEDED, '1')
}

export async function listMaterials(params: { page: number; pageSize: number; search?: SearchFormData }) {
  ensureSeed()
  await new Promise(r => setTimeout(r, 200))
  let items = read()
  const s = params.search || {}
  if (s.materialName) items = items.filter(i => i.materialName.includes(s.materialName!))
  if (s.materialCode) items = items.filter(i => i.materialCode.includes(s.materialCode!))
  if (s.materialType) items = items.filter(i => i.materialType === s.materialType)
  if (s.status) items = items.filter(i => i.status === s.status)
  const total = items.length
  const start = (params.page - 1) * params.pageSize
  const rows = items.slice(start, start + params.pageSize)
  return { total, rows }
}

export async function removeMaterials(ids: string[]) {
  const items = read().filter(i => !ids.includes(i.id))
  write(items)
  await new Promise(r => setTimeout(r, 100))
  return true
}

export async function removeMaterial(id: string) {
  return removeMaterials([id])
}
