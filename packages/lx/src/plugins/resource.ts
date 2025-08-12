import { BasePlugin } from '../core/base-plugin';
import { ResourceData } from '../types';
import { initPerfume } from 'perfume.js';

export class ResourcePlugin extends BasePlugin {
  readonly name = 'resource';
  private perfumeInstance: any = null;

  protected init(): void {
    debugger;
    if (this.tracker && (this.tracker as any).config?.enableConsole) {
      console.log('🔧 [Resource Plugin] 初始化Perfume.js资源监控插件');
    }
    this.setupPerfumeMonitoring();
    if (this.tracker && (this.tracker as any).config?.enableConsole) {
      console.log('✅ [Resource Plugin] Perfume.js资源监控插件初始化完成');
    }
  }

  protected cleanup(): void {
    // Perfume.js 会自动处理清理工作
    this.perfumeInstance = null;
    if (this.tracker && (this.tracker as any).config?.enableConsole) {
      console.log('🧹 [Resource Plugin] Perfume.js资源监控已清理');
    }
  }

  private setupPerfumeMonitoring(): void {
    try {
      debugger;
      this.perfumeInstance = initPerfume({
        // 启用导航时间监控
        navigationTiming: true,
        // 启用资源时间监控
        resourceTiming: true,
        // 启用网络信息监控
        networkInformation: true,
        // 启用存储估算
        storageEstimate: true,
        // 启用Web Vitals
        firstPaint: true,
        firstContentfulPaint: true,
        largestContentfulPaint: true,
        firstInputDelay: true,
        cumulativeLayoutShift: true,
        interactionToNextPaint: true,
        totalBlockingTime: true,
        // 数据回调
        analyticsTracker: (options: any) => {
          this.handlePerfumeData(options);
        },
        // 日志配置
        logging:
          (this.tracker && (this.tracker as any).config?.enableConsole) ||
          false,
        // 最大测量时间
        maxMeasureTime: 30000,
      });

      if (this.tracker && (this.tracker as any).config?.enableConsole) {
        console.log('✅ [Resource Plugin] Perfume.js 初始化成功');
        console.log(
          '📊 [Resource Plugin] 监控指标: Resource Timing, Navigation Timing, Network Info, Web Vitals'
        );
      }
    } catch (error) {
      if (this.tracker && (this.tracker as any).config?.enableConsole) {
        console.error('❌ [Resource Plugin] Perfume.js 初始化失败:', error);
      }
    }
  }

  private handlePerfumeData(options: any): void {
    const {
      attribution,
      metricName,
      data,
      navigatorInformation,
      rating,
      navigationType,
    } = options;

    if (this.tracker && (this.tracker as any).config?.enableConsole) {
      console.log('📊 [Perfume.js] 性能数据:', { metricName, data, rating });
    }

    // 处理资源加载数据
    if (metricName === 'resourceTiming') {
      const resourceData: ResourceData = {
        name: data.name || 'unknown',
        type: this.getResourceType(data.name || ''),
        duration: data.duration || 0,
        size: data.transferSize || 0,
        status: this.getResourceStatus(data),
        timestamp: Date.now(),
      };

      this.tracker?.track('resource', resourceData);

      if (this.tracker && (this.tracker as any).config?.enableConsole) {
        const statusEmoji = {
          success: '✅',
          failed: '❌', 
          loading: '⏳',
          timeout: '⏰'
        }[resourceData.status] || '❓';
        
        console.log(`📦 [Resource Plugin] ${statusEmoji} 资源${resourceData.status}:`, {
          name: resourceData.name,
          type: resourceData.type,
          duration: `${resourceData.duration}ms`,
          size: resourceData.size ? `${(resourceData.size / 1024).toFixed(2)}KB` : 'unknown',
          status: resourceData.status
        });
        
        // 显示原始数据用于调试
        console.log('📋 [Resource Plugin] 原始数据:', {
          responseStatus: data.responseStatus,
          transferSize: data.transferSize,
          duration: data.duration,
          responseEnd: data.responseEnd,
          requestStart: data.requestStart,
          error: data.error,
          failed: data.failed
        });
      }
    }

    // 处理Web Vitals数据
    if (
      ['FP', 'FCP', 'LCP', 'FID', 'CLS', 'TTFB', 'INP', 'TBT'].includes(
        metricName
      )
    ) {
      const vitalData = {
        metric: metricName,
        value: data,
        rating: rating || 'unknown',
        navigatorInformation,
        timestamp: Date.now(),
      };

      this.tracker?.track('web-vitals', vitalData);
    }

    // 处理导航时间数据
    if (metricName === 'navigationTiming') {
      const navData = {
        ...data,
        navigationType,
        timestamp: Date.now(),
      };

      this.tracker?.track('navigation', navData);
    }

    // 处理网络信息
    if (metricName === 'networkInformation') {
      const networkData = {
        ...data,
        timestamp: Date.now(),
      };

      this.tracker?.track('network', networkData);
    }

    // 处理存储估算
    if (metricName === 'storageEstimate') {
      const storageData = {
        ...data,
        timestamp: Date.now(),
      };

      this.tracker?.track('storage', storageData);
    }
  }

