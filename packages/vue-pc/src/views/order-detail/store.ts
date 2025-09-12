import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { OrderDetail, PersonnelItem } from './types';
import { getOrderDetail } from './api';

export const useOrderDetailStore = defineStore('orderDetail', () => {
  // 状态定义
  const loading = ref(false);
  const orderDetail = ref<OrderDetail>({
    id: '',
    companyName: '',
    totalPremium: '',
    groupOrderStatus: '',
    groupOrderNumber: '',
    productName: '',
    salesPlanCode: '',
    salesPlanStatus: '',
    insuranceDate: '',
    paymentMethod: '',
    insurancePeriod: {
      effectiveDate: '',
      expiryDate: '',
      totalDays: 0,
    },
    creationDate: '',
    creditCode: '',
    industry: '',
    address: '',
    registeredArea: '',
    contactPerson: {
      name: '',
      idCard: '',
      email: '',
      phone: '',
    },
    insuranceMode: '',
    openPeriod: {
      startDate: '',
      paymentDate: '',
      effectiveDate: '',
    },
    salesPerson: {
      name: '',
      employeeId: '',
    },
  });

  const personnelList = ref<PersonnelItem[]>([]);

  // 获取订单详情
  const fetchOrderDetail = async (orderId: string) => {
    try {
      loading.value = true;
      const response = await getOrderDetail(orderId);
      orderDetail.value = response.orderDetail;
      if (response.personnelList) {
        personnelList.value = response.personnelList;
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 导出人员清单
  const exportPersonnelList = async () => {
    try {
      // 这里实现导出逻辑
      console.log('导出人员清单');
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  return {
    // 状态
    loading,
    orderDetail,
    personnelList,

    // 方法
    fetchOrderDetail,
    exportPersonnelList,
  };
});
