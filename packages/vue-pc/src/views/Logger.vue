<template>
  <div class="logger-page">
    <div class="header">
      <h2 class="title">前端日志链路可视化</h2>
      <div class="actions">
        <!-- 新增 导入TXT 按钮与隐藏文件输入 -->
        <a-button
          type="primary"
          style="margin-left: 8px"
          @click="triggerTxtImport"
        >
          导入LOG文件
        </a-button>
        <input
          ref="fileInput"
          type="file"
          accept=".log"
          style="display: none"
          @change="onTxtSelected"
        />
        <a-button
          style="margin-left: 8px"
          @click="clearAll"
          danger
        >
          清空
        </a-button>
      </div>
    </div>

    <div class="filters">
      <div class="filter-left">
        <div class="group">
          <span class="group-label">类别：</span>
          <label
            class="opt"
            v-for="c in categoryOptions"
            :key="c"
          >
            <a-checkbox
              :checked="selectedCategories.includes(c)"
              @change="onCategoryChange(c, $event.target.checked)"
            />
            <a-tag
              :color="selectedCategories.includes(c) ? colorOf(c) : 'default'"
              class="clickable-tag"
              :class="{ active: selectedCategories.includes(c) }"
            >
              {{ c }}
            </a-tag>
            <span class="count">({{ counts.category[c] || 0 }})</span>
          </label>
          <a-button
            size="small"
            style="margin-left: 6px"
            @click="selectAllCategories"
          >
            全选
          </a-button>
          <a-button
            size="small"
            style="margin-left: 6px"
            @click="clearCategories"
          >
            清空
          </a-button>
        </div>
        <div class="group">
          <span class="group-label">级别：</span>
          <label
            class="opt"
            v-for="l in logtypeOptions"
            :key="l"
          >
            <a-checkbox
              :checked="selectedLogtypes.includes(l)"
              @change="onLogtypeChange(l, $event.target.checked)"
            />
            <a-tag
              :color="logtypeColor(l, selectedLogtypes.includes(l))"
              class="clickable-tag"
              :class="{ active: selectedLogtypes.includes(l) }"
            >
              {{ l }}
            </a-tag>
            <span class="count">({{ counts.logtype[l] || 0 }})</span>
          </label>
          <a-button
            size="small"
            style="margin-left: 6px"
            @click="selectAllLogtypes"
          >
            全选
          </a-button>
          <a-button
            size="small"
            style="margin-left: 6px"
            @click="clearLogtypes"
          >
            清空
          </a-button>
        </div>
      </div>
      <div class="filter-right">
        <a-switch v-model:checked="groupByRoute" />
        <span class="switch-label">按路由分段</span>
        <a-switch
          v-model:checked="onlyErrors"
          style="margin-left: 8px"
        />
        <span class="switch-label">仅错误</span>
      </div>
    </div>

    <div class="minimap-sticky">
      <LoggerMiniMap
        :chains="chains"
        @select-node="onMiniSelect"
      />
    </div>

    <div
      v-if="chains.length"
      class="chains"
    >
      <div
        v-for="(chain, ci) in chains"
        :key="ci"
        class="chain"
      >
        <div class="chain-header">
          <div class="chain-title">链路 {{ ci + 1 }} · {{ chain.summary }}</div>
          <div class="chain-meta">
            {{ chain.nodes.length }} 条 · {{ chain.durationText }}
          </div>
        </div>

        <!-- 纵向时间线（紧凑单行 + 可展开详情） -->
        <a-timeline class="timeline">
          <a-timeline-item
            v-for="(n, i) in chain.nodes"
            :key="n.id"
            :color="colorOf(n.category)"
          >
            <div
              class="log-row"
              :id="nodeDomId(n.id)"
              :class="[n.status === 'error' ? 'is-error' : '']"
              @click="toggleExpand(n.id)"
            >
              <a-tag
                :color="logtypeColor(n.severity, true)"
                class="row-sev"
              >
                {{ n.severity }}
              </a-tag>
              <span class="row-time">{{ n.timeText }}</span>
              <span class="exp-indicator">
                {{ isExpanded(n.id) ? '▾' : '▸' }}
              </span>
              <a-tag
                :color="colorOf(n.category)"
                class="row-cat"
              >
                {{ n.category }}
              </a-tag>
              <span class="row-title">{{ n.title }}</span>
              <span
                v-if="n.desc"
                class="row-desc"
              >
                {{ n.desc }}
              </span>
              <span
                v-if="n.endpoint"
                class="row-endpoint"
              >
                {{ n.endpoint }}
              </span>
              <span
                v-if="n.statusCode != null"
                class="row-status"
              >
                {{ n.statusCode }}
              </span>
              <span
                v-if="n.duration != null"
                class="row-duration"
              >
                {{ n.duration }}ms
              </span>
            </div>
            <div
              v-if="isExpanded(n.id)"
              class="row-details"
            >
              <div
                class="detail-line"
                v-if="n.url"
              >
                URL：{{ n.url }}
              </div>
              <div
                class="detail-line"
                v-if="n.endpoint"
              >
                接口：{{ n.endpoint }}
              </div>
              <div
                class="detail-line"
                v-if="n.statusCode != null"
              >
                状态：{{ n.statusCode }}
              </div>
              <div
                class="detail-line"
                v-if="n.duration != null"
              >
                耗时：{{ n.duration }}ms
              </div>
              <a-collapse ghost>
                <a-collapse-panel header="原始日志">
                  <pre class="json-view">{{ formatJson(n.raw) }}</pre>
                </a-collapse-panel>
              </a-collapse>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
    </div>

    <div
      v-else
      class="empty"
    >
      粘贴日志后点击“解析日志”，即可在此看到链路。
    </div>

    <a-drawer
      :open="activeDrawerOpen"
      :width="360"
      title="错误日志"
      @close="closeDrawer"
    >
      <div v-if="activeChainErrors.length">
        <div
          v-for="e in activeChainErrors"
          :key="e.id"
          class="err-item"
        >
          <div class="err-title">{{ e.title }} · {{ e.timeText }}</div>
          <div class="err-desc">{{ e.desc }}</div>
          <div
            v-if="e.endpoint"
            class="err-endpoint"
          >
            {{ e.endpoint }}
          </div>
          <div
            v-if="e.statusCode != null"
            class="err-status"
          >
            状态 {{ e.statusCode }}
          </div>
        </div>
      </div>
      <div v-else>无错误</div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import LoggerMiniMap from '../components/LoggerMiniMap.vue';

  interface RawLog {
    timestamp?: string | number;
    ts?: number;
    message?: string;
    category?: 'click' | 'route' | 'event' | 'js' | 'api' | string;
    data?: any;
    context?: any;
    log_type?: 'error' | 'warn' | 'info' | string;
    logtype?: 'error' | 'warn' | 'info' | string;
  }

  interface NodeItem {
    id: number;
    timeMs: number;
    timeText: string;
    category: string;
    title: string;
    desc: string;
    status: 'wait' | 'process' | 'finish' | 'error';
    severity: 'info' | 'warn' | 'error';
    url?: string;
    endpoint?: string;
    statusCode?: number;
    duration?: number;
    raw: any;
  }

  interface ChainItem {
    nodes: NodeItem[];
    summary: string;
    durationText: string;
  }

  const raw = ref('');
  const parsed = ref<RawLog[]>([]);
  const groupByRoute = ref(true);
  const onlyErrors = ref(false);
  const activeDrawerOpen = ref(false);
  const activeChainIndex = ref<number | null>(null);
  const activeNodeId = ref<number | null>(null);
  function nodeDomId(id: number) {
    return `log-node-${id}`;
  }
  function scrollToNode(id: number) {
    const el = document.getElementById(nodeDomId(id));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function onMiniSelect(payload: { id: number; chainIndex: number }) {
    activeNodeId.value = payload.id;
    activeChainIndex.value = payload.chainIndex;
    toggleExpand(payload.id);
    scrollToNode(payload.id);
    activeDrawerOpen.value = true;
  }
  function closeDrawer() {
    activeDrawerOpen.value = false;
  }
  const activeChainErrors = computed(() => {
    if (activeChainIndex.value == null) return [];
    const chain = chains.value[activeChainIndex.value];
    if (!chain) return [];
    return chain.nodes.filter((n) => n.severity === 'error');
  });

  function createMockLogs(): RawLog[] {
    const arr: RawLog[] = [];
    let ts = Date.now() - 60000;
    function add(o: any) {
      arr.push({ message: JSON.stringify(o) });
    }
    const app = 'https://app.local';
    const api = 'https://api.local';

    add({
      ts: (ts += 0),
      category: 'route',
      data: { from: '/home', to: '/list' },
      context: { url: app + '/list' },
      log_type: 'info',
    });
    add({
      ts: (ts += 200),
      category: 'click',
      data: { target: 'Filter Button' },
      context: { url: app + '/list' },
      log_type: 'info',
    });
    add({
      ts: (ts += 500),
      category: 'api',
      data: {
        method: 'GET',
        endpoint: '/api/list',
        status: 200,
        duration: 180,
      },
      context: { url: api + '/api/list' },
      log_type: 'info',
    });
    add({
      ts: (ts += 300),
      category: 'js',
      data: { message: 'TypeError: Cannot read property length of undefined' },
      context: { url: app + '/list' },
      log_type: 'error',
    });
    add({
      ts: (ts += 400),
      category: 'api',
      data: {
        method: 'GET',
        endpoint: '/api/list',
        status: 500,
        duration: 220,
      },
      context: { url: api + '/api/list' },
      log_type: 'error',
    });

    add({
      ts: (ts += 1500),
      category: 'route',
      data: { from: '/list', to: '/detail' },
      context: { url: app + '/detail' },
      log_type: 'info',
    });
    add({
      ts: (ts += 200),
      category: 'click',
      data: { target: 'ItemCard' },
      context: { url: app + '/detail' },
      log_type: 'info',
    });
    add({
      ts: (ts += 500),
      category: 'api',
      data: {
        method: 'GET',
        endpoint: '/api/detail',
        status: 200,
        duration: 140,
      },
      context: { url: api + '/api/detail' },
      log_type: 'info',
    });
    add({
      ts: (ts += 300),
      category: 'api',
      data: {
        method: 'POST',
        endpoint: '/api/cart',
        status: 500,
        duration: 320,
      },
      context: { url: api + '/api/cart' },
      log_type: 'error',
    });
    add({
      ts: (ts += 200),
      category: 'js',
      data: { message: 'ReferenceError: x is not defined' },
      context: { url: app + '/detail' },
      log_type: 'error',
    });

    add({
      ts: (ts += 2000),
      category: 'route',
      data: { from: '/login', to: '/home' },
      context: { url: app + '/home' },
      log_type: 'info',
    });
    add({
      ts: (ts += 300),
      category: 'click',
      data: { target: 'Submit' },
      context: { url: app + '/login' },
      log_type: 'info',
    });
    add({
      ts: (ts += 500),
      category: 'api',
      data: {
        method: 'POST',
        endpoint: '/api/login',
        status: 200,
        duration: 260,
      },
      context: { url: api + '/api/login' },
      log_type: 'info',
    });
    add({
      ts: (ts += 300),
      category: 'event',
      data: { message: 'deprecated storage API in use' },
      context: { url: app + '/home' },
      log_type: 'warn',
    });
    add({
      ts: (ts += 300),
      category: 'js',
      data: { message: 'Unhandled promise rejection' },
      context: { url: app + '/home' },
      log_type: 'error',
    });
    add({
      ts: (ts += 400),
      category: 'api',
      data: {
        method: 'GET',
        endpoint: '/api/home',
        status: 500,
        duration: 210,
      },
      context: { url: api + '/api/home' },
      log_type: 'error',
    });

    return arr;
  }
  parsed.value = createMockLogs();

  function parseMaybeJson(str?: string) {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }

  function titleOf(cat: string): string {
    switch (cat) {
      case 'click':
        return '点击';
      case 'route':
        return '路由';
      case 'event':
        return '事件';
      case 'js':
        return 'JS';
      case 'api':
        return '接口';
      default:
        return cat?.toUpperCase?.() || 'LOG';
    }
  }

  function mapLogType(lt?: string): 'info' | 'warn' | 'error' {
    switch (lt) {
      case 'inf':
      case 'info':
        return 'info';
      case 'warn':
        return 'warn';
      case 'err':
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  }

  function describe(cat: string, data: any): string {
    if (!data) return '';
    switch (cat) {
      case 'api': {
        const m = data.method ? data.method.toUpperCase() : '';
        const ep = data.endpoint || data.url || '';
        const st = data.status != null ? ` ${data.status}` : '';
        return `${m} ${ep}${st}`.trim();
      }
      case 'route': {
        if (data.from || data.to)
          return `${data.from || ''} -> ${data.to || ''}`.trim();
        return '';
      }
      case 'click': {
        return data.target ? `点击 ${data.target}` : '';
      }
      case 'js': {
        return data.message || '';
      }
      case 'event': {
        return data.message || '';
      }
      default:
        return '';
    }
  }

  function normalizeLogs(list: RawLog[]): NodeItem[] {
    const nodes: NodeItem[] = [];
    list.forEach((it, idx) => {
      const msgObj = parseMaybeJson(it.message);
      if (!msgObj) return; // 跳过不可解析的项

      const timeMs =
        msgObj.ts ??
        (typeof it.timestamp === 'string'
          ? Date.parse(it.timestamp)
          : (it.timestamp as number)) ??
        Date.now();
      const date = new Date(timeMs);
      const timeText = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

      const rawCat = msgObj.category;
      const category = rawCat || 'event';
      const context = msgObj.context || {};
      const data = msgObj.data || {};
      const url = context.url;
      const endpoint = data.endpoint || data.url || data.path;
      const statusCode = data.status || data.code;
      const duration = data.duration || data.cost || undefined;

      const ltRaw = msgObj.log_type ?? msgObj.logtype;
      const severity = mapLogType(ltRaw);

      const title = titleOf(category);
      const desc =
        (typeof msgObj.message === 'string' && msgObj.message) ||
        describe(category, data);

      nodes.push({
        id: idx,
        timeMs,
        timeText,
        category,
        title,
        desc,
        status:
          severity === 'error'
            ? 'error'
            : severity === 'warn'
              ? 'process'
              : 'finish',
        severity,
        url,
        endpoint,
        statusCode,
        duration,
        raw: { ...it, __parsedMessage: msgObj },
      });
    });
    return nodes.sort((a, b) => a.timeMs - b.timeMs);
  }

  function buildChains(nodes: NodeItem[]): ChainItem[] {
    if (!groupByRoute.value) {
      const durationText = nodes.length ? formatDuration(nodes) : '';
      return [{ nodes, summary: summarize(nodes), durationText }];
    }
    const chains: ChainItem[] = [];
    let current: NodeItem[] = [];
    nodes.forEach((n) => {
      if (n.category === 'route') {
        if (current.length)
          chains.push({
            nodes: current,
            summary: summarize(current),
            durationText: formatDuration(current),
          });
        current = [n];
      } else {
        current.push(n);
      }
    });
    if (current.length)
      chains.push({
        nodes: current,
        summary: summarize(current),
        durationText: formatDuration(current),
      });
    return chains;
  }

  function summarize(nodes: NodeItem[]) {
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const start = first?.timeText?.split(' ')[1] || '';
    const end = last?.timeText?.split(' ')[1] || '';
    const routeNode = nodes.find((n) => n.category === 'route');
    const routeDesc = routeNode?.desc || '';
    const url = routeNode?.url || first?.url || '';
    const parts: string[] = [];
    if (url) parts.push(url);
    if (start && end) parts.push(`${start} → ${end}`);
    if (routeDesc) parts.push(routeDesc);
    return parts.join(' · ');
  }

  function formatDuration(nodes: NodeItem[]) {
    const ms = nodes[nodes.length - 1].timeMs - nodes[0].timeMs;
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  }

  const categoryOptions = ['click', 'route', 'event', 'js', 'api'];
  const logtypeOptions = ['info', 'warn', 'error'];
  const selectedCategories = ref<string[]>([...categoryOptions]);
  const selectedLogtypes = ref<string[]>([...logtypeOptions]);

  function toggleCategory(c: string) {
    const set = new Set(selectedCategories.value);
    if (set.has(c)) set.delete(c);
    else set.add(c);
    selectedCategories.value = Array.from(set);
  }
  function toggleLogtype(l: string) {
    const set = new Set(selectedLogtypes.value);
    if (set.has(l)) set.delete(l);
    else set.add(l);
    selectedLogtypes.value = Array.from(set);
  }
  function onCategoryChange(c: string, checked: boolean) {
    const set = new Set(selectedCategories.value);
    if (checked) set.add(c);
    else set.delete(c);
    selectedCategories.value = Array.from(set);
  }
  function onLogtypeChange(l: string, checked: boolean) {
    const set = new Set(selectedLogtypes.value);
    if (checked) set.add(l);
    else set.delete(l);
    selectedLogtypes.value = Array.from(set);
  }
  function selectAllCategories() {
    selectedCategories.value = [...categoryOptions];
  }
  function clearCategories() {
    selectedCategories.value = [];
  }
  function selectAllLogtypes() {
    selectedLogtypes.value = [...logtypeOptions];
  }
  function clearLogtypes() {
    selectedLogtypes.value = [];
  }

  function logtypeColor(l: string, active: boolean) {
    if (!active) return 'default';
    switch (l) {
      case 'info':
        return 'blue';
      case 'warn':
        return 'gold';
      case 'error':
        return 'red';
      default:
        return 'default';
    }
  }

  // 统计计数（基于解析后的标准化节点）
  const baseNodes = computed(() => normalizeLogs(parsed.value));
  const counts = computed(() => {
    const cat: Record<string, number> = {};
    const lt: Record<string, number> = {};
    baseNodes.value.forEach((n) => {
      cat[n.category] = (cat[n.category] || 0) + 1;
      lt[n.severity] = (lt[n.severity] || 0) + 1;
    });
    return { category: cat, logtype: lt };
  });

  // 展开/收起：单行紧凑展示的详情状态
  const expandedIds = ref<number[]>([]);
  function isExpanded(id: number) {
    return expandedIds.value.includes(id);
  }
  function toggleExpand(id: number) {
    const i = expandedIds.value.indexOf(id);
    if (i >= 0) expandedIds.value.splice(i, 1);
    else expandedIds.value.push(id);
  }

  function filterNodes(nodes: NodeItem[]): NodeItem[] {
    return nodes.filter((n) => {
      if (!selectedCategories.value.includes(n.category)) return false;
      if (!selectedLogtypes.value.includes(n.severity)) return false;
      if (onlyErrors.value && n.severity !== 'error') return false;
      return true;
    });
  }

  // 先过滤再构建链路
  const chains = computed<ChainItem[]>(() => {
    const filtered = filterNodes(baseNodes.value);
    return buildChains(filtered);
  });

  function handleParse() {
    try {
      const arr = JSON.parse(raw.value);
      if (!Array.isArray(arr)) throw new Error('需要 JSON 数组');
      parsed.value = arr as RawLog[];
    } catch (e: any) {
      alert('解析失败：' + (e?.message || e));
    }
  }

  function clearAll() {
    raw.value = '';
    parsed.value = [];
  }

  function colorOf(cat: string) {
    switch (cat) {
      case 'click':
        return 'green';
      case 'route':
        return 'blue';
      case 'event':
        return 'purple';
      case 'js':
        return 'gold';
      case 'api':
        return 'orange';
      default:
        return 'gray';
    }
  }

  function formatJson(obj: any) {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  }

  // TXT 导入：在脚本内定义并接入现有解析流程
  const fileInput = ref<HTMLInputElement | null>(null);
  function triggerTxtImport() {
    fileInput.value?.click();
  }
  function parseTxt(text: string): { items: RawLog[]; skipped: number } {
    const trimmed = text.trim();
    // 1) 如果是完整的 JSON 数组，直接解析
    if (trimmed.startsWith('[')) {
      try {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr)) return { items: arr as RawLog[], skipped: 0 };
      } catch {}
    }
    // 2) NDJSON：按行解析；容忍行尾逗号；失败则回退为 { message: 原始行 }
    const lines = trimmed
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const items: RawLog[] = [];
    let skipped = 0;
    for (let line of lines) {
      // 去掉行尾逗号（常见于逐行对象之间以逗号分隔的导出）
      if (line.endsWith(',')) line = line.slice(0, -1).trim();
      let parsedObj: any = null;
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          parsedObj = JSON.parse(line);
        } catch {}
      }
      if (parsedObj && typeof parsedObj === 'object') {
        items.push(parsedObj as RawLog);
      } else {
        // 回退：将整行作为 message 字符串导入，后续 normalizeLogs 会尝试再解析
        items.push({ message: line } as RawLog);
      }
    }
    return { items, skipped };
  }
  function onTxtSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const { items, skipped } = parseTxt(text);
      if (!items.length) alert('未解析到有效 JSON 行，请检查 txt 内容');
      else {
        raw.value = JSON.stringify(items, null, 2);
        handleParse();
        alert(`导入成功：${items.length} 条，跳过 ${skipped} 条`);
      }
      input.value = '';
    };
    reader.readAsText(file);
  }
