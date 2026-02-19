import { QuizQuestion, QuizOption } from '../../types';
import {
    QuizGenerator,
    DifficultyDistribution,
    QuizGeneratorRegistry,
} from '../QuizGeneratorRegistry';

/**
 * Procedural generator for basic derivative questions.
 * Generates questions like "What is the derivative of f(x) = kx^n?"
 */
class DerivativesBasicGenerator implements QuizGenerator {
    id = 'derivatives_basic';

    generate(count: number, dist?: DifficultyDistribution): QuizQuestion[] {
        const distribution = dist || { easy: 1, medium: 2, hard: 1 };
        const questions: QuizQuestion[] = [];

        // Build difficulty queue
        const diffQueue: Array<'easy' | 'medium' | 'hard'> = [];
        for (let i = 0; i < distribution.easy; i++) diffQueue.push('easy');
        for (let i = 0; i < distribution.medium; i++) diffQueue.push('medium');
        for (let i = 0; i < distribution.hard; i++) diffQueue.push('hard');

        // Fill remaining with medium
        while (diffQueue.length < count) diffQueue.push('medium');

        // Shuffle
        for (let i = diffQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [diffQueue[i], diffQueue[j]] = [diffQueue[j], diffQueue[i]];
        }

        for (let i = 0; i < count; i++) {
            const difficulty = diffQueue[i] || 'medium';
            questions.push(this.generateOne(difficulty, i));
        }

        return questions;
    }

    private generateOne(
        difficulty: 'easy' | 'medium' | 'hard',
        index: number,
    ): QuizQuestion {
        switch (difficulty) {
            case 'easy':
                return this.easyQuestion(index);
            case 'medium':
                return this.mediumQuestion(index);
            case 'hard':
                return this.hardQuestion(index);
        }
    }

    /**
     * Easy: f(x) = kx^n, find f'(x)
     */
    private easyQuestion(index: number): QuizQuestion {
        const k = this.randInt(2, 9);
        const n = this.randInt(2, 5);
        const correctCoeff = k * n;
        const correctPow = n - 1;

        const questionText = `Find the derivative of $f(x) = ${k}x^{${n}}$`;
        const correctAnswer = correctPow === 1
            ? `$${correctCoeff}x$`
            : `$${correctCoeff}x^{${correctPow}}$`;

        // Generate distractors
        const distractors = [
            // Common mistake: forget to reduce power
            correctPow === 1
                ? `$${correctCoeff}x^{${n}}$`
                : `$${correctCoeff}x^{${n}}$`,
            // Common mistake: wrong coefficient
            correctPow === 1
                ? `$${k}x$`
                : `$${k}x^{${correctPow}}$`,
            // Common mistake: just the coefficient
            `$${correctCoeff}$`,
        ];

        return this.buildQuestion(
            `deriv_easy_${index}_${Date.now()}`,
            questionText,
            correctAnswer,
            distractors,
            'easy',
            `Using the power rule: $\\frac{d}{dx}[kx^n] = knx^{n-1}$. So $${k} \\cdot ${n} \\cdot x^{${n}-1} = ${correctCoeff}x^{${correctPow}}$`,
        );
    }

    /**
     * Medium: f(x) = ax^n + bx^m
     */
    private mediumQuestion(index: number): QuizQuestion {
        const a = this.randInt(2, 7);
        const n = this.randInt(2, 4);
        const b = this.randInt(1, 6);
        const m = this.randInt(1, 3);

        // Ensure n != m
        const mActual = m === n ? m + 1 : m;

        const da = a * n;
        const dn = n - 1;
        const db = b * mActual;
        const dm = mActual - 1;

        const questionText = `Find $f'(x)$ if $f(x) = ${a}x^{${n}} + ${b}x^{${mActual}}$`;

        const formatTerm = (coeff: number, power: number): string => {
            if (power === 0) return `${coeff}`;
            if (power === 1) return `${coeff}x`;
            return `${coeff}x^{${power}}`;
        };

        const correctAnswer = `$${formatTerm(da, dn)} + ${formatTerm(db, dm)}$`;

        const distractors = [
            `$${formatTerm(da, n)} + ${formatTerm(db, mActual)}$`,
            `$${formatTerm(a, dn)} + ${formatTerm(b, dm)}$`,
            `$${formatTerm(da, dn)} + ${b}$`,
        ];

        return this.buildQuestion(
            `deriv_med_${index}_${Date.now()}`,
            questionText,
            correctAnswer,
            distractors,
            'medium',
        );
    }

    /**
     * Hard: Chain rule, e.g. f(x) = (ax + b)^n
     */
    private hardQuestion(index: number): QuizQuestion {
        const a = this.randInt(2, 5);
        const b = this.randInt(1, 9);
        const n = this.randInt(2, 4);

        const outerCoeff = n * a;
        const outerPow = n - 1;

        const questionText = `Find $f'(x)$ if $f(x) = (${a}x + ${b})^{${n}}$`;

        const formatAnswer = (coeff: number, pow: number): string => {
            if (pow === 1) return `$${coeff}(${a}x + ${b})$`;
            return `$${coeff}(${a}x + ${b})^{${pow}}$`;
        };

        const correctAnswer = formatAnswer(outerCoeff, outerPow);

        const distractors = [
            formatAnswer(n, outerPow), // Forgot inner derivative
            formatAnswer(outerCoeff, n), // Forgot to reduce power
            `$${n}(${a}x + ${b})^{${outerPow}}$`, // Forgot chain rule multiply
        ];

        return this.buildQuestion(
            `deriv_hard_${index}_${Date.now()}`,
            questionText,
            correctAnswer,
            distractors,
            'hard',
            `Chain rule: $\\frac{d}{dx}[(${a}x+${b})^{${n}}] = ${n}(${a}x+${b})^{${outerPow}} \\cdot ${a} = ${outerCoeff}(${a}x+${b})^{${outerPow}}$`,
        );
    }

    // --- Helpers ---

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

        // Shuffle options
        const allOptions = [correctOption, ...wrongOptions];
        for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
        }

        // Reassign IDs after shuffle (A, B, C, D)
        const labeled = allOptions.map((opt, i) => ({
            ...opt,
            id: String.fromCharCode(65 + i), // A, B, C, D
        }));

        const correctId = labeled.find(o => o.text === correctAnswer)!.id;

        return {
            id,
            text,
            options: labeled,
            correctOptionId: correctId,
            difficulty,
            explanation,
        };
    }
}

// Auto-register
QuizGeneratorRegistry.register(new DerivativesBasicGenerator());

export default DerivativesBasicGenerator;
