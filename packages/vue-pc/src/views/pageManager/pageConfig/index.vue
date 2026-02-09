<template>
  <div class="config-container">
    <div class="config-steps">
      <h2 class="page-title">
        <a-button
          type="text"
          size="large"
          @click="handleBack"
          class="back-button"
        >
          <LeftOutlined />
        </a-button>
        {{
          pageStatus === 'add'
            ? '新增页面'
            : pageStatus === 'edit'
              ? '编辑页面'
              : '页面详情'
        }}
      </h2>
      <a-steps
        :current="currentStep"
        class="steps-nav"
      >
        <a-step title="基础配置" />
        <a-step title="模块配置" />
      </a-steps>
    </div>
    <a-divider style="margin: 0" />

    <div class="step-content">
      <!-- 加载状态 -->
      <div
        v-if="loading"
        class="loading-container"
      >
        <a-spin size="large"></a-spin>
      </div>

      <!-- 步骤1：基础配置 -->
      <div
        v-else-if="currentStep === 0"
        class="step-panel"
      >
        <div class="step-body">
          <BasicConfigForm
            ref="basicConfigFormRef"
            :status="pageStatus"
            :initial-data="formData"
            @form-change="handleBasicConfigChange"
            @template-select="handleTemplateSelect"
          />
        </div>
      </div>

      <!-- 步骤2：模块配置 -->
      <div
        v-else-if="currentStep === 1"
        class="step-panel"
      >
        <div class="step-body module-step-body">
          <div class="module-layout">
            <!-- 左侧：模板编辑 -->
            <div class="module-panel left-panel">
              <TemplateEditPage
                :status="pageStatus"
                ref="templateEditPageRef"
                @data-change="handleTemplateDataChange"
              />
            </div>

            <!-- 右侧：模板预览 -->
            <div class="module-panel right-panel">
              <iframe
                ref="reviewIframe"
                src="/template-review"
                class="module-iframe"
                frameborder="0"
                @load="onIframeLoad"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="step-actions">
      <a-button
        v-if="currentStep > 0"
        @click="prevStep"
        class="action-btn"
      >
        上一步
      </a-button>
      <a-button
        v-if="currentStep < 1"
        type="primary"
        @click="nextStep"
        class="action-btn"
      >
        下一步
      </a-button>
      <a-button
        v-if="currentStep === 1"
        type="primary"
        @click="
          () => {
            pageStatus === 'preview' ? handleBack() : handleFinish();
          }
        "
        class="action-btn"
      >
        {{
          pageStatus === 'preview'
            ? '返回'
            : pageStatus === 'edit'
              ? '保存修改'
              : '完成配置'
        }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, toRaw, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import { LeftOutlined } from '@ant-design/icons-vue';
  import { useRoute, useRouter } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import TemplateEditPage from '../templateEdit/page.vue';
  import { useTemplateDataSender } from '@/composables/useTemplateDataBridge';
  import { moduleDataTransformer } from './dataTransformer';
  import { BasicConfigForm } from './step1';
  import { usePageConfigStore } from './store';

  // 路由实例
  const route = useRoute();
  const router = useRouter();

  // 使用store
  const store = usePageConfigStore();
  const { pageStatus, formData, loading } = storeToRefs(store);
  const { initPageData } = store;

  // 当前步骤
  const currentStep = ref(0);

  // 基础配置表单引用
  const basicConfigFormRef = ref<InstanceType<typeof BasicConfigForm> | null>(
    null
  );

  // iframe引用
  const reviewIframe = ref<HTMLIFrameElement>();

  // 模板编辑页面引用
  const templateEditPageRef = ref<InstanceType<typeof TemplateEditPage> | null>(
    null
  );

  // 使用模板数据桥接服务
  const { sendTemplateData, onIframeLoad, isReady } =
    useTemplateDataSender(reviewIframe);

  // 使用数据转换工具进行数据转换
  const transformModuleData = (editData: any) => {
    // 验证输入数据
    if (!moduleDataTransformer.validateInputData(editData)) {
      console.warn('⚠️ 输入数据验证失败，使用默认数据');
      return moduleDataTransformer.transform({});
    }

    // 执行数据转换
    const transformedData = moduleDataTransformer.transform(editData);

    // 获取转换统计信息
    const stats = moduleDataTransformer.getTransformStats(
      editData,
      transformedData
    );
    console.log('📊 数据转换统计:', stats);

    return transformedData;
  };

  // 处理来自TemplateEditPage的数据变化
  const handleTemplateDataChange = (data: any) => {
    // 深度转换响应式对象为普通对象
    const plainData = JSON.parse(JSON.stringify(toRaw(data.moduleData)));

    // 转换数据格式
    const transformedData = transformModuleData(plainData);

    console.log('Original data:', plainData);
    console.log('Transformed data:', transformedData);

    sendTemplateData(transformedData);
  };

  // 下一步
  const nextStep = async () => {
    if (currentStep.value === 0 && pageStatus.value !== 'preview') {
      // 在步骤0时，需要先验证基础配置表单（preview模式跳过校验）
      if (basicConfigFormRef.value) {
        const isValid = await basicConfigFormRef.value.validate();
        if (!isValid) {
          message.error('请完善基础配置信息');
          return;
        }
        message.success('基础配置验证通过！');
      }
    }

    if (currentStep.value < 1) {
      currentStep.value++;
    }
  };

  // 上一步
  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  };

  // 处理基础配置变化
  const handleBasicConfigChange = (data: any) => {
    console.log('基础配置数据变化:', data);
    // 这里可以保存基础配置数据
  };

  // 处理模板选择
  const handleTemplateSelect = (templateId: string) => {
    console.log('选择的模板:', templateId);
    // 这里可以根据模板ID加载对应的模板配置
  };

  // 完成配置
  const handleFinish = async () => {
    if (pageStatus.value !== 'preview') {
      // 非preview模式才触发校验
      const validationResults = await templateEditPageRef.value?.validate();
      console.log('模块校验结果:', validationResults);
      // 这里可以添加保存逻辑
    } else {
      // preview模式直接完成，不进行校验
      console.log('预览模式，跳过校验');
    }
  };

  // 返回上一页
  const handleBack = () => {
    console.log('handleBack 方法被调用');
    router.push({ name: 'PageManagerList' });
  };

  // 组件挂载时初始化
  onMounted(async () => {
    let id = query.id;
    try {
      // 获取URL参数
      const urlParams = {
        id: id as string,
        mode: route.query.mode as string,
        copyFromId: route.query.copyFromId as string,
      };

      await initPageData(urlParams);
      console.log('页面初始化完成');
    } catch (error) {
      console.error('页面初始化失败:', error);
      message.error('页面数据加载失败');
    }
  });