</script>

<style scoped>
  .logger-page {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
  .actions {
    display: flex;
    align-items: center;
  }
  .input-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .hint {
    color: #888;
    font-size: 12px;
  }
  .filters {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 10px 12px;
    background: #f7f9fc;
    border: 1px solid #eef1f6;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  }
  .filter-left {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }
  .filter-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .switch-label {
    color: #666;
    font-size: 12px;
  }
  .group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding: 6px 8px;
    background: #fff;
    border: 1px solid #eef1f6;
    border-radius: 10px;
  }
  .group-label {
    color: #444;
    font-weight: 600;
    margin-right: 4px;
  }
  .opt {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border: 1px solid #e6ebf1;
    border-radius: 16px;
    background: #fafbff;
    transition: all 0.2s ease;
    cursor: pointer;
  }
  .opt:hover {
    background: #f3f7ff;
    border-color: #cfd8ea;
  }
  .opt .count {
    font-size: 12px;
    color: #667085;
    background: #eef3ff;
    border-radius: 10px;
    padding: 0 6px;
    line-height: 18px;
  }
  .clickable-tag {
    border-radius: 12px;
    font-weight: 500;
  }
  .clickable-tag.active {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.04);
    transform: translateY(-1px);
  }
  .opt :deep(.ant-checkbox) {
    transform: scale(0.9);
    margin-right: 2px;
  }
  .opt :deep(.ant-checkbox-checked .ant-checkbox-inner) {
    background-color: #1677ff;
    border-color: #1677ff;
  }
  .opt :deep(.ant-checkbox-inner) {
    border-radius: 4px;
  }
  .group :deep(.ant-btn.ant-btn-sm) {
    height: 24px;
    padding: 0 10px;
    border-radius: 12px;
  }
  .chains {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .chain {
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 12px;
    background: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  }
  .chain-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .chain-title {
    font-weight: 600;
  }
  .chain-meta {
    color: #888;
  }
  .timeline {
    margin-top: 0;
  }
  .log-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
  }
  .log-row:hover {
    background: #fafafa;
  }
  .exp-indicator {
    color: #888;
    width: 12px;
    text-align: center;
  }
  .row-cat {
    transform: translateY(-1px);
  }
  .row-title {
    font-weight: 600;
    color: #333;
  }
  .row-desc {
    color: #555;
  }
  .row-endpoint,
  .row-status,
  .row-duration,
  .row-time {
    color: #666;
  }
  .row-sev {
    transform: translateY(-1px);
  }
  .row-details {
    margin: 4px 8px 8px 24px;
    border-left: 2px solid #f0f0f0;
    padding-left: 8px;
  }
  .detail-line {
    color: #444;
    margin: 2px 0;
  }
  .err-item {
    border-bottom: 1px solid #f0f0f0;
    padding: 8px 0;
  }
  .err-title {
    font-weight: 600;
    color: #333;
  }
  .err-desc,
  .err-endpoint,
  .err-status {
    color: #666;
    font-size: 12px;
  }
  .minimap-sticky {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #fff;
  }
</style>
