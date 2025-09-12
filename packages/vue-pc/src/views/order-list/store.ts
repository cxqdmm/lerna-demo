import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Modal, message } from 'ant-design-vue';
import type {
  OrderItem,
  SearchFormData,
  PaginationConfig,
  OrderListResponse,
  SalesChannel,
} from './types';
import { OrderStatus } from './types';
import {
  getOrderList,
  uploadOrderList,
  closeOrder,
  shareOrder,
  downloadPaymentNotice,
} from './api';

export const useOrderStore = defineStore('order', () => {
  // 状态定义
  const loading = ref(false);
  const orderList = ref<OrderItem[]>([]);
  const router = useRouter();
  const searchForm = reactive<SearchFormData>({
    groupOrderId: '',
    likeEntName: '',
    likeItemName: '',
    likeMainAgentName: '',
    salesChannel: undefined,
    likeMgrName: '',
    regionCode: '',
    applyFormWideStatus: undefined,
  });

  const pagination = reactive<PaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `共 ${total} 条记录 第 ${range[0]}-${range[1]} 条`,
  });

  // 计算属性
  const hasSearchParams = computed(() => {
    return Object.values(searchForm).some(
      (value) => value !== undefined && value !== null && value !== ''
    );
  });

  // 获取订单列表
  const fetchOrderList = async (resetPage = false) => {
    try {
      loading.value = true;

      if (resetPage) {
        pagination.current = 1;
      }

      const params = {
        ...searchForm,
        page: pagination.current,
        pageSize: pagination.pageSize,
      };

      const response = await getOrderList(params);

      orderList.value = response.data;
      pagination.total = response.total;
      pagination.current = response.current;
    } catch (error) {
      console.error('获取订单列表失败:', error);
      orderList.value = [];
      pagination.total = 0;
    } finally {
      loading.value = false;
    }
  };

  // 搜索订单
  const searchOrders = async () => {
    await fetchOrderList(true);
  };

  // 重置搜索表单
  const resetSearchForm = () => {
    Object.keys(searchForm).forEach((key) => {
      const typedKey = key as keyof SearchFormData;
      if (typeof searchForm[typedKey] === 'string') {
        (searchForm[typedKey] as string) = '';
      } else {
        (searchForm[typedKey] as any) = undefined;
      }
    });
  };

  // 清空搜索并重新加载
  const clearSearch = async () => {
    resetSearchForm();
    await fetchOrderList(true);
  };

  // 分页变化处理
  const handlePageChange = async (page: number, pageSize: number) => {
    pagination.current = page;
    pagination.pageSize = pageSize;
    await fetchOrderList();
  };

  // 获取订单状态对应的操作按钮
  const getActionsByStatus = (status: OrderStatus): string[] => {
    const actionMap: Record<string, string[]> = {
      进行中: ['详情', '清单上传', '关闭', '分享'],
      待支付: ['详情', '关闭', '下载缴费通知书', '分享'],
      已支付: ['详情', '分享'],
      已完成: ['详情'],
      关闭: ['详情'],
    };

    return actionMap[status] || ['详情'];
  };

  // 处理订单操作
  const handleOrderAction = async (action: string, order: OrderItem) => {
    console.log(`执行操作: ${action}`, order);

    switch (action) {
      case '详情':
        // 跳转到详情页面
        await handleViewDetail(order);
        break;
      case '清单上传':
        // 弹出清单上传确认弹框
        await handleUploadList(order);
        break;
      case '关闭':
        // 弹出关闭确认弹框
        await handleCloseOrder(order);
        break;
      case '分享':
        // 弹出分享确认弹框
        await handleShareOrder(order);
        break;
      case '下载缴费通知书':
        // 下载缴费通知书确认弹框
        await handleDownloadPaymentNotice(order);
        break;
      default:
        console.log('未知操作:', action);
    }
  };

  // 查看详情
  const handleViewDetail = async (order: OrderItem) => {
    try {
      // 跳转到订单详情页面
      await router.push({
        path: `/order-detail`,
        query: {
          groupOrderNumber: order.id,
        },
      });
    } catch (error) {
      console.error('跳转详情页面失败:', error);
      message.error('跳转详情页面失败');
    }
  };

  // 清单上传
  const handleUploadList = async (order: OrderItem) => {
    Modal.confirm({
      title: '清单上传确认',
      content: `确定要上传订单 "${order.groupOrderId}" 的清单吗？`,
      okText: '确认上传',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 调用上传API
          message.loading('正在上传清单...', 0);

          // 实际API调用
          await uploadOrderList(order.id, new File([], 'list.xlsx'));

          message.destroy();
          message.success('清单上传成功');

          // 刷新列表
          await fetchOrderList();
        } catch (error) {
          message.destroy();
          message.error('清单上传失败');
          console.error('清单上传失败:', error);
        }
      },
    });
  };

  // 关闭订单
  const handleCloseOrder = async (order: OrderItem) => {
    Modal.confirm({
      title: '关闭订单确认',
      content: `确定要关闭订单 "${order.groupOrderId}" 吗？此操作不可撤销。`,
      okText: '确认关闭',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          message.loading('正在关闭订单...', 0);

          // 实际API调用
          await closeOrder(order.id);

          message.destroy();
          message.success('订单关闭成功');

          // 刷新列表
          await fetchOrderList();
        } catch (error) {
          message.destroy();
          message.error('订单关闭失败');
          console.error('订单关闭失败:', error);
        }
      },
    });
  };

  // 分享订单
  const handleShareOrder = async (order: OrderItem) => {
    Modal.confirm({
      title: '分享订单',
      content: `确定要分享订单 "${order.groupOrderId}" 吗？`,
      okText: '确认分享',
      cancelText: '取消',
      onOk: async () => {
        try {
          message.loading('正在生成分享链接...', 0);

          // 实际API调用
          const result = await shareOrder(order.id);

          message.destroy();

          // 获取分享链接
          const shareUrl = result.shareUrl;

          // 复制到剪贴板
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(shareUrl);
            message.success('分享链接已复制到剪贴板');
          } else {
            message.success(`分享链接: ${shareUrl}`);
          }
        } catch (error) {
          message.destroy();
          message.error('分享失败');
          console.error('分享失败:', error);
        }
      },
    });
  };

  // 下载缴费通知书
  const handleDownloadPaymentNotice = async (order: OrderItem) => {
    Modal.confirm({
      title: '下载缴费通知书',
      content: `确定要下载订单 "${order.groupOrderId}" 的缴费通知书吗？`,
      okText: '确认下载',
      cancelText: '取消',
      onOk: async () => {
        try {
          message.loading('正在生成缴费通知书...', 0);

          // 实际API调用
          const result = await downloadPaymentNotice(order.id);

          message.destroy();

          // 下载文件
          const link = document.createElement('a');
          link.href = result.downloadUrl;
          link.download = result.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          message.success('缴费通知书下载成功');
        } catch (error) {
          message.destroy();
          message.error('下载失败');
          console.error('下载失败:', error);
        }
      },
    });
  };

  return {
    // 状态
    loading,
    orderList,
    searchForm,
    pagination,

    // 计算属性
    hasSearchParams,

    // 方法
    fetchOrderList,
    searchOrders,
    resetSearchForm,
    clearSearch,
    handlePageChange,
    getActionsByStatus,
    handleOrderAction,
    handleViewDetail,
    handleUploadList,
    handleCloseOrder,
    handleShareOrder,
    handleDownloadPaymentNotice,
  };
});
