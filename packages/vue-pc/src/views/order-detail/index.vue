<template>
  <div class="order-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <a-button
        type="text"
        @click="handleBack"
        class="back-btn"
      >
        <template #icon>
          <LeftOutlined />
        </template>
        详情
      </a-button>
    </div>

    <!-- 订单信息卡片 -->
    <div class="order-info-card">
      <div class="order-header">
        <div class="company-info">
          <a-avatar
            :size="40"
            style="background: #f56a00"
          >
            企
          </a-avatar>
          <span class="company-name">企业：{{ orderDetail.companyName }}</span>
        </div>
        <div class="total-amount">
          <span class="label">总计保费</span>
          <span class="amount">{{ orderDetail.totalPremium }}</span>
        </div>
      </div>

      <div class="order-meta">
        <div class="meta-row">
          <div class="meta-item">
            <span class="label">团订单状态：</span>
            <span class="value">{{ orderDetail.groupOrderStatus }}</span>
          </div>
          <div class="meta-item">
            <span class="label">团订单号：</span>
            <span class="value">{{ orderDetail.groupOrderNumber }}</span>
          </div>
          <div class="meta-item">
            <span class="label">商品名称：</span>
            <span class="value">{{ orderDetail.productName }}</span>
          </div>
          <div class="meta-item">
            <span class="label">销售方案编码：</span>
            <span class="value">{{ orderDetail.salesPlanCode }}</span>
          </div>
        </div>
        <div class="meta-row">
          <div class="meta-item">
            <span class="label">销售方案状态：</span>
            <span class="value">{{ orderDetail.salesPlanStatus }}</span>
          </div>
          <div class="meta-item">
            <span class="label">投保日期：</span>
            <span class="value">{{ orderDetail.insuranceDate }}</span>
          </div>
          <div class="meta-item">
            <span class="label">缴费方式：</span>
            <span class="value">{{ orderDetail.paymentMethod }}</span>
          </div>
          <div class="meta-item">
            <span class="label">创建日期：</span>
            <span class="value">{{ orderDetail.creationDate }}</span>
          </div>
        </div>
        <div class="meta-row">
          <div class="meta-item">
            <span class="label">保险期限：</span>
            <span class="value">
              {{ orderDetail.insurancePeriod.effectiveDate }} 至
              {{ orderDetail.insurancePeriod.expiryDate }} ({{
                orderDetail.insurancePeriod.totalDays
              }}天)
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签页 -->
    <div class="detail-content">
      <a-tabs
        v-model:activeKey="activeTab"
        class="detail-tabs"
      >
        <a-tab-pane
          key="detail"
          tab="详情"
        >
          <div class="detail-sections">
            <!-- 订单信息 -->
            <div class="section">
              <h3 class="section-title">订单信息</h3>
              <div class="section-content">
                <!-- 企业信息 -->
                <div class="info-group">
                  <h4 class="group-title">企业信息</h4>
                  <a-row :gutter="[24, 16]">
                    <a-col :span="8">
                      <div class="info-item">
                        <span class="label">企业名称：</span>
                        <span class="value">{{ orderDetail.companyName }}</span>
                      </div>
                    </a-col>
                    <a-col :span="8">
                      <div class="info-item">
                        <span class="label">统一社会信用代码：</span>
                        <span class="value">{{ orderDetail.creditCode }}</span>
                      </div>
                    </a-col>
                    <a-col :span="8">
                      <div class="info-item">
                        <span class="label">所属行业：</span>
                        <span class="value">{{ orderDetail.industry }}</span>
                      </div>
                    </a-col>
                    <a-col :span="24">
                      <div class="info-item">
                        <span class="label">详细地址：</span>
                        <span class="value">{{ orderDetail.address }}</span>
                      </div>
                    </a-col>
                    <a-col :span="8">
                      <div class="info-item">
                        <span class="label">注册省市区：</span>
                        <span class="value">
                          {{ orderDetail.registeredArea }}
                        </span>
                      </div>
                    </a-col>
                  </a-row>
                </div>

                <!-- 营业执照 -->
                <div class="info-group">
                  <h4 class="group-title">营业执照</h4>
                  <div class="license-upload">
                    <div class="upload-item">
                      <img
                        src=""
                        alt="营业执照"
                        class="license-image"
                      />
                      <a-button
                        type="text"
                        danger
                        class="remove-btn"
                      >
                        <CloseCircleOutlined />
                      </a-button>
                    </div>
                    <div class="upload-placeholder">
                      <PlusOutlined />
                    </div>
                  </div>
                </div>

                <!-- 经办人信息 -->
                <div class="info-group">
                  <h4 class="group-title">经办人信息</h4>
                  <a-row :gutter="[24, 16]">
                    <a-col :span="6">
                      <div class="info-item">
                        <span class="label">经办人姓名：</span>
                        <span class="value">
                          {{ orderDetail.contactPerson.name }}
                        </span>
                      </div>
                    </a-col>
                    <a-col :span="6">
                      <div class="info-item">
                        <span class="label">经办人身份证号：</span>
                        <span class="value">
                          {{ orderDetail.contactPerson.idCard }}
                        </span>
                      </div>
                    </a-col>
                    <a-col :span="6">
                      <div class="info-item">
                        <span class="label">经办人邮箱：</span>
                        <span class="value">
                          {{ orderDetail.contactPerson.email }}
                        </span>
                      </div>
                    </a-col>
                    <a-col :span="6">
                      <div class="info-item">
                        <span class="label">经办人手机号：</span>
                        <span class="value">
                          {{ orderDetail.contactPerson.phone }}
                        </span>
                      </div>
                    </a-col>
                  </a-row>
                </div>

                <!-- 投保模式 -->
                <div class="info-group">
                  <h4 class="group-title">投保模式</h4>
                  <div class="mode-selection">
                    <a-tag
                      color="orange"
                      class="mode-tag"
                    >
                      {{ orderDetail.insuranceMode }}
                    </a-tag>
                  </div>
                </div>

                <!-- 支付方式 -->
                <div class="info-group">
                  <h4 class="group-title">支付方式</h4>
                  <div class="payment-methods">
                    <a-tag
                      color="orange"
                      class="payment-tag"
                    >
                      {{ orderDetail.paymentMethod }}
                    </a-tag>
                  </div>
                </div>

                <!-- 开放期设置 -->
                <div class="info-group">
                  <h4 class="group-title">开放期设置</h4>
                  <a-row :gutter="[24, 16]">
                    <a-col :span="8">
                      <div class="info-item">
                        <span class="label">开始时间：</span>
                        <span class="value">
                          {{ orderDetail.openPeriod.startDate }}
                        </span>
                      </div>
                    </a-col>
                    <a-col :span="8">
                      <div class="info-item">
                        <span class="label">缴费时间：</span>
                        <span class="value">
                          {{ orderDetail.openPeriod.paymentDate }}
                        </span>
                      </div>
                    </a-col>
                    <a-col :span="8">
                      <div class="info-item">
                        <span class="label">生效时间：</span>
                        <span class="value">
                          {{ orderDetail.openPeriod.effectiveDate }}
                        </span>
                      </div>
                    </a-col>
                  </a-row>
                </div>

                <!-- 销售人员信息 -->
                <div class="info-group">
                  <h4 class="group-title">销售人员信息</h4>
                  <a-row :gutter="[24, 16]">
                    <a-col :span="12">
                      <div class="info-item">
                        <span class="label">姓名：</span>
                        <span class="value">
                          {{ orderDetail.salesPerson.name }}
                        </span>
                      </div>
                    </a-col>
                    <a-col :span="12">
                      <div class="info-item">
                        <span class="label">工号：</span>
                        <span class="value">
                          {{ orderDetail.salesPerson.employeeId }}
                        </span>
                      </div>
                    </a-col>
                  </a-row>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane
          key="personnel"
          tab="人员清单"
        >
          <div class="personnel-content">
            <a-button
              type="primary"
              class="export-btn"
            >
              导出清单
            </a-button>
            <!-- 人员清单内容将在后续实现 -->
            <div class="placeholder-content">
              <a-empty description="人员清单功能开发中..." />
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import {
    LeftOutlined,
    CloseCircleOutlined,
    PlusOutlined,
  } from '@ant-design/icons-vue';
  import { useOrderDetailStore } from './store';
  import { storeToRefs } from 'pinia';

  const route = useRoute();
  const router = useRouter();
  const orderDetailStore = useOrderDetailStore();

  const { orderDetail, loading } = storeToRefs(orderDetailStore);
  const activeTab = ref('detail');

  // 返回上一页
  const handleBack = () => {
    router.back();
  };

  onMounted(() => {
    const orderId = route.params.id as string;
    if (orderId) {
      orderDetailStore.fetchOrderDetail(orderId);
    }
  });
