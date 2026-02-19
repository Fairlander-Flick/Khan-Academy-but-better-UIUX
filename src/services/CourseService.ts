import { Course, Unit, Lesson } from '../types';
import coursesData from '../data/courses_manifest.json';

/**
 * Service that reads the courses_manifest.json and provides
 * the data to UI components. Fully data-driven / extendable.
 */
class CourseServiceClass {
    private courses: Course[] = [];

    constructor() {
        this.loadCourses();
    }

    private loadCourses(): void {
        this.courses = coursesData.courses as Course[];
    }

    /** Reload manifest (useful after hot-update of JSON) */
    reload(): void {
        this.loadCourses();
    }

    /** Get all courses */
    getAllCourses(): Course[] {
        return this.courses;
    }

    /** Get a single course by ID */
    getCourse(courseId: string): Course | undefined {
        return this.courses.find(c => c.id === courseId);
    }

    /** Get a specific unit within a course */
    getUnit(courseId: string, unitId: string): Unit | undefined {
        const course = this.getCourse(courseId);
        return course?.units.find(u => u.id === unitId);
    }

    /** Get a specific lesson */
    getLesson(courseId: string, unitId: string, lessonId: string): Lesson | undefined {
        const unit = this.getUnit(courseId, unitId);
        return unit?.lessons.find(l => l.id === lessonId);
    }

    /** Get total video count for a course */
    getVideoCount(courseId: string): number {
        const course = this.getCourse(courseId);
        if (!course) return 0;
        return course.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
    }

    /** Get total unit count for a course */
    getUnitCount(courseId: string): number {
        const course = this.getCourse(courseId);
        return course?.units.length ?? 0;
    }
}

export const CourseService = new CourseServiceClass();