</script>

<style scoped>
  .config-container {
    width: 100vw;
    height: 100vh;
    background: white;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .config-steps {
    padding: 20px 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .page-title {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 20px;
    font-weight: 600;
    color: #262626;
  }

  .steps-nav {
    width: 400px;
  }

  .module-layout {
    display: flex;
    height: 100%;
  }

  .module-panel.left-panel {
    padding: 20px 0;
    box-sizing: border-box;

    max-width: 1000px;
    overflow-y: auto;
  }
  .module-panel.right-panel {
    display: flex;
    align-items: center;
    justify-content: center;

    background-color: #eff2f5;
    padding: 20px;
    min-width: 375px;
    flex: 1;
  }

  .panel-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #262626;
  }

  .panel-subtitle {
    font-size: 12px;
    color: #8c8c8c;
    font-weight: normal;
  }

  .panel-content {
    height: calc(100% - 57px);
    position: relative;
    overflow: auto;
  }

  .module-iframe {
    width: 375px;
    height: 100%;
    border-radius: 30px;
    border: none;
    background: #fff;
    max-height: 864px;
  }

  .step-panel {
    height: 100%;
  }

  .step-title {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  .step-title h2 {
    margin: 0 0 8px 0;
    font-size: 20px;
    color: #262626;
  }

  .step-title p {
    margin: 0;
    color: #8c8c8c;
    font-size: 14px;
  }

  .step-body {
    flex: 1;
    height: 100%;
    box-sizing: border-box;
    overflow: auto;
  }

  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    background: #fafafa;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    color: #8c8c8c;
  }

  .placeholder-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .placeholder-text {
    font-size: 16px;
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }

  .loading-placeholder {
    width: 100%;
    height: 300px;
  }

  .step-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 24px;
    border-top: 1px solid #f0f0f0;
  }
  .step-content {
    flex: 1;
    overflow: hidden;
  }
  .module-step-body {
    overflow: hidden;
  }
  .fixed-bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    padding: 16px 32px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    border-top: 1px solid #e8e8e8;
  }

  .page-header-content {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
  }

  .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    transition: all 0.2s;

    &:hover {
      background-color: #f5f5f5;
    }
  }

  .page-title {
    margin: 0;
  }

  .action-btn {
    min-width: 100px;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .config-container {
      padding: 24px 16px;
    }

    .step-actions {
      flex-direction: column;
      align-items: center;
    }

    .action-btn {
      width: 100%;
      max-width: 200px;
    }
  }
</style>
