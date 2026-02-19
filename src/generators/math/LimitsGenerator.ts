import { QuizQuestion, QuizOption } from '../../types';
import {
    QuizGenerator,
    DifficultyDistribution,
    QuizGeneratorRegistry,
} from '../QuizGeneratorRegistry';

/**
 * Procedural generator for Limits questions.
 */
class LimitsGenerator implements QuizGenerator {
    id = 'limits';

    generate(count: number, dist?: DifficultyDistribution): QuizQuestion[] {
        const questions: QuizQuestion[] = [];
        for (let i = 0; i < count; i++) {
            questions.push(this.generateOne(i));
        }
        return questions;
    }

    private generateOne(index: number): QuizQuestion {
        // Simple polynomial limits: lim x->a (c*x + k)
        const a = this.randInt(-5, 5);
        const c = this.randInt(2, 5);
        const k = this.randInt(-10, 10);

        const answer = c * a + k;

        const questionText = `Evaluate the limit: $\\lim_{x \\to ${a}} (${c}x ${k >= 0 ? '+' : ''}${k})$`;
        const correctAnswer = `$${answer}$`;

        const distractors = [
            `$${answer + this.randInt(1, 4)}$`,
            `$${answer - this.randInt(1, 4)}$`,
            `$${c * (a + 1) + k}$`, // Evaluated at a+1
        ];

        return this.buildQuestion(
            `limits_${index}_${Date.now()}`,
            questionText,
            correctAnswer,
            distractors,
            'easy',
            `Direct substitution: Substitute $x = ${a}$ into the expression: $${c}(${a}) ${k >= 0 ? '+' : ''}${k} = ${c * a} ${k >= 0 ? '+' : ''}${k} = ${answer}$`
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
QuizGeneratorRegistry.register(new LimitsGenerator());

export default LimitsGenerator;
