<template>
  <div class="custom-uploader">
    <!-- 自定义上传区域 -->
    <div
      class="file-upload-area"
      @click="handleUploadClick"
    >
      <!-- 上传图标 -->
      <div class="upload-icon">
        <svg
          viewBox="0 0 1024 1024"
          width="20"
          height="20"
        >
          <path
            d="M544 864V672h128L512 416 352 672h128v192H320c-17.7 0-32-14.3-32-32V384c0-17.7 14.3-32 32-32h384c17.7 0 32 14.3 32 32v448c0 17.7-14.3 32-32 32H544z"
            fill="#1989fa"
          />
        </svg>
      </div>
      <!-- 上传文字 -->
      <span class="upload-text">{{ $attrs.uploadText || '上传文件' }}</span>
    </div>

    <!-- 隐藏的van-uploader，仅用于文件选择和上传逻辑 -->
    <van-uploader
      ref="uploaderRef"
      v-bind="$attrs"
      @update:model-value="handleFileListChange"
      class="vant-uploader"
    />

    <!-- 自定义文件预览区域 -->
    <div
      v-if="fileList.length > 0"
      class="custom-preview-area"
    >
      <div
        v-for="(file, index) in fileList"
        :key="index"
        class="file-preview-item"
      >
        <!-- 文件类型图标 -->
        <div class="file-type-icon">
          <svg
            viewBox="0 0 1024 1024"
            width="32"
            height="32"
          >
            <path
              d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32 14.3 32 32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326z"
              fill="#1989fa"
            />
          </svg>
        </div>

        <!-- 文件信息区域 -->
        <div class="file-info">
          <div class="file-info-content">
            <!-- 文件名 -->
            <div class="file-name">
              {{ file.file?.name || file.name || '未知文件' }}
            </div>

            <!-- 状态信息 -->
            <div class="file-status">
              <!-- 上传成功 -->
              <template
                v-if="file.status === 'done' && (file.file?.size || file.size)"
              >
                <span class="file-size">
                  {{ formatFileSize(file.file?.size || file.size || 0) }}
                </span>
              </template>

              <!-- 上传中 -->
              <template v-else-if="file.status === 'uploading'">
                <div class="upload-progress">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: (file.progress || 0) + '%' }"
                    ></div>
                  </div>
                </div>
              </template>

              <!-- 上传失败 -->
              <template v-else-if="file.status === 'failed'">
                <span class="error-text">上传失败</span>
              </template>
            </div>
          </div>
          <!-- 删除按钮 -->
          <div
            v-if="file.status !== 'uploading'"
            class="custom-delete-icon"
            @click.stop="handleDelete(file, index)"
          >
            <svg
              viewBox="0 0 1024 1024"
              width="16"
              height="16"
            >
              <path
                d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 0 1 1.9-11.3c1.5-1.2 3.3-1.9 5.2-1.9l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130.1 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"
                fill="#fff"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, useAttrs, computed } from 'vue';
  import {
    UploaderFileListItem,
    Uploader as VanUploader,
    UploaderInstance,
    UploaderProps,
  } from 'vant';

  // 定义props，继承van-uploader的所有props
  interface FileItem extends UploaderFileListItem {
    size?: number;
    name?: string;
    progress?: number;
  }
  interface Props {}

  const props = withDefaults(defineProps<Props>(), {});
  const handleFileListChange = (fields: any) => {
    console.log(fields);
    emit('update:modelValue', fields);
  };
  // 定义emits
  const emit = defineEmits<{
    'update:modelValue': [value: any[]];
  }>();

  // 禁用属性继承，避免重复绑定
  defineOptions({
    inheritAttrs: false,
  });

  // 获取attrs
  const attrs = useAttrs();

  // 获取van-uploader实例的ref
  const uploaderRef = ref<UploaderInstance>();

  // 计算属性：文件列表
  const fileList = computed<FileItem[]>(() => attrs.modelValue as FileItem[]);

  // 触发文件上传
  const handleUploadClick = () => {
    uploaderRef.value?.chooseFile();
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 删除文件
  const handleDelete = (file: FileItem, index: number) => {
    if (uploaderRef.value) {
      // 从文件列表中移除文件
      const newFileList = [...fileList.value];
      newFileList.splice(index, 1);
      emit('update:modelValue', newFileList);
    }
  };

  // 创建Proxy实例，让父组件ref.value直接访问到van-uploader实例
  const exposedRef = new Proxy(
    {},
    {
      get(target, prop: string | symbol) {
        const instance = uploaderRef.value;
        if (instance && prop in instance) {
          const value = instance[prop as keyof typeof instance];
          return typeof value === 'function' ? value.bind(instance) : value;
        }
        return undefined;
      },
      has(target, prop: string | symbol) {
        const instance = uploaderRef.value;
        return instance ? prop in instance : false;
      },
    }
  );

  defineExpose(exposedRef);
</script>

<style scoped>
  .custom-uploader {
    font-size: 0;
  }
  .vant-uploader {
    width: 0;
    height: 0;
    overflow: hidden;
  }
  /* 文件上传区域样式 */
  .file-upload-area {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 48px;
    border-radius: 8px;
    background-color: #ff6026;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .file-upload-area .upload-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .file-upload-area .upload-text {
    font-size: 14px;
    color: #fff;
    margin-left: 6px;
    font-weight: 500;
  }

  /* 自定义预览区域 */
  .custom-preview-area {
    display: flex;
    flex-direction: column;
    margin-top: 12px;
  }

  /* 文件预览项样式 */
  .file-preview-item {
    display: flex;
    align-items: center;
    width: 100%;
    background: #fff;
    min-height: 64px;
    position: relative;
  }
  .file-preview-item:nth-of-type(n + 2) .file-info {
    border-top: 1px solid #ebedf0;
  }

  .file-type-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .file-info {
    margin-left: 8px;
    padding: 12px 0;
    box-sizing: border-box;
    min-height: 64px;
    flex: 1;
    display: flex;
    align-items: center;
    min-width: 0;
  }
  .file-info-content {
    flex: 1;
    display: flex;

    flex-direction: column;
    justify-content: center;
    min-width: 0;
  }

  .file-name {
    font-size: 14px;
    color: #15161a;
    font-weight: 400;
  }

  .file-status {
    font-size: 12px;
    margin-top: 2px;
    color: #969799;
  }

  .file-size {
    color: #969799;
  }

  .upload-progress {
    display: flex;
    margin-top: 7px;
    align-items: center;
  }

  .progress-bar {
    flex: 1;
    height: 4px;
    background: #f2f3f5;
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #ff6026;
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .error-text {
    color: #f53643;
    line-height: 18px;
  }

  /* 自定义删除图标样式 */
  .custom-delete-icon {
    width: 20px;
    height: 20px;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
</style>