  private getResourceStatus(data: any): 'success' | 'failed' | 'loading' | 'timeout' {
    // 优先检查明确的失败条件
    
    // 1. 检查是否有错误信息或失败标记
    if (data.error || data.failed) {
      return 'failed';
    }
    
    // 2. 检查HTTP错误状态码
    if (data.responseStatus !== undefined && data.responseStatus >= 400) {
      return 'failed';
    }
    
    // 3. 检查是否为0状态码（通常表示网络错误，如被阻止的请求）
    if (data.responseStatus === 0) {
      return 'failed';
    }
    
    // 4. 检查是否超时
    if (data.duration && data.duration > 30000) {
      return 'timeout';
    }
    
    // 5. 检查传输大小为0且有duration（可能是失败的请求）
    if (data.duration && data.duration > 0 && 
        (data.transferSize === 0 || data.transferSize === undefined) && 
        (!data.responseStatus || data.responseStatus === 0)) {
      return 'failed';
    }
    
    // 6. 检查成功条件
    if (data.responseStatus >= 200 && data.responseStatus < 300) {
      return 'success';
    }
    
    // 7. 检查是否有传输大小（有传输大小通常表示成功加载）
    if (data.transferSize !== undefined && data.transferSize > 0) {
      return 'success';
    }
    
    // 8. 检查是否有响应结束时间且状态正常
    if (data.responseEnd && data.responseEnd > 0 && data.responseStatus && data.responseStatus < 400) {
      return 'success';
    }
    
    // 9. 检查是否正在加载中（有开始时间但没有结束时间）
    if (data.requestStart && data.requestStart > 0 && (!data.responseEnd || data.responseEnd === 0)) {
      return 'loading';
    }
    
    // 10. 默认情况：如果有duration但没有明确的成功标识，可能是失败
    if (data.duration && data.duration > 0) {
      // 如果有duration但没有transferSize或responseStatus，很可能是失败
      if (!data.transferSize && !data.responseStatus) {
        return 'failed';
      }
      return 'success';
    }
    
    // 11. 最后默认为加载中
    return 'loading';
  }

  private getResourceType(url: string): string {
    if (!url) return 'other';
    
    const extension = url.split('.').pop()?.toLowerCase() || '';
    const pathname = new URL(url, window.location.href).pathname.toLowerCase();
    
    // 图片资源
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'].includes(extension)) {
      return 'image';
    }
    
    // 脚本资源
    if (['js', 'mjs'].includes(extension) || pathname.includes('.js')) {
      return 'script';
    }
    
    // 样式资源
    if (['css'].includes(extension) || pathname.includes('.css')) {
      return 'stylesheet';
    }
    
    // 字体资源
    if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(extension)) {
      return 'font';
    }
    
    // 文档资源
    if (['html', 'htm'].includes(extension)) {
      return 'document';
    }
    
    // XHR/Fetch请求
    if (pathname.includes('/api/') || pathname.includes('.json')) {
      return 'xhr';
    }
    
    return 'other';
  }
}
