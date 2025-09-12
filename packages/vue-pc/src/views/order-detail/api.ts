import httpInstance from '@/api/index';
import type { OrderDetailResponse } from './types';

// 获取订单详情
export const getOrderDetail = async (
  orderId: string
): Promise<OrderDetailResponse> => {
  // 模拟API延迟
  await new Promise((resolve) => setTimeout(resolve, 800));

  // 模拟数据
  const mockData: OrderDetailResponse = {
    orderDetail: {
      id: orderId,
      companyName: '这是名称',
      totalPremium: '20000.00',
      groupOrderStatus: '进行中',
      groupOrderNumber: 'DDH3475936',
      productName: '中小微普惠意外伤害团体保险',
      salesPlanCode: 'TradeCode21',
      salesPlanStatus: '已生效',
      insuranceDate: '2025-07-28',
      paymentMethod: '经办人在线支付',
      insurancePeriod: {
        effectiveDate: '2025-08-01',
        expiryDate: '2026-07-31',
        totalDays: 248,
      },
      creationDate: '2025-07-28',
      creditCode: 'IDH244234234234234234',
      industry: '金融业',
      address: '这是地址名称地址名称地址名称地址名称地址名称',
      registeredArea: '上海市/徐汇区',
      contactPerson: {
        name: '这是名称',
        idCard: '310227427423848234823482343',
        email: '238402304234@qq.com',
        phone: '13812345678',
      },
      insuranceMode: '清单上传',
      openPeriod: {
        startDate: '2025-07-28',
        paymentDate: '2025-07-28',
        effectiveDate: '2025-07-28',
      },
      salesPerson: {
        name: '这是名称',
        employeeId: '310227427423848234823482343',
      },
      businessLicense: {
        url: '/api/placeholder/120/80',
        name: '营业执照.jpg',
      },
    },
    personnelList: [
      {
        id: '1',
        name: '张三',
        idCard: '310101199001011234',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        department: '技术部',
        position: '工程师',
        insuranceAmount: 50000,
        status: 'active',
      },
      {
        id: '2',
        name: '李四',
        idCard: '310101199002021234',
        phone: '13800138002',
        email: 'lisi@example.com',
        department: '销售部',
        position: '销售经理',
        insuranceAmount: 80000,
        status: 'active',
      },
    ],
  };

  return mockData;

  // 实际接口调用 (未来替换)
  // return httpInstance.post('/order/detail', { orderId })
};

// 导出人员清单
export const exportPersonnelList = async (
  orderId: string
): Promise<{ downloadUrl: string; fileName: string }> => {
  // 模拟API延迟
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    downloadUrl: `https://example.com/export/personnel/${orderId}.xlsx`,
    fileName: `人员清单_${orderId}.xlsx`,
  };

  // 实际接口调用 (未来替换)
  // return httpInstance.post('/order/export-personnel', { orderId })
};
