import { QuizQuestion, QuizOption } from '../../types';
import {
    QuizGenerator,
    DifficultyDistribution,
    QuizGeneratorRegistry,
} from '../QuizGeneratorRegistry';

/**
 * Procedural generator for Integrals questions.
 */
class IntegralsGenerator implements QuizGenerator {
    id = 'integrals_basic';

    generate(count: number, dist?: DifficultyDistribution): QuizQuestion[] {
        const questions: QuizQuestion[] = [];
        for (let i = 0; i < count; i++) {
            questions.push(this.generateOne(i));
        }
        return questions;
    }

    private generateOne(index: number): QuizQuestion {
        // Simple power rule integration: ∫ ax^n dx
        const a = this.randInt(2, 6);
        const n = this.randInt(1, 4);

        // Ensure a is divisible by n+1 for clean integer coefficients
        const coeff = a * (n + 1);

        const questionText = `Evaluate the indefinite integral: $\\int ${coeff}x^{${n}} \\, dx$`;
        const correctAnswer = `$${a}x^{${n + 1}} + C$`;

        const distractors = [
            `$${coeff}x^{${n + 1}} + C$`, // Forgot to divide by new power
            `$${a}x^{${n}} + C$`, // Forgot to increase power
            `$${coeff * n}x^{${n - 1}} + C$`, // Differentiated instead of integrated
        ];

        return this.buildQuestion(
            `integrals_${index}_${Date.now()}`,
            questionText,
            correctAnswer,
            distractors,
            'medium',
            `Power rule for integration: $\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C$. So $\\int ${coeff}x^{${n}} \\, dx = ${coeff} \\cdot \\frac{x^{${n + 1}}}{${n + 1}} + C = ${a}x^{${n + 1}} + C$`
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

// Auto-register
QuizGeneratorRegistry.register(new IntegralsGenerator());

export default IntegralsGenerator;
