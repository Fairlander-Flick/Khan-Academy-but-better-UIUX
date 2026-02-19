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
    'advanced_regression',
    'analyzing_functions',
    'anova',
    'bivariate_data',
    'categorical_data',
    'chi_square',
    'circuits',
    'confidence_intervals',
    'counting_combinatorics',
    'derivatives_advanced',
    'derivatives_applications',
    'diff_eq_first_order',
    'diff_eq_second_order',
    'dynamics',
    'eigenvalues',
    'electrostatics',
    'energy_work',
    'fluids',
    'geometric_optics',
    'hypothesis_testing',
    'ic_diff_eq',
    'ic_parametric_polar',
    'integrals_applications',
    'kinematics',
    'laplace_transforms',
    'magnetism',
    'matrix_transforms',
    'modeling_distributions',
    'modern_physics',
    'momentum',
    'multiple_integrals',
    'multivariable_applications',
    'multivariable_intro',
    'oscillations',
    'parametric_polar_vectors',
    'partial_derivatives',
    'physics1_review',
    'probability',
    'quantitative_display',
    'random_variables',
    'rotational_energy',
    'sampling_distributions',
    'series',
    'study_design',
    'summarizing_data',
    'thermodynamics',
    'torque_rotation',
    'two_sample_inference',
    'vector_calculus',
    'vectors_spaces',
    'waves_sound'
];

missingTopics.forEach(id => {
    QuizGeneratorRegistry.register(new GenericMathGenerator(id, id));
});

export default GenericMathGenerator;
