<template>
  <ModuleContainer :back-image="props.data?.backImage">
    <div class="service-promise-container">
      <!-- 时效承诺部分 -->
      <div
        class="section"
        v-if="props.data?.section1"
      >
        <h2 class="section-title">{{ props.data.section1.title }}</h2>
        <div class="promise-grid">
          <div
            v-for="(item, index) in props.data.section1.items"
            :key="index"
            class="promise-card"
          >
            <div class="promise-header">
              <div class="promise-icon">!</div>
              <h3 class="promise-name">{{ item.title }}</h3>
            </div>
            <div class="promise-content">
              <div
                v-for="(contentItem, contentIndex) in item.content"
                :key="contentIndex"
                class="promise-item"
              >
                <div class="promise-sub-item">
                  <span class="item-label">{{ contentItem.subTitle }}:</span>
                  <span class="item-desc">{{ contentItem.subDesc }}</span>
                </div>
              </div>
            </div>
            <div
              class="promise-actions"
              v-if="props.config?.editable || props.config?.deletable"
            >
              <button
                v-if="props.config?.deletable"
                class="action-btn delete-btn"
              >
                🗑️ 删除
              </button>
              <div
                v-if="props.config?.deletable && props.config?.editable"
                class="action-divider"
              ></div>
              <button
                v-if="props.config?.editable"
                class="action-btn edit-btn"
                @click="openEditDialog"
              >
                ✏️ 编辑
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 服务安排部分 -->
      <div
        class="section"
        v-if="props.data?.section2"
      >
        <h2 class="section-title">{{ props.data.section2.title }}</h2>
        <div class="service-list">
          <div
            v-for="(item, index) in props.data.section2.items"
            :key="index"
            class="service-card"
          >
            <div class="service-header">
              <div class="service-icon">!</div>
              <h3 class="service-name">{{ item.title }}</h3>
            </div>
            <div class="service-description">
              {{ item.description }}
            </div>
            <div
              class="service-actions positioned"
              v-if="props.config?.editable || props.config?.deletable"
            >
              <button
                v-if="props.config?.deletable"
                class="action-btn delete-btn"
              >
                🗑️ 删除
              </button>
              <div
                v-if="props.config?.deletable && props.config?.editable"
                class="action-divider"
              ></div>
              <button
                v-if="props.config?.editable"
                class="action-btn edit-btn"
                @click="openEditDialog"
              >
                ✏️ 编辑
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vant 编辑弹框 -->
    <van-dialog
      v-model:show="editVisible"
      title="编辑"
      :show-confirm-button="false"
      :show-cancel-button="false"
      position="bottom"
      class="edit-dialog"
    >
      <div class="edit-form">
        <!-- 第一个分组 -->
        <van-cell-group>
          <van-field
            v-model="formData.group1.field1"
            label="标题1"
            placeholder="正常件"
          />
          <van-field
            v-model="formData.group1.field2"
            label="内容1"
            placeholder="xxx个工作日完成承保出单"
          />
        </van-cell-group>

        <!-- 第二个分组 -->
        <van-cell-group>
          <van-field
            v-model="formData.group2.field1"
            label="标题1"
            placeholder="问题件"
          />
          <van-field
            v-model="formData.group2.field2"
            label="内容1"
            placeholder="xxx个工作日进行问题处理"
          />
        </van-cell-group>

        <!-- 自定义按钮 -->
        <div class="custom-buttons">
          <button class="confirm-btn" @click="confirmEdit">
            确认
          </button>
          <button class="add-btn" @click="addItem">
            +添加
          </button>
        </div>
      </div>
    </van-dialog>
  </ModuleContainer>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import type { IModule } from './types';
  import ModuleContainer from './ModuleContainer.vue';
  import { Dialog, CellGroup, Field } from 'vant';

  interface Props {
    data?: {
      section1?: {
        title: string;
        items: Array<{
          title: string;
          content: Array<{
            subTitle: string;
            subDesc: string;
          }>;
        }>;
      };
      section2?: {
        title: string;
        items: Array<{
          title: string;
          description: string;
        }>;
      };
      [key: string]: any;
    };
    config?: IModule;
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => ({}),
  });

  // Emits
  const emit = defineEmits<{
    update: [data: any];
  }>();

  // 响应式数据
  const editVisible = ref(false);
  const formData = ref({
    group1: {
      field1: '',
      field2: ''
    },
    group2: {
      field1: '',
      field2: ''
    }
  });

  // 打开编辑弹框
  const openEditDialog = () => {
    editVisible.value = true;
  };

  // 关闭编辑弹框
  const closeEditDialog = () => {
    editVisible.value = false;
  };

  // 确认编辑
  const confirmEdit = () => {
    // 处理表单数据
    console.log('表单数据:', formData.value);
    closeEditDialog();
  };

  // 添加项目
  const addItem = () => {
    // 处理添加逻辑
    console.log('添加新项目');
    // 可以在这里添加新的表单项或其他逻辑
  };

  // 处理数据更新
  const handleUpdate = () => {
    emit('update', props.data);
  };
