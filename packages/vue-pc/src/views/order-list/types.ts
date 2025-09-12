export interface OrderItem {
  id: string;
  groupOrderId: string; // 团订单号
  entName: string; // 投保单位
  itemName: string; // 商品名称
  itemCode: string; // 销售方案编码
  mainAgentName: string; // 销售人员姓名
  salesChannel: string; // 销售渠道
  mgrName: string; // 产品经理
  regionCode: string; // 机构
  applyFormWideStatus: OrderStatus; // 状态
  applyType: string; // 订单类型
  applyTypeDesc: string; //订单类型描述
}

export enum OrderStatus {
  IN_PROGRESS = '进行中',
  PENDING_PAYMENT = '待支付',
  PAID = '已支付',
  COMPLETED = '已完成',
  CLOSED = '关闭',
}

export enum SalesChannel {
  SHOUQU = '寿渠',
  YINHANG = '银行',
  CHANXIAN = '产险',
  YANGLAO = '养老险',
  JIANKANG_ZHIXIAO = '健康险直销',
}

export interface SearchFormData {
  groupOrderId?: string; // 团订单号
  likeEntName?: string; // 投保单位
  likeItemName?: string; // 商品名称
  likeMainAgentName?: string; // 销售人员姓名
  salesChannel?: SalesChannel; // 销售渠道
  likeMgrName?: string; // 产品经理
  regionCode?: string; // 机构
  applyFormWideStatus?: OrderStatus; // 状态
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  showQuickJumper: boolean;
  showTotal: (total: number, range: [number, number]) => string;
}

export interface OrderListResponse {
  data: OrderItem[];
  total: number;
  current: number;
  pageSize: number;
}
