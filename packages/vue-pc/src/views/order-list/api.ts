import httpInstance from '@/api/index';
import type { SearchFormData, OrderListResponse, OrderItem } from './types';
import { OrderStatus, SalesChannel } from './types';

// 获取销售渠道选项
export const getSalesChannelOptions = async (): Promise<
  { label: string; value: SalesChannel }[]
> => {
  // Mock数据
  const mockData = [
    { label: '寿渠', value: SalesChannel.SHOUQU },
    { label: '银行', value: SalesChannel.YINHANG },
    { label: '产险', value: SalesChannel.CHANXIAN },
    { label: '养老险', value: SalesChannel.YANGLAO },
    { label: '健康险直销', value: SalesChannel.JIANKANG_ZHIXIAO },
  ];

  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockData;

  // 实际接口调用 (未来替换)
  // return httpInstance.post('/order/sales-channel/list')
};

// 获取订单状态选项
export const getOrderStatusOptions = async (): Promise<
  { label: string; value: OrderStatus }[]
> => {
  // Mock数据
  const mockData = [
    { label: '进行中', value: OrderStatus.IN_PROGRESS },
    { label: '待支付', value: OrderStatus.PENDING_PAYMENT },
    { label: '已支付', value: OrderStatus.PAID },
    { label: '已完成', value: OrderStatus.COMPLETED },
    { label: '关闭', value: OrderStatus.CLOSED },
  ];

  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockData;

  // 实际接口调用 (未来替换)
  // return httpInstance.post('/order/status/list')
};

// 清单上传API
export const uploadOrderList = async (
  orderId: string,
  file: File
): Promise<void> => {
  // Mock实现
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 实际接口调用 (未来替换)
  // const formData = new FormData()
  // formData.append('file', file)
  // formData.append('orderId', orderId)
  // return httpInstance.post('/order/upload-list', formData)
};

// 关闭订单API
export const closeOrder = async (
  orderId: string,
  reason?: string
): Promise<void> => {
  // Mock实现
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 实际接口调用 (未来替换)
  // return httpInstance.post('/order/close', { orderId, reason })
};

// 分享订单API
export const shareOrder = async (
  orderId: string
): Promise<{ shareUrl: string }> => {
  // Mock实现
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    shareUrl: `https://example.com/order/share/${orderId}`,
  };

  // 实际接口调用 (未来替换)
  // return httpInstance.post('/order/share', { orderId })
};

// 下载缴费通知书API
export const downloadPaymentNotice = async (
  orderId: string
): Promise<{ downloadUrl: string; fileName: string }> => {
  // Mock实现
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {
    downloadUrl: `https://example.com/download/payment-notice/${orderId}.pdf`,
    fileName: `缴费通知书_${orderId}.pdf`,
  };

  // 实际接口调用 (未来替换)
  // return httpInstance.post('/order/download-payment-notice', { orderId })
};

// 模拟API - 获取订单列表
export const getOrderList = async (
  params: SearchFormData & { page: number; pageSize: number }
): Promise<OrderListResponse> => {
  // 模拟API延迟
  await new Promise((resolve) => setTimeout(resolve, 800));

  // 模拟数据
  const mockData = Array.from({ length: 50 }, (_, index) => ({
    id: `DDH09499${index + 1}`,
    groupOrderNumber: `DDH09499${index + 1}`,
    insuredUnit:
      index % 3 === 0
        ? '上海盛牛健康管理有限公司'
        : '中国平安人寿保险股份有限公司',
    productName: `面客商品名称${index + 1}`,
    salesPersonName: `销售员${index + 1}`,
    salesChannel: ['寿渠', '银行', '产险', '养老险', '健康险直销'][index % 5],
    productManager: `产品经理${index + 1}`,
    organization: '深圳市区本部',
    status: [
      OrderStatus.IN_PROGRESS,
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.PAID,
      OrderStatus.COMPLETED,
      OrderStatus.CLOSED,
    ][index % 5],
    orderType: index % 2 === 0 ? '新保' : '续保',
  }));

  // 模拟搜索过滤
  let filteredData = mockData;

  if (params.groupOrderId) {
    filteredData = filteredData.filter((item) =>
      item.groupOrderNumber.includes(params.groupOrderId!)
    );
  }

  if (params.likeEntName) {
    filteredData = filteredData.filter((item) =>
      item.insuredUnit.includes(params.likeEntName!)
    );
  }

  if (params.likeItemName) {
    filteredData = filteredData.filter((item) =>
      item.productName.includes(params.likeItemName!)
    );
  }

  if (params.likeMainAgentName) {
    filteredData = filteredData.filter((item) =>
      item.salesPersonName.includes(params.likeMainAgentName!)
    );
  }

  if (params.salesChannel) {
    filteredData = filteredData.filter(
      (item) => item.salesChannel === params.salesChannel
    );
  }

  if (params.likeMgrName) {
    filteredData = filteredData.filter((item) =>
      item.productManager.includes(params.likeMgrName!)
    );
  }

  if (params.regionCode) {
    filteredData = filteredData.filter((item) =>
      item.organization.includes(params.regionCode!)
    );
  }

  if (params.applyFormWideStatus) {
    filteredData = filteredData.filter(
      (item) => item.status === params.applyFormWideStatus
    );
  }

  // 分页处理
  const total = filteredData.length;
  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  const data = filteredData.slice(start, end);

  return {
    data,
    total,
    current: params.page,
    pageSize: params.pageSize,
  };

  // 实际接口调用 (未来替换)
  // return httpInstance.post('/order/list', params)
};
