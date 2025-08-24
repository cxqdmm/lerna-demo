<template>
  <div class="demo-container">
    <h2>移动端表格组件演示</h2>

    <!-- 基础表格 -->
    <div class="demo-section">
      <h3>基础表格（支持第一列行合并）</h3>
      <div class="controls">
        <button @click="toggleLoading">切换加载状态</button>
        <button @click="toggleEmpty">切换空数据</button>
        <button @click="addData">添加数据</button>
      </div>
      <MobileTable
        :columns="columns"
        :data="currentData"
        :loading="loading"
        :empty-text="'暂无数据，请添加一些内容'"
        :mergeFirstColumn="true"
        :rowHeight="50"
        :border="true"
        :stripe="true"
      >
        <!-- 自定义计划一列 -->
        <template #计划一="{ record, text }">
          <span class="price-tag">{{ text }}</span>
        </template>
      </MobileTable>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import MobileTable from '@/components/MobileTable.vue';
  import 'vxe-table/lib/style.css';

  // Mock接口返回的数据结构
  const mockApiData = ref({
    showList: [
      {
        showTitle: '保障计划',
        items: [
          {
            showKey: '保险金额',
            values: [
              {
                skuItemName: '计划一',
                skuItemShowValue: '200万',
              },
              {
                skuItemName: '计划二',
                skuItemShowValue: '300万',
              },
            ],
          },
        ],
      },
      {
        showTitle: '住院保障',
        items: [
          {
            showKey: '住院保障',
            values: [
              {
                skuItemName: '计划一',
                skuItemShowValue:
                  '200万住院保障住院保障住院保障200万住院保障住院保障住院保障',
              },
              {
                skuItemName: '计划二',
                skuItemShowValue: '300万',
              },
            ],
          },
        ],
      },
      {
        showTitle: '优选医院赔付比例',
        items: [
          {
            showKey: '优选医院赔付比例（三类医院）',
            values: [
              {
                skuItemName: '计划一',
                skuItemShowValue: '200万',
              },
              {
                skuItemName: '计划二',
                skuItemShowValue: '300万',
              },
            ],
          },
        ],
      },
    ],
  });

  // 数据转换函数：将接口数据转换为表格所需格式
  const transformApiDataToTableData = (apiData: any) => {
    const { showList } = apiData;
    if (!showList || showList.length === 0) return { columns: [], data: [] };

    // 提取所有计划名称作为列
    const planNames = new Set<string>();
    showList.forEach((section: any) => {
      section.items?.forEach((item: any) => {
        item.values?.forEach((value: any) => {
          planNames.add(value.skuItemName);
        });
      });
    });

    // 构建列配置
    const columns = [
      {
        title: '项目',
        dataIndex: 'showKey',
        key: 'showKey',
        fixed: 'left',
        width: 200,
      },
      ...Array.from(planNames).map((planName) => ({
        title: planName,
        dataIndex: planName,
        key: planName,
        width: 150,
      })),
    ];

    // 构建表格数据
    const tableData: any[] = [];
    showList.forEach((section: any) => {
      section.items?.forEach((item: any) => {
        const row: any = {
          showKey: item.showKey,
        };

        // 为每个计划填充对应的值
        item.values?.forEach((value: any) => {
          row[value.skuItemName] = value.skuItemShowValue;
        });

        tableData.push(row);
      });
    });

    return { columns, data: tableData };
  };

  // 转换后的表格配置和数据
  const transformedResult = computed(() =>
    transformApiDataToTableData(mockApiData.value)
  );
  const columns = computed(() => transformedResult.value.columns);
  const tableData = computed(() => transformedResult.value.data);

  // 控制状态
  const loading = ref(false);
  const showEmpty = ref(false);

  // 计算当前显示的数据
  const currentData = computed(() => {
    return showEmpty.value ? [] : tableData.value;
  });

  // 控制方法
  const toggleLoading = () => {
    loading.value = !loading.value;
  };

  const toggleEmpty = () => {
    showEmpty.value = !showEmpty.value;
  };

  const addData = () => {
    // 添加新的保障项目到mock数据中
    const newItem = {
      showKey: `新增保障项目${Math.floor(Math.random() * 100)}`,
      values: [
        {
          skuItemName: '计划一',
          skuItemShowValue: `${100 + Math.floor(Math.random() * 200)}万`,
        },
        {
          skuItemName: '计划二',
          skuItemShowValue: `${200 + Math.floor(Math.random() * 200)}万`,
        },
      ],
    };

    // 添加到第一个showList项目中
    if (mockApiData.value.showList.length > 0) {
      mockApiData.value.showList[0].items.push(newItem);
    }
  };
</script>

<style scoped>
  .demo-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;

    h2 {
      color: #333;
      margin-bottom: 30px;
      text-align: center;
    }

    .demo-section {
      margin-bottom: 40px;

      h3 {
        color: #666;
        margin-bottom: 15px;
        font-size: 16px;
        border-left: 4px solid #1890ff;
        padding-left: 10px;
      }
    }

    .controls {
      margin-bottom: 15px;

      button {
        margin-right: 10px;
        padding: 8px 16px;
        background: #1890ff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;

        &:hover {
          background: #40a9ff;
        }

        &:active {
          background: #096dd9;
        }
      }
    }
  }

  :deep(.price-tag) {
    padding: 4px 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;

    &.special {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      font-size: 13px;
    }
  }

  :deep(.default-cell) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;

    .cell-content {
      font-weight: 500;
      color: #333;
      font-size: 14px;
    }

    .cell-label {
      font-size: 10px;
      color: #999;
      background: #f5f5f5;
      padding: 1px 6px;
      border-radius: 8px;
    }
  }

  @media (max-width: 768px) {
    .demo-container {
      padding: 10px;
    }

    h2 {
      font-size: 18px;
    }

    h3 {
      font-size: 14px;
    }

    .controls {
      button {
        margin-bottom: 5px;
        font-size: 12px;
        padding: 6px 12px;
      }
    }
  }
</style>
