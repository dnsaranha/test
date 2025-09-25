import { MediaItem } from './mediaParser';

interface CacheEntry {
  data: MediaItem[];
  timestamp: number;
  etag?: string;
}

class MediaCache {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  set(url: string, data: MediaItem[], etag?: string): void {
    this.cache.set(url, {
      data,
      timestamp: Date.now(),
      etag
    });
  }

  get(url: string): MediaItem[] | null {
    const entry = this.cache.get(url);
    if (!entry) return null;

    // Check if cache is expired
    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(url);
      return null;
    }

    return entry.data;
  }

  getEtag(url: string): string | undefined {
    const entry = this.cache.get(url);
    return entry?.etag;
  }

  clear(): void {
    this.cache.clear();
  }

  has(url: string): boolean {
    const entry = this.cache.get(url);
    if (!entry) return false;

    // Check if cache is expired
    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(url);
      return false;
    }

    return true;
  }
}

export const mediaCache = new MediaCache();