</script>

<style scoped>
  .order-detail-page {
    padding: 16px 24px;
    background: #f5f5f5;
    min-height: 100vh;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .back-btn {
    color: #666;
    font-size: 16px;
    padding: 4px 0;
  }

  .back-btn:hover {
    color: #1890ff;
  }

  .order-info-card {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .company-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .company-name {
    font-size: 16px;
    font-weight: 500;
    color: #262626;
  }

  .total-amount {
    text-align: right;
  }

  .total-amount .label {
    display: block;
    color: #8c8c8c;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .total-amount .amount {
    font-size: 24px;
    font-weight: 600;
    color: #ff4d4f;
  }

  .order-meta {
    background: #fafafa;
    border-radius: 6px;
    padding: 16px;
  }

  .meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    margin-bottom: 12px;
  }

  .meta-row:last-child {
    margin-bottom: 0;
  }

  .meta-item {
    flex: 1;
    min-width: 200px;
  }

  .meta-item .label {
    color: #8c8c8c;
    font-size: 14px;
  }

  .meta-item .value {
    color: #262626;
    font-size: 14px;
    font-weight: 500;
  }

  .meta-item .value.readonly {
    color: #8c8c8c;
    font-style: italic;
  }

  .meta-item .value.readonly::after {
    content: ' (回显，不可修改)';
    font-size: 12px;
    color: #bfbfbf;
  }

  .detail-content {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .detail-tabs {
    padding: 0 24px;
  }

  .detail-tabs :deep(.ant-tabs-nav) {
    margin-bottom: 0;
  }

  .detail-tabs :deep(.ant-tabs-tab) {
    font-size: 16px;
    font-weight: 500;
  }

  .detail-sections {
    padding: 24px 0;
  }

  .section {
    margin-bottom: 32px;
  }

  .section:last-child {
    margin-bottom: 0;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #262626;
    margin: 0 0 20px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid #f0f0f0;
  }

  .info-group {
    margin-bottom: 24px;
  }

  .info-group:last-child {
    margin-bottom: 0;
  }

  .group-title {
    font-size: 16px;
    font-weight: 500;
    color: #595959;
    margin: 0 0 16px 0;
  }

  .info-item .label {
    color: #8c8c8c;
    font-size: 14px;
  }

  .info-item .value {
    color: #262626;
    font-size: 14px;
    font-weight: 500;
  }

  .license-upload {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .upload-item {
    position: relative;
    display: inline-block;
  }

  .license-image {
    width: 120px;
    height: 80px;
    border-radius: 6px;
    border: 1px solid #d9d9d9;
    object-fit: cover;
  }

  .remove-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #fff;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .upload-placeholder {
    width: 120px;
    height: 80px;
    border: 2px dashed #d9d9d9;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8c8c8c;
    cursor: pointer;
    transition: all 0.3s;
  }

  .upload-placeholder:hover {
    border-color: #1890ff;
    color: #1890ff;
  }

  .mode-selection,
  .payment-methods {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .mode-tag,
  .payment-tag {
    margin: 0;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 14px;
  }

  .personnel-content {
    padding: 24px 0;
  }

  .export-btn {
    margin-bottom: 16px;
  }

  .placeholder-content {
    text-align: center;
    padding: 60px 0;
  }
</style>
