import { QuizQuestion, QuizSession, QuizResult } from '../types';
import { QuizGeneratorRegistry, DifficultyDistribution } from '../generators/QuizGeneratorRegistry';

// Auto-register generators by importing them
import '../generators/math/DerivativesGenerator';
import '../generators/math/LimitsGenerator';
import '../generators/math/IntegralsGenerator';
import '../generators/math/GenericMathGenerator';

const REGULAR_QUESTION_COUNT = 4;
const GRAND_QUIZ_QUESTION_COUNT = 20;
const DEFAULT_DISTRIBUTION: DifficultyDistribution = { easy: 1, medium: 2, hard: 1 };
const POOL_SIZE_MULTIPLIER = 5; // Generate 5x questions, show in batches

/**
 * Quiz Engine handles the 4-question + bonus flow and grand quiz logic.
 *
 * Flow:
 * 1. Generate a POOL of questions (e.g. 20 for a 4-question quiz)
 * 2. Serve 4 questions from the pool
 * 3. If user gets 1 wrong (3/4 correct) → trigger bonus question from pool
 * 4. Score: 4/4 = 3 stars, 4/5 with bonus = 2 stars, else 1 star or less
 * 5. If user retries, next 4 questions come from the remaining pool
 */
export class QuizEngine {
    private pool: QuizQuestion[] = [];
    private poolIndex: number = 0;

    createSession(
        courseId: string,
        unitId: string,
        generatorId: string,
        isGrandQuiz: boolean = false,
    ): QuizSession | null {
        const questionCount = isGrandQuiz ? GRAND_QUIZ_QUESTION_COUNT : REGULAR_QUESTION_COUNT;
        const poolSize = questionCount * POOL_SIZE_MULTIPLIER;

        // Generate the pool
        this.pool = QuizGeneratorRegistry.generateQuestions(
            generatorId,
            poolSize,
            DEFAULT_DISTRIBUTION,
        );

        if (this.pool.length === 0) {
            return null;
        }

        this.poolIndex = 0;

        // Take the first batch
        const questions = this.pool.slice(0, questionCount);
        this.poolIndex = questionCount;

        return {
            courseId,
            unitId,
            questions,
            currentIndex: 0,
            answers: [],
            bonusTriggered: false,
            stars: 0,
            isGrandQuiz,
        };
    }

    /**
     * Submit an answer for the current question.
     * Returns updated session.
     */
    submitAnswer(
        session: QuizSession,
        selectedOptionId: string,
    ): QuizSession {
        const currentQuestion = session.questions[session.currentIndex];
        if (!currentQuestion) return session;

        const correct = selectedOptionId === currentQuestion.correctOptionId;

        const updatedAnswers = [
            ...session.answers,
            {
                questionId: currentQuestion.id,
                selectedOptionId,
                correct,
            },
        ];

        return {
            ...session,
            answers: updatedAnswers,
            currentIndex: session.currentIndex + 1,
        };
    }

    /**
     * Check if bonus question should be triggered after regular questions.
     * Returns: 'complete' | 'bonus_needed' | 'continue'
     */
    checkQuizState(session: QuizSession): 'continue' | 'bonus_needed' | 'complete' {
        const regularCount = session.isGrandQuiz ? GRAND_QUIZ_QUESTION_COUNT : REGULAR_QUESTION_COUNT;

        // Still answering regular questions
        if (session.currentIndex < regularCount) {
            return 'continue';
        }

        // All regular questions answered
        if (session.currentIndex === regularCount && !session.bonusTriggered) {
            const wrongCount = session.answers.filter(a => !a.correct).length;

            if (wrongCount === 0) {
                // Perfect! No bonus needed
                return 'complete';
            } else if (wrongCount === 1) {
                // 1 wrong → bonus question
                return 'bonus_needed';
            } else {
                // 2+ wrong → no bonus, quiz complete
                return 'complete';
            }
        }

        // Bonus question was added and answered
        return 'complete';
    }

    /**
     * Add a bonus question from the pool.
     */
    addBonusQuestion(session: QuizSession): QuizSession {
        if (this.poolIndex < this.pool.length) {
            const bonusQ = this.pool[this.poolIndex];
            this.poolIndex++;

            return {
                ...session,
                questions: [...session.questions, bonusQ],
                bonusTriggered: true,
            };
        }
        return { ...session, bonusTriggered: true };
    }

    /**
     * Get next batch of questions for retry (different questions from pool).
     */
    getRetrySession(session: QuizSession): QuizSession {
        const questionCount = session.isGrandQuiz ? GRAND_QUIZ_QUESTION_COUNT : REGULAR_QUESTION_COUNT;

        // Take next batch from pool
        const start = this.poolIndex;
        const end = Math.min(start + questionCount, this.pool.length);
        const questions = this.pool.slice(start, end);
        this.poolIndex = end;

        // If pool exhausted, regenerate
        if (questions.length < questionCount) {
            // Pool exhausted, user will see repeated questions from start
            this.poolIndex = 0;
            const refreshed = this.pool.slice(0, questionCount);
            return {
                ...session,
                questions: refreshed,
                currentIndex: 0,
                answers: [],
                bonusTriggered: false,
                stars: 0,
            };
        }

        return {
            ...session,
            questions,
            currentIndex: 0,
            answers: [],
            bonusTriggered: false,
            stars: 0,
        };
    }

    /**
     * Calculate final result.
     */
    calculateResult(session: QuizSession): QuizResult {
        const totalQuestions = session.answers.length;
        const correctAnswers = session.answers.filter(a => a.correct).length;
        const regularCount = session.isGrandQuiz ? GRAND_QUIZ_QUESTION_COUNT : REGULAR_QUESTION_COUNT;
        const regularCorrect = session.answers.slice(0, regularCount).filter(a => a.correct).length;

        let stars: 0 | 1 | 2 | 3;

        if (regularCorrect === regularCount) {
            // Perfect on regular questions
            stars = 3;
        } else if (session.bonusTriggered) {
            const bonusCorrect = session.answers[regularCount]?.correct ?? false;
            if (bonusCorrect) {
                stars = 2; // Got bonus right
            } else {
                stars = 1; // Got bonus wrong
            }
        } else {
            // Multiple wrong, no bonus
            const ratio = correctAnswers / regularCount;
            stars = ratio >= 0.5 ? 1 : 0;
        }

        return {
            totalQuestions,
            correctAnswers,
            stars,
            bonusUsed: session.bonusTriggered,
        };
    }
}

export default new QuizEngine();
