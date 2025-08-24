<template>
  <div class="demo-container">
    <h2>自定义上传组件演示</h2>

    <div class="demo-section">
      <h3>无限制数量</h3>
      <p class="description">
        不设置maxCount或设置为无限大时，只显示"上传图片"文字
      </p>
      <CustomUploader
        v-model="fileList1"
        @delete="handleDelete"
        @oversize="handleOversize"
      />
    </div>

    <div class="demo-section">
      <h3>限制数量显示</h3>
      <p class="description">设置maxCount时，会在"上传图片"下方显示"最多X张"</p>
      <CustomUploader
        v-model="fileList5"
        :max-count="8"
        @delete="handleDelete"
        @oversize="handleOversize"
      />
    </div>

    <div class="demo-section">
      <h3>证件照上传</h3>
      <p class="description">
        演示证件照上传功能，预览尺寸为83:52，适合身份证等证件照片
      </p>
      <div class="idcard-demo">
        <div class="idcard-item">
          <h4>身份证正面</h4>
          <CustomUploader
            v-model="idCardFront"
            upload-type="idcard"
            upload-label="身份证正面"
            :max-count="1"
            accept="image/*"
            @delete="handleDelete"
            @oversize="handleOversize"
          />
        </div>
        <div class="idcard-item">
          <h4>身份证反面</h4>
          <CustomUploader
            v-model="idCardBack"
            :preview-size="166"
            upload-type="idcard"
            upload-label="身份证反面"
            :max-count="1"
            accept="image/*"
            @delete="handleDelete"
            @oversize="handleOversize"
          />
        </div>
        <div class="idcard-item">
          <h4>大尺寸身份证（120px）</h4>
          <CustomUploader
            v-model="idCardLarge"
            upload-type="idcard"
            upload-label="大尺寸身份证"
            :preview-size="120"
            :max-count="1"
            accept="image/*"
            @delete="handleDelete"
            @oversize="handleOversize"
          />
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h3>自定义预览尺寸</h3>
      <p class="description">
        演示如何使用preview-size属性自定义上传区域和预览尺寸
      </p>
      <CustomUploader
        v-model="fileList7"
        :preview-size="120"
        :max-count="3"
        accept="image/*"
        multiple
        @delete="handleDelete"
        @oversize="handleOversize"
      />
    </div>

    <div class="demo-section">
      <h3>透传属性和ref使用</h3>
      <p class="description">
        演示组件如何透传所有van-uploader属性，以及通过ref获取实例
      </p>
      <CustomUploader
        ref="uploaderRef"
        v-model="fileList6"
        :max-count="2"
        :max-size="1024 * 1024"
        accept="image/*"
        multiple
        @delete="handleDelete"
        @oversize="handleOversize"
        @click-upload="handleClickUpload"
      />
      <div class="demo-buttons">
        <button
          @click="getUploaderInfo"
          class="demo-btn"
        >
          获取上传器信息
        </button>
        <button
          @click="clearFiles"
          class="demo-btn"
        >
          清空文件
        </button>
      </div>
    </div>

    <div class="demo-section">
      <h3>限制数量</h3>
      <p class="description">最多上传3张图片</p>
      <CustomUploader
        v-model="fileList2"
        :max-count="3"
        upload-text="最多3张"
        @delete="handleDelete"
      />
    </div>

    <div class="demo-section">
      <h3>自定义尺寸</h3>
      <p class="description">自定义预览图片尺寸</p>
      <CustomUploader
        v-model="fileList3"
        :max-count="4"
        :preview-size="100"
        upload-text="大尺寸"
        @delete="handleDelete"
      />
    </div>

    <div class="demo-section">
      <h3>禁用删除</h3>
      <p class="description">禁用删除功能</p>
      <CustomUploader
        v-model="fileList4"
        :max-count="4"
        :deletable="false"
        upload-text="不可删除"
      />
    </div>

    <div class="info-section">
      <h3>当前文件列表</h3>
      <div class="file-info">
        <h4>基础用法 ({{ fileList1.length }} 个文件):</h4>
        <ul>
          <li
            v-for="(file, index) in fileList1"
            :key="index"
          >
            {{ file.file?.name || `文件${index + 1}` }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import CustomUploader from '@/components/CustomUploader.vue';
  import type { UploaderFileListItem } from 'vant';
  import { showToast } from 'vant';

  // 文件列表
  const fileList1 = ref<UploaderFileListItem[]>([]);
  const fileList2 = ref<UploaderFileListItem[]>([]);
  const fileList3 = ref<UploaderFileListItem[]>([]);
  const fileList4 = ref<UploaderFileListItem[]>([
    {
      url: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      file: { name: '示例图片.jpg' } as File,
    },
  ]);
  const fileList5 = ref<UploaderFileListItem[]>([]);
  const fileList6 = ref<UploaderFileListItem[]>([]);
  const fileList7 = ref<UploaderFileListItem[]>([]);
  const idCardFront = ref<UploaderFileListItem[]>([]);
  const idCardBack = ref<UploaderFileListItem[]>([]);
  const idCardLarge = ref<UploaderFileListItem[]>([]);

  // 上传器ref
  const uploaderRef = ref();

  // 事件处理
  const handleDelete = (
    file: UploaderFileListItem,
    detail: { name: string; index: number }
  ) => {
    showToast(`删除了第${detail.index + 1}个文件`);
  };

  const handleOversize = (file: File | File[], detail: { maxSize: number }) => {
    showToast('文件大小超出限制');
  };

  const handleClickUpload = (event: MouseEvent) => {
    console.log('点击上传:', event);
  };

  // 获取上传器信息
  const getUploaderInfo = () => {
    if (uploaderRef.value) {
      uploaderRef.value.chooseFile();
    }
  };

  // 清空文件
  const clearFiles = () => {
    fileList6.value = [];
    showToast('文件已清空');
  };
</script>

<style scoped>
  .demo-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
    background: #f7f8fa;
    min-height: 100vh;
  }

  h2 {
    color: #323233;
    margin-bottom: 30px;
    text-align: center;
    font-size: 24px;
    font-weight: 600;
  }

  .demo-section {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .demo-section h3 {
    color: #323233;
    margin-bottom: 8px;
    font-size: 18px;
    font-weight: 500;
  }

  .description {
    color: #646566;
    font-size: 14px;
    margin-bottom: 16px;
    line-height: 1.5;
  }

  .info-section {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .file-info {
    margin-top: 16px;
  }

  .file-info h4 {
    color: #323233;
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 500;
  }

  .file-info ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .file-info li {
    background: #f7f8fa;
    padding: 8px 12px;
    margin-bottom: 8px;
    border-radius: 4px;
    color: #646566;
    font-size: 14px;
  }

  .demo-buttons {
    margin-top: 16px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .demo-btn {
    padding: 8px 16px;
    background: #1989fa;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .demo-btn:hover {
    background: #0570d1;
    transform: translateY(-1px);
  }

  .demo-btn:active {
    transform: translateY(0);
  }

  .idcard-demo {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .idcard-item {
    flex: 1;
    min-width: 200px;
  }

  .idcard-item h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .demo-container {
      padding: 16px;
    }

    h2 {
      font-size: 20px;
      margin-bottom: 20px;
    }

    .demo-section {
      padding: 16px;
      margin-bottom: 16px;
    }

    .demo-section h3 {
      font-size: 16px;
    }

    .demo-buttons {
      gap: 8px;
    }

    .demo-btn {
      flex: 1;
      min-width: 0;
    }
  }
</style>
