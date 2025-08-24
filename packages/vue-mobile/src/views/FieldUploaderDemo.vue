<template>
  <div class="field-uploader-demo">
    <h2>文件上传组件演示</h2>

    <!-- 基础文件上传 -->
    <div class="demo-section">
      <h3>基础文件上传</h3>
      <FieldUploader
        v-model="fileList"
        :max-count="3"
        accept="*"
        @oversize="onOversize"
        @delete="onDelete"
      />
    </div>

    <!-- 限制文件类型 -->
    <div class="demo-section">
      <h3>限制文件类型（仅PDF）</h3>
      <FieldUploader
        v-model="pdfList"
        :max-count="2"
        accept=".pdf"
        :before-read="onBeforeRead"
        :after-read="onAfterRead"
        @oversize="onOversize"
        @delete="onDelete"
      />
    </div>

    <!-- 限制文件大小 -->
    <div class="demo-section">
      <h3>限制文件大小（最大2MB）</h3>
      <FieldUploader
        v-model="limitedList"
        :max-count="1"
        :max-size="2 * 1024 * 1024"
        accept="*"
        @oversize="onOversize"
        @delete="onDelete"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { showToast } from 'vant';
  import FieldUploader from '@/components/FieldUploader.vue';

  // 文件列表
  const fileList = ref([
    {
      url: 'https://fastly.jsdelivr.net/npm/@vant/assets/leaf.jpeg',
      name: 'leaf.jpeg',
      progress: 50,
      status: 'uploading',
      message: '上传中...',
    },
    {
      url: 'https://fastly.jsdelivr.net/npm/@vant/assets/tree.jpeg',
      name: '文件大小超出限制文件大小超出限制文件大小超出限制文件大小超出限制',
      status: 'failed',
      message: '上传失败',
    },
  ]);
  const pdfList = ref([]);
  const limitedList = ref([]);

  // 文件读取前的回调
  const onBeforeRead = (file) => {
    console.log('准备读取文件:', file.name);
    showToast('开始上传文件');
    return true; // 返回true允许读取，返回false阻止读取
  };

  // 文件读取后的回调
  const onAfterRead = (file) => {
    console.log('文件读取完成:', file);
    // 模拟文件上传进度
    file.status = 'uploading';
    file.progress = 0;

    const uploadInterval = setInterval(() => {
      file.progress += 10;

      if (file.progress >= 100) {
        clearInterval(uploadInterval);
        file.status = 'done';
        file.progress = 100;
        showToast('文件上传成功');
      }
    }, 1000); // 每200ms增加10%，总共2秒完成
  };

  // 文件超出大小限制
  const onOversize = (file) => {
    showToast('文件大小超出限制');
  };

  // 删除文件
  const onDelete = (file, detail) => {
    showToast('文件已删除');
  };
</script>

<style scoped>
  .field-uploader-demo {
    padding: 16px;
  }

  .demo-section {
    margin-bottom: 32px;
  }

  h2 {
    font-size: 20px;
    color: #323233;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 16px;
    color: #646566;
    margin-bottom: 12px;
  }
</style>
