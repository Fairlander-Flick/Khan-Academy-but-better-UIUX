import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@downloads';

export type DownloadStatus = 'not_downloaded' | 'downloading' | 'downloaded';

export type DownloadInfo = {
    status: DownloadStatus;
    progress: number; // 0-100
    updatedAt: number;
};

/**
 * DownloadService — tracks video download status with AsyncStorage persistence.
 * Manages UI state for download buttons and indicators.
 *
 * Note: Actual file download implementation requires a backend or native module.
 * This service manages the state/UI layer.
 */
class DownloadServiceClass {
    private cache: Record<string, DownloadInfo> = {};
    private loaded = false;
    private listeners: Set<() => void> = new Set();

    async init(): Promise<void> {
        if (this.loaded) return;
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            if (raw) {
                this.cache = JSON.parse(raw);
            }
        } catch (e) {
            console.warn('DownloadService: failed to load', e);
        }
        this.loaded = true;
    }

    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify(): void {
        this.listeners.forEach(fn => fn());
    }

    private async persist(): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
        } catch (e) {
            console.warn('DownloadService: failed to save', e);
        }
    }

    /** Get download info for a lesson */
    getStatus(lessonId: string): DownloadInfo {
        return this.cache[lessonId] || {
            status: 'not_downloaded' as DownloadStatus,
            progress: 0,
            updatedAt: 0,
        };
    }

    /** Check if a lesson is downloaded */
    isDownloaded(lessonId: string): boolean {
        return this.cache[lessonId]?.status === 'downloaded';
    }

    /** Simulate starting a download (UI state only) */
    async startDownload(lessonId: string): Promise<void> {
        this.cache[lessonId] = {
            status: 'downloading',
            progress: 0,
            updatedAt: Date.now(),
        };
        this.notify();

        // Simulate download progress
        const interval = setInterval(() => {
            const info = this.cache[lessonId];
            if (!info || info.status !== 'downloading') {
                clearInterval(interval);
                return;
            }
            info.progress = Math.min(info.progress + 15 + Math.random() * 20, 100);
            this.notify();

            if (info.progress >= 100) {
                info.status = 'downloaded';
                info.updatedAt = Date.now();
                this.notify();
                this.persist();
                clearInterval(interval);
            }
        }, 400);

        await this.persist();
    }

    /** Remove a downloaded lesson */
    async removeDownload(lessonId: string): Promise<void> {
        delete this.cache[lessonId];
        this.notify();
        await this.persist();
    }

    /** Toggle download state */
    async toggle(lessonId: string): Promise<void> {
        const info = this.getStatus(lessonId);
        if (info.status === 'downloaded') {
            await this.removeDownload(lessonId);
        } else if (info.status === 'not_downloaded') {
            await this.startDownload(lessonId);
        }
        // If 'downloading', ignore (in progress)
    }

    /** Count downloaded lessons for a course */
    getDownloadedCount(courseId: string): number {
        // Count entries that start with the courseId pattern
        return Object.entries(this.cache).filter(
            ([key, info]) => key.startsWith(courseId) && info.status === 'downloaded'
        ).length;
    }
}

export const DownloadService = new DownloadServiceClass();
