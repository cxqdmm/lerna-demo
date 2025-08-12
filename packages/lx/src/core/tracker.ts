import { TrackerConfig, TrackEvent, Plugin } from '../types';

export class Tracker {
  private config: TrackerConfig;
  private plugins: Map<string, Plugin> = new Map();
  private eventQueue: TrackEvent[] = [];
  private timer: number | null = null;

  constructor(config: TrackerConfig = {}) {
    this.config = {
      batchSize: 10,
      flushInterval: 5000,
      enableConsole: false,
      ...config
    };
    
    this.startTimer();
  }

  // 安装插件
  use(plugin: Plugin): this {
    if (this.plugins.has(plugin.name)) {
      console.warn(`[LX Tracker] Plugin "${plugin.name}" already installed`);
      return this;
    }
    
    this.plugins.set(plugin.name, plugin);
    plugin.install(this);
    
    if (this.config.enableConsole) {
      console.log(`[LX Tracker] Plugin installed: ${plugin.name} (${this.plugins.size} total)`);
    }
    
    return this;
  }

  // 卸载插件
  unuse(pluginName: string): this {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      if (plugin.uninstall) {
        plugin.uninstall();
      }
      this.plugins.delete(pluginName);
      
      if (this.config.enableConsole) {
        console.log(`[LX Tracker] Plugin uninstalled: ${pluginName} (${this.plugins.size} remaining)`);
      }
    } else {
      if (this.config.enableConsole) {
        console.warn(`[LX Tracker] Plugin "${pluginName}" not found`);
      }
    }
    
    return this;
  }

  // 记录事件
  track(type: string, data: Record<string, any> = {}): void {
    const event: TrackEvent = {
      type,
      data,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // 添加用户和会话信息
    if (this.config.userId) {
      event.data.userId = this.config.userId;
    }
    if (this.config.sessionId) {
      event.data.sessionId = this.config.sessionId;
    }
    if (this.config.extra) {
      Object.assign(event.data, this.config.extra);
    }

    this.eventQueue.push(event);
    
    if (this.config.enableConsole) {
      const queueInfo = `${this.eventQueue.length}/${this.config.batchSize || 10}`;
      console.log(`[LX Tracker] Event tracked: ${type} (queue: ${queueInfo})`);
      console.log('Data:', event.data);
    }

    // 检查是否需要立即上报
    if (this.eventQueue.length >= (this.config.batchSize || 10)) {
      this.flush();
    }
  }

  // 立即上报所有事件
  flush(): void {
    if (this.eventQueue.length === 0) {
      if (this.config.enableConsole) {
        console.log('[LX Tracker] Queue empty, nothing to flush');
      }
      return;
    }

    const events = this.eventQueue.splice(0);
    
    if (this.config.enableConsole) {
      const eventTypes = events.map(e => e.type).join(', ');
      console.log(`[LX Tracker] Flushing ${events.length} events: [${eventTypes}]`);
    }
    
    this.send(events);
  }

  // 发送事件到服务器
  private send(events: TrackEvent[]): void {
    if (!this.config.endpoint) {
      if (this.config.enableConsole) {
        console.warn('[LX Tracker] No endpoint configured, events not sent');
      }
      return;
    }

    // 使用 sendBeacon 或 fetch 发送数据
    const data = JSON.stringify({ events });
    const dataSize = new Blob([data]).size;
    const method = navigator.sendBeacon ? 'sendBeacon' : 'fetch';
    
    if (this.config.enableConsole) {
      console.log(`[LX Tracker] Sending ${events.length} events (${dataSize}B) via ${method}`);
    }
    
    if (navigator.sendBeacon) {
      const success = navigator.sendBeacon(this.config.endpoint, data);
      if (this.config.enableConsole) {
        console.log(`[LX Tracker] Send result: ${success ? 'success' : 'failed'}`);
      }
    } else {
      fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data,
        keepalive: true
      })
      .then(response => {
        if (this.config.enableConsole) {
          console.log(`[LX Tracker] Send result: ${response.status} ${response.statusText}`);
        }
      })
      .catch(error => {
        if (this.config.enableConsole) {
          console.error('[LX Tracker] Send failed:', error);
        }
      });
    }
  }

  // 启动定时器
  private startTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    this.timer = window.setInterval(() => {
      this.flush();
    }, this.config.flushInterval || 5000);
  }

  // 销毁实例
  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    // 卸载所有插件
    this.plugins.forEach((plugin, name) => {
      this.unuse(name);
    });
    
    // 上报剩余事件
    this.flush();
  }
}