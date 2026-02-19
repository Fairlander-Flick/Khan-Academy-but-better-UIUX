import AsyncStorage from '@react-native-async-storage/async-storage';
import { CourseService } from './CourseService';

const STORAGE_KEY = '@progress';

export type LessonProgress = {
    completed: boolean;
    completedAt?: number; // timestamp
};

export type ProgressStats = {
    completed: number;
    total: number;
    percent: number; // 0-100
};

/**
 * ProgressService — tracks lesson completion with AsyncStorage persistence.
 * Uses an in-memory cache for fast reads + async write-through to storage.
 */
class ProgressServiceClass {
    private cache: Record<string, LessonProgress> = {};
    private loaded = false;
    private listeners: Set<() => void> = new Set();

    /** Load progress from AsyncStorage. Call once on app start. */
    async init(): Promise<void> {
        if (this.loaded) return;
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            if (raw) {
                this.cache = JSON.parse(raw);
            }
        } catch (e) {
            console.warn('ProgressService: failed to load', e);
        }
        this.loaded = true;
    }

    /** Subscribe to progress changes */
    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify(): void {
        this.listeners.forEach(fn => fn());
    }

    private makeKey(courseId: string, unitId: string, lessonId: string): string {
        return `${courseId}::${unitId}::${lessonId}`;
    }

    private async persist(): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
        } catch (e) {
            console.warn('ProgressService: failed to save', e);
        }
    }

    /** Mark a lesson as complete */
    async markComplete(courseId: string, unitId: string, lessonId: string): Promise<void> {
        const key = this.makeKey(courseId, unitId, lessonId);
        this.cache[key] = { completed: true, completedAt: Date.now() };
        this.notify();
        await this.persist();
    }

    /** Mark a lesson as incomplete */
    async markIncomplete(courseId: string, unitId: string, lessonId: string): Promise<void> {
        const key = this.makeKey(courseId, unitId, lessonId);
        delete this.cache[key];
        this.notify();
        await this.persist();
    }

    /** Toggle lesson completion */
    async toggle(courseId: string, unitId: string, lessonId: string): Promise<boolean> {
        const key = this.makeKey(courseId, unitId, lessonId);
        const isComplete = !!this.cache[key]?.completed;
        if (isComplete) {
            await this.markIncomplete(courseId, unitId, lessonId);
        } else {
            await this.markComplete(courseId, unitId, lessonId);
        }
        return !isComplete;
    }

    /** Check if a lesson is complete */
    isComplete(courseId: string, unitId: string, lessonId: string): boolean {
        const key = this.makeKey(courseId, unitId, lessonId);
        return !!this.cache[key]?.completed;
    }

    /** Get progress stats for a unit */
    getUnitProgress(courseId: string, unitId: string): ProgressStats {
        const unit = CourseService.getUnit(courseId, unitId);
        if (!unit) return { completed: 0, total: 0, percent: 0 };

        const total = unit.lessons.length;
        let completed = 0;
        for (const lesson of unit.lessons) {
            if (this.isComplete(courseId, unitId, lesson.id)) {
                completed++;
            }
        }
        return {
            completed,
            total,
            percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    }

    /** Get progress stats for an entire course */
    getCourseProgress(courseId: string): ProgressStats {
        const course = CourseService.getCourse(courseId);
        if (!course) return { completed: 0, total: 0, percent: 0 };

        let completed = 0;
        let total = 0;
        for (const unit of course.units) {
            for (const lesson of unit.lessons) {
                total++;
                if (this.isComplete(courseId, unit.id, lesson.id)) {
                    completed++;
                }
            }
        }
        return {
            completed,
            total,
            percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    }

    /** Get total progress across all courses */
    getTotalProgress(): ProgressStats {
        const courses = CourseService.getAllCourses();
        let completed = 0;
        let total = 0;
        for (const course of courses) {
            const stats = this.getCourseProgress(course.id);
            completed += stats.completed;
            total += stats.total;
        }
        return {
            completed,
            total,
            percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    }
}

export const ProgressService = new ProgressServiceClass();
