import { QuizQuestion } from '../types';

/**
 * Base interface for all quiz generators.
 * Each generator can produce questions procedurally.
 */
export interface QuizGenerator {
    /** Unique ID matching quizGeneratorId in courses_manifest.json */
    id: string;
    /** Generate a set of questions with specified difficulty distribution */
    generate(count: number, difficultyDistribution?: DifficultyDistribution): QuizQuestion[];
}

export interface DifficultyDistribution {
    easy: number;   // e.g. 1
    medium: number; // e.g. 2
    hard: number;   // e.g. 1
}

const DEFAULT_DISTRIBUTION: DifficultyDistribution = {
    easy: 1,
    medium: 2,
    hard: 1,
};

/**
 * Registry pattern: all quiz generators register themselves here.
 * The quiz engine looks up the generator by ID from the course manifest.
 */
class QuizGeneratorRegistryClass {
    private generators: Map<string, QuizGenerator> = new Map();

    register(generator: QuizGenerator): void {
        this.generators.set(generator.id, generator);
    }

    get(id: string): QuizGenerator | undefined {
        return this.generators.get(id);
    }

    has(id: string): boolean {
        return this.generators.has(id);
    }

    /**
     * Generate questions for a quiz session.
     * If generator not found, returns a fallback "no questions available" state.
     */
    generateQuestions(
        generatorId: string,
        count: number = 4,
        distribution: DifficultyDistribution = DEFAULT_DISTRIBUTION,
    ): QuizQuestion[] {
        const generator = this.generators.get(generatorId);
        if (!generator) {
            console.warn(`No quiz generator found for ID: ${generatorId}`);
            return [];
        }
        return generator.generate(count, distribution);
    }

    /** Get all registered generator IDs (for debugging) */
    getRegisteredIds(): string[] {
        return Array.from(this.generators.keys());
    }
}

export const QuizGeneratorRegistry = new QuizGeneratorRegistryClass();
