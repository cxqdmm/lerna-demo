<template>
  <div
    class="minimap"
    @wheel.prevent="onWheel"
  >
    <div class="toolbar">
      <a-button
        size="small"
        @click="zoomOut"
      >
        -
      </a-button>
      <a-button
        size="small"
        style="margin-left: 6px"
        @click="zoomIn"
      >
        +
      </a-button>
      <span class="zoom-label">{{ Math.round(zoomPercent) }}%</span>
    </div>
    <svg
      ref="svgRef"
      :viewBox="`0 0 ${viewBoxWidth} ${height}`"
      preserveAspectRatio="none"
      class="svg"
      :style="{ width: viewBoxWidth + 'px' }"
      @mousedown="onDown"
      @mousemove="onMove"
      @mouseup="onUp"
    >
      <defs>
        <marker
          id="axis-arrow"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path
            d="M0,0 L6,3 L0,6 Z"
            fill="#cfd8ea"
          />
        </marker>
      </defs>
      <g
        v-for="(c, ci) in chains"
        :key="ci"
        :transform="`translate(0, ${ci * rowH + 16})`"
      >
        <line
          :x1="firstCenter(ci)"
          y1="0"
          :x2="viewBoxWidth"
          y2="0"
          stroke="#cfd8ea"
          stroke-width="1"
          style="pointer-events: none"
          marker-end="url(#axis-arrow)"
        />
        <rect
          v-for="(n, ni) in c.nodes"
          :key="n.id"
          :x="layoutXs[ci][ni] - widthOf(n) / 2"
          y="-8"
          :width="widthOf(n)"
          height="16"
          :fill="fillColor(n.severity)"
          :stroke="strokeColor(n.severity)"
          stroke-width="1"
          style="cursor: pointer"
          @click="onSelect(n.id, ci)"
        >
          <title>
            {{ timeText(n.timeMs) }} · {{ n.category }} · {{ n.severity }}
          </title>
        </rect>
        <text
          v-for="(n, ni) in c.nodes"
          :key="'cat-' + n.id"
          :x="layoutXs[ci][ni]"
          y="-12"
          font-size="8"
          fill="#333"
          text-anchor="middle"
        >
          {{ categoryLetter(n.category) }}
        </text>
        <template
          v-for="bl in bottomLabels[ci]"
          :key="'bl-' + bl.id"
        >
          <text
            :x="bl.x"
            y="10"
            font-size="8"
            fill="#333"
            text-anchor="start"
            dominant-baseline="hanging"
            :transform="`rotate(65 ${bl.x} 10)`"
          >
            {{ bl.text }}
          </text>
        </template>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted } from 'vue';

  interface NodeItemLite {
    id: number;
    timeMs: number;
    category: string;
    severity: string;
  }
  interface ChainItemLite {
    nodes: NodeItemLite[];
  }

  const props = defineProps<{ chains: ChainItemLite[] }>();
  const emit = defineEmits<{
    (e: 'select-node', payload: { id: number; chainIndex: number }): void;
  }>();

  const rowH = 36;
  const viewStart = ref(0);
  const viewEnd = ref(1);
  const fullSpan = computed(() => Math.max(1, maxT.value - minT.value));
  const viewSpan = computed(() => Math.max(1, viewEnd.value - viewStart.value));
  const zoomPercent = computed(() =>
    Math.round((fullSpan.value / viewSpan.value) * 100)
  );
  onMounted(() => {
    viewStart.value = minT.value;
    viewEnd.value = maxT.value;
  });
  const allNodes = computed(() =>
    props.chains.flatMap((c, ci) => c.nodes.map((n) => ({ ...n, ci })))
  );
  const minT = computed(() => {
    const arr = allNodes.value.map((n) => n.timeMs);
    return arr.length ? Math.min(...arr) : 0;
  });
  const maxT = computed(() => {
    const arr = allNodes.value.map((n) => n.timeMs);
    return arr.length ? Math.max(...arr) : 1;
  });
  function xOf(t: number) {
    const span = viewSpan.value;
    return ((t - viewStart.value) / span) * 1000;
  }
  function tOf(x: number) {
    const span = viewSpan.value;
    const r = Math.max(0, Math.min(1000, x));
    return viewStart.value + (r / 1000) * span;
  }
  const height = computed(() => props.chains.length * rowH + 72);

  function fillColor(sev: string) {
    return sev === 'error' ? '#ff4d4f' : '#1677ff';
  }
  function strokeColor(sev: string) {
    return sev === 'error' ? '#ff4d4f' : '#1677ff';
  }
  function timeText(ms: number) {
    const d = new Date(ms);
    return `${d.toLocaleTimeString()} ${String(ms % 1000).padStart(3, '0')}ms`;
  }
  function timeShort(ms: number) {
    const d = new Date(ms);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
  function frameLabel(n: NodeItemLite) {
    const d = new Date(n.timeMs);
    const date = d.toLocaleDateString();
    return `${date} ${timeShort(n.timeMs)}`;
  }
  function categoryLetter(c: string) {
    switch (c) {
      case 'js':
        return 'J';
      case 'api':
        return 'A';
      case 'route':
        return 'R';
      case 'click':
        return 'C';
      case 'event':
        return 'E';
      default:
        return (c && c[0] ? c[0] : '?').toUpperCase();
    }
  }

  const minGapPx = 6;
  const layoutXs = computed(() => {
    return props.chains.map((c) => {
      let lastCenter = -Infinity;
      return c.nodes.map((n) => {
        const desired = xOf(n.timeMs);
        const center = Math.max(desired, lastCenter + widthOf(n) + minGapPx);
        lastCenter = center;
        return center;
      });
    });
  });
  const viewBoxWidth = computed(() => {
    const margin = 40;
    const maxRight = layoutXs.value.reduce((acc, xs) => {
      const last = xs.length ? xs[xs.length - 1] : 0;
      return Math.max(acc, last + margin);
    }, 1000);
    return Math.max(1000, Math.round(maxRight));
  });
  const bottomLabels = computed(() => {
    return props.chains.map((c, ci) => {
      return c.nodes.map((n, ni) => ({
        id: n.id,
        x: layoutXs.value[ci][ni],
        text: frameLabel(n),
      }));
    });
  });
  function widthOf(n: NodeItemLite) {
    return 8;
  }
  function firstCenter(chainIndex: number) {
    const xs = layoutXs.value[chainIndex];
    return xs && xs.length ? xs[0] : 0;
  }
  function onSelect(id: number, chainIndex: number) {
    emit('select-node', { id, chainIndex });
  }

  const svgRef = ref<SVGSVGElement | null>(null);
  const dragging = ref(false);
  const startX = ref(0);
  const startViewStart = ref(0);
  const startViewEnd = ref(0);
  function localX(e: MouseEvent) {
    const el = svgRef.value;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    return rel * 1000;
  }
  function onDown(e: MouseEvent) {
    dragging.value = true;
    const lx = localX(e);
    startX.value = lx;
    startViewStart.value = viewStart.value;
    startViewEnd.value = viewEnd.value;
  }
  function onMove(e: MouseEvent) {
    if (!dragging.value) return;
    const lx = localX(e);
    const dx = lx - startX.value;
    const delta = -(dx / 1000) * viewSpan.value;
    let newStart = startViewStart.value + delta;
    let newEnd = startViewEnd.value + delta;
    const span = newEnd - newStart;
    if (newStart < minT.value) {
      newStart = minT.value;
      newEnd = newStart + span;
    }
    if (newEnd > maxT.value) {
      newEnd = maxT.value;
      newStart = newEnd - span;
    }
    viewStart.value = newStart;
    viewEnd.value = newEnd;
  }
  function onUp(e: MouseEvent) {
    if (!dragging.value) return;
    dragging.value = false;
  }

  function zoomAround(x: number, factor: number) {
    const span = viewSpan.value;
    const center = tOf(x);
    const newSpan = Math.max(
      fullSpan.value * 0.1,
      Math.min(fullSpan.value, span * factor)
    );
    const ratioLeft = (center - viewStart.value) / span;
    let newStart = center - ratioLeft * newSpan;
    let newEnd = newStart + newSpan;
    if (newStart < minT.value) {
      const diff = minT.value - newStart;
      newStart += diff;
      newEnd += diff;
    }
    if (newEnd > maxT.value) {
      const diff = newEnd - maxT.value;
      newStart -= diff;
      newEnd -= diff;
    }
    viewStart.value = Math.max(minT.value, newStart);
    viewEnd.value = Math.min(maxT.value, newEnd);
  }
  function zoomIn() {
    zoomAround(500, 0.8);
  }
  function zoomOut() {
    zoomAround(500, 1.25);
  }
  function onWheel(e: WheelEvent) {
    const lx = localX(e as unknown as MouseEvent);
    if (e.deltaY > 0) zoomAround(lx, 1.25);
    else zoomAround(lx, 0.8);
  }

  function niceStep(ms: number) {
    const steps = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
    for (const s of steps) if (ms <= s) return s;
    return 20000;
  }
  const ticks = computed(() => {
    const span = viewSpan.value;
    if (span <= 0) return [] as { x: number; label: string }[];
    const approxCount = 10;
    const rawStep = span / approxCount;
    const step = niceStep(rawStep);
    const start = Math.ceil(viewStart.value / step) * step;
    const end = viewEnd.value;
    const list: { x: number; label: string }[] = [];
    for (let t = start; t <= end; t += step) {
      const x = xOf(t);
      const delta = t - viewStart.value;
      const label =
        delta >= 1000
          ? `${(delta / 1000).toFixed(1)} s`
          : `${Math.round(delta)} ms`;
      list.push({ x, label });
    }
    return list;
  });
</script>

<style scoped>
  .minimap {
    padding: 12px 16px 0px;
    background: #ffffff;
    border: 1px solid #eef1f6;
    border-radius: 12px;
    overflow-x: auto;
    overflow-y: visible;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  }
  .toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }
  .zoom-label {
    color: #666;
    font-size: 12px;
    margin-left: 6px;
  }
  .svg {
    width: 100%;
    display: block;
    overflow: visible;
  }
</style>
