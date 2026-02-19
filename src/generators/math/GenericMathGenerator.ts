import { QuizQuestion, QuizOption } from '../../types';
import {
    QuizGenerator,
    DifficultyDistribution,
    QuizGeneratorRegistry,
} from '../QuizGeneratorRegistry';

/**
 * Generic generator that can register for multiple IDs.
 * Provides basic arithmetic/algebra questions as a fallback for 
 * unimplemented topics, preventing "No generator found" errors.
 */
class GenericMathGenerator implements QuizGenerator {
    id: string;
    topicName: string;

    constructor(id: string, topicName: string = 'Math') {
        this.id = id;
        this.topicName = topicName;
    }

    generate(count: number, dist?: DifficultyDistribution): QuizQuestion[] {
        const questions: QuizQuestion[] = [];
        for (let i = 0; i < count; i++) {
            questions.push(this.generateOne(i));
        }
        return questions;
    }

    private generateOne(index: number): QuizQuestion {
        // Simple algebra fallback: solve for x: ax + b = c
        const x = this.randInt(-10, 10);
        const a = this.randInt(2, 9);
        const b = this.randInt(-20, 20);
        const c = a * x + b;

        const questionText = `Solve for $x$: $${a}x ${b >= 0 ? '+' : ''}${b} = ${c}$`;
        const correctAnswer = `$x = ${x}$`;

        const distractors = [
            `$x = ${x + 1}$`,
            `$x = ${x - 1}$`,
            `$x = ${-x}$`,
        ];

        return this.buildQuestion(
            `${this.id}_${index}_${Date.now()}`,
            questionText,
            correctAnswer,
            distractors,
            'medium',
            `Subtract ${b} from both sides: $${a}x = ${c - b}$. Then divide by ${a}: $x = ${x}$.`
        );
    }

    private randInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private buildQuestion(
        id: string,
        text: string,
        correctAnswer: string,
        distractors: string[],
        difficulty: 'easy' | 'medium' | 'hard',
        explanation?: string,
    ): QuizQuestion {
        const correctOption: QuizOption = { id: 'correct', text: correctAnswer };
        const wrongOptions: QuizOption[] = distractors.map((d, i) => ({
            id: `wrong_${i}`,
            text: d,
        }));

        const allOptions = [correctOption, ...wrongOptions].sort(() => Math.random() - 0.5);

        const labeled = allOptions.map((opt, i) => ({
            ...opt,
            id: String.fromCharCode(65 + i),
        }));

        const correctId = labeled.find(o => o.text === correctAnswer)!.id;

        return {
            id, text, options: labeled, correctOptionId: correctId, difficulty, explanation
        };
    }
}

// Register for all missing topics from the manifest
// This ensures every unit has *some* working quiz
const missingTopics = [
    'statistics',
    'mechanics',
    'modern_physics',
    'waves',
    'thermodynamics',
    'electricity',
    'geometric_optics'
];

missingTopics.forEach(id => {
    QuizGeneratorRegistry.register(new GenericMathGenerator(id, id));
});

export default GenericMathGenerator;
