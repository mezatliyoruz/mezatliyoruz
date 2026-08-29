import { Paths, File } from 'expo-file-system';
import { Platform } from 'react-native';

export class VideoCacheManager {
  static getCacheFilename(url: string): string {
    const ext = url.split('.').pop()?.split('?')[0] || 'mp4';
    // Simple hash function for safe filename
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = (hash << 5) - hash + url.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return `cached_video_${Math.abs(hash)}.${ext}`;
  }

  static async getCachedUri(url: string): Promise<string> {
    if (Platform.OS === 'web') return url;
    
    // 1. Return immediately if it's already a local asset or file URI
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return url;
    }

    try {
      const filename = this.getCacheFilename(url);
      
      // Using new Expo v57 File class and Paths helper
      const cachedFile = new File(Paths.cache, filename);

      // 2. Check if file already exists in cache using the new boolean getter
      if (cachedFile.exists) {
        return cachedFile.uri;
      }

      // 3. Download the video to cache file using File.downloadFileAsync
      const downloadedFile = await File.downloadFileAsync(url, cachedFile, { idempotent: true });
      return downloadedFile.uri;
    } catch (err) {
      console.warn('Video cache failed, returning original URL:', err);
      return url;
    }
  }

  static async prefetchVideos(urls: string[]): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof document !== 'undefined') {
        urls.forEach((url) => {
          if (!url || typeof url !== 'string' || !url.startsWith('http')) return;
          const existing = document.querySelector(`link[href="${url}"]`);
          if (!existing) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'video';
            link.href = url;
            document.head.appendChild(link);
          }
        });
      }
      return;
    }

    // Run prefetch in background asynchronously
    urls.forEach(async (url) => {
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        try {
          const filename = this.getCacheFilename(url);
          const cachedFile = new File(Paths.cache, filename);
          if (!cachedFile.exists) {
            await File.downloadFileAsync(url, cachedFile, { idempotent: true });
          }
        } catch (err) {
          console.log('Prefetch failed for:', url);
        }
      }
    });
  }
}