</script>

<style scoped>
  .service-promise-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px;
    background: #f5f7fa;
    border-radius: 12px;
    font-family: 'Microsoft YaHei', sans-serif;
  }

  .section {
    margin-bottom: 50px;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 30px;
    text-align: left;
    position: relative;
    padding-left: 0;
  }

  .section-title::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: -8px;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #ff6b35, #f7931e);
    border-radius: 2px;
  }

  /* 时效承诺样式 */
  .promise-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 25px;
  }

  .promise-card {
    background: white;
    border-radius: 12px;
    padding: 25px;
    border: 1px solid #e8ecf0;
  }

  .promise-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
  }

  .promise-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    font-size: 1.2rem;
  }

  .promise-name {
    font-size: 1.3rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }

  .promise-content {
    margin-bottom: 20px;
  }

  .promise-item {
    margin-bottom: 12px;
    padding: 8px 0;
  }

  .promise-sub-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .item-label {
    font-weight: 600;
    color: #5a6c7d;
    font-size: 1rem;
  }

  .item-desc {
    font-weight: 500;
    color: #2c3e50;
    font-size: 0.95rem;
    line-height: 1.4;
    padding-left: 0;
  }

  .promise-desc {
    color: #7b8794;
    font-size: 0.9rem;
    margin-bottom: 12px;
    line-height: 1.5;
    padding-left: 78px;
    margin-top: -5px;
  }

  .promise-actions {
    display: flex;
    align-items: center;
    margin-top: 20px;
    margin-left: -25px;
    margin-right: -25px;
    margin-bottom: -25px;
    border-top: 1px solid #e8ecf0;
    padding-top: 0;
  }

  .action-divider {
    width: 1px;
    height: 20px;
    background-color: #e8ecf0;
  }

  /* 服务安排样式 */
  .service-list {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .service-card {
    position: relative;
    background: white;
    border-radius: 12px;
    padding: 30px;
    border: 1px solid #e8ecf0;
  }

  .service-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
  }

  .service-header .service-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    font-size: 1.2rem;
    color: white;
  }

  .service-name {
    font-size: 1.3rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    flex: 1;
  }

  .service-actions {
    display: flex;
    align-items: center;
    margin-top: 20px;
    padding-top: 0;
  }

  .service-actions.positioned {
    position: absolute;
    top: 0;
    right: 0;
    width: auto;
    margin-top: 0;
    border: 1px solid #e8ecf0;
    border-bottom-left-radius: 8px;
    border-top-right-radius: 8px;
    border-top: none;
    border-right: none;
    background-color: #ffffff;
    padding-top: 0;
  }

  .service-actions.positioned .action-btn {
    padding: 6px 10px;
    font-size: 12px;
    white-space: nowrap;
  }

  .service-actions.positioned .action-btn:last-child {
    border-bottom-left-radius: 8px;
  }

  .service-description {
    color: #5a6c7d;
    line-height: 1.6;
    font-size: 1rem;
  }

  /* 按钮样式 */
  .action-btn {
    flex: 1;
    height: 40px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: white;
    color: #666;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .action-btn:hover {
    background-color: #f8f9fa;
  }

  .delete-btn {
    border-color: #ff4757;
    color: #ff4757;
  }

  .edit-btn {
    border-color: #5352ed;
    color: #5352ed;
  }

  /* 编辑弹框样式 */
  .edit-dialog {
    border-radius: 16px 16px 0 0;
    max-height: 80vh;
    overflow: hidden;
  }

  .edit-form {
    padding: 16px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .edit-form .van-cell-group {
    margin-bottom: 16px;
  }

  .edit-form .van-cell-group:last-child {
    margin-bottom: 16px;
  }

  /* 自定义按钮样式 */
  .custom-buttons {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    padding: 0 4px;
  }

  .confirm-btn {
    flex: 1;
    height: 44px;
    background: #ff4757;
    color: white;
    border: none;
    border-radius: 22px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .confirm-btn:hover {
    background: #ff3742;
  }

  .confirm-btn:active {
    background: #e63946;
  }

  .add-btn {
    flex: 1;
    height: 44px;
    background: white;
    color: #ff4757;
    border: 1px solid #ff4757;
    border-radius: 22px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .add-btn:hover {
    background: #fff5f5;
  }

  .add-btn:active {
    background: #ffe8e8;
  }

  /* 响应式设计 */
  @media (max-width: 1024px) {
    .promise-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
  }

  @media (max-width: 768px) {
    .promise-grid {
      grid-template-columns: 1fr;
      gap: 15px;
    }

    .service-promise-container {
      padding: 20px;
    }

    .section-title {
      font-size: 1.6rem;
    }

    .promise-card,
    .service-card {
      padding: 20px;
    }

    .service-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .service-actions {
      align-self: flex-end;
    }
  }
</style>
