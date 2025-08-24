<template>
  <div class="custom-uploader">
    <van-uploader
      ref="uploaderRef"
      v-bind="$attrs"
      :class="{ 'idcard-uploader': props.uploadType === 'idcard' }"
      :preview-size="previewSize"
    >
      <!-- 自定义上传区域 -->
      <template #default>
        <div
          class="custom-upload-area"
          :class="{ 'idcard-upload': props.uploadType === 'idcard' }"
          :style="uploadAreaStyle"
        >
          <!-- 上传图标/Logo占位 -->
          <div class="upload-icon">
            <svg
              viewBox="0 0 1024 1024"
              :width="props.uploadType === 'idcard' ? '24' : '32'"
              :height="props.uploadType === 'idcard' ? '24' : '32'"
            >
              <path
                d="M864 518H506c-4.4 0-8-3.6-8-8s3.6-8 8-8h358c4.4 0 8 3.6 8 8s-3.6 8-8 8z"
                fill="#dcdee0"
              />
              <path
                d="M682 342c-4.4 0-8-3.6-8-8V176c0-4.4 3.6-8 8-8s8 3.6 8 8v158c0 4.4-3.6 8-8 8z"
                fill="#dcdee0"
              />
              <path
                d="M768 426H596c-4.4 0-8-3.6-8-8s3.6-8 8-8h172c4.4 0 8 3.6 8 8s-3.6 8-8 8z"
                fill="#dcdee0"
              />
              <path
                d="M682 602c-4.4 0-8-3.6-8-8V436c0-4.4 3.6-8 8-8s8 3.6 8 8v158c0 4.4-3.6 8-8 8z"
                fill="#dcdee0"
              />
            </svg>
          </div>
          <!-- 上传文字 -->
          <div class="upload-text">
            <div class="main-text">{{ props.uploadLabel }}</div>
            <div
              v-if="
                attrs.maxCount &&
                attrs.maxCount !== Infinity &&
                props.uploadType === 'image'
              "
              class="sub-text"
            >
              最多{{ attrs.maxCount }}张
            </div>
          </div>
        </div>
      </template>

      <!-- 自定义删除图标 -->
      <template #preview-delete>
        <div class="custom-delete-icon">
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
      </template>
    </van-uploader>
  </div>
</template>

<script setup lang="ts">
  import { ref, useAttrs, computed } from 'vue';
  import { UploaderInstance, Uploader as VanUploader } from 'vant';

  // 定义props
  interface Props {
    uploadType?: 'image' | 'idcard'; // 上传类型：普通图片或证件照
    uploadLabel?: string; // 上传标签，如"身份证正面"、"身份证反面"
    previewSize?: string | number; // 预览尺寸
  }

  const props = withDefaults(defineProps<Props>(), {
    uploadType: 'image',
    uploadLabel: '上传图片',
    previewSize: 80,
  });

  // 禁用属性继承，避免重复绑定
  defineOptions({
    inheritAttrs: false,
  });

  // 获取attrs
  const attrs = useAttrs();

  // 计算上传区域的样式
  const uploadAreaStyle = computed(() => {
    const size = props.previewSize || '80px';
    const sizeValue = typeof size === 'string' ? parseFloat(size) : size;

    if (props.uploadType === 'idcard') {
      // 身份证宽高比为 1.58，根据 previewSize 动态计算高度
      const aspectRatio = 1.58;
      const height = sizeValue / aspectRatio;
      return {
        width: `${sizeValue}px`,
        height: `${height}px`,
      };
    }

    // 默认使用 preview-size 的值作为上传区域尺寸
    return {
      width: typeof size === 'string' ? size : `${size}px`,
      height: typeof size === 'string' ? size : `${size}px`,
    };
  });

  // 计算预览尺寸
  const previewStyle = computed(() => {
    const size = props.previewSize || 80;
    const sizeValue = typeof size === 'string' ? parseFloat(size) : size;
    if (props.uploadType === 'idcard') {
      // 身份证宽高比为 1.58，根据 previewSize 动态计算高度
      const aspectRatio = 1.58;
      const height = sizeValue / aspectRatio;
      return {
        width: `${sizeValue}px`,
        height: `${height}px`,
      };
    }
    return { width: size, height: size };
  });

  // 获取van-uploader实例的ref
  const uploaderRef = ref<UploaderInstance>();

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
  :deep(.van-uploader) {
    /* 上传区域样式 */
    .van-uploader__upload {
      border: none;
      border-radius: 6px;
      background-color: transparent;
      transition: all 0.3s ease;
      padding: 0;
    }

    .van-uploader__upload:hover {
      background-color: transparent;
    }

    .van-uploader__upload:active {
      background-color: transparent;
    }

    /* 预览图片样式 */
    .van-uploader__preview {
      border-radius: 6px;
      overflow: hidden;
      position: relative;
    }

    .van-uploader__preview-image {
      border-radius: 6px;
    }

    /* 证件照预览样式 */
    &.idcard-uploader .van-uploader__preview {
      border-radius: 4px;
      width: v-bind('previewStyle.width');
      height: v-bind('previewStyle.height');
    }

    &.idcard-uploader .van-uploader__preview-image {
      object-fit: cover;
      border-radius: 4px;
      width: v-bind('previewStyle.width');
      height: v-bind('previewStyle.height');
    }

    /* 删除按钮样式 */
    .van-uploader__preview-delete {
      position: absolute;
      top: 0px;
      right: 0px;
      width: 20px;
      height: 20px;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }
  }
  /* 自定义上传区域样式 */
  .custom-upload-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #dcdee0;
    border-radius: 6px;
    background-color: #fafafa;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .upload-icon {
    margin-bottom: 4px;
  }

  .upload-text {
    text-align: center;
  }

  .main-text {
    color: #969799;
    font-size: 12px;
    line-height: 1.2;
    margin-bottom: 2px;
  }

  .sub-text {
    color: #969799;
    font-size: 10px;
    line-height: 1.2;
  }

  /* 自定义删除图标样式 */
  .custom-delete-icon {
    width: 20px;
    height: 20px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .custom-delete-icon:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }

  .custom-delete-icon svg {
    width: 12px;
    height: 12px;
  }
</style>
