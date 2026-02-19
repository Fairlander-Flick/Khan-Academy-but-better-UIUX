import { QuizQuestion, QuizOption } from '../../types';
import {
    QuizGenerator,
    DifficultyDistribution,
    QuizGeneratorRegistry,
} from '../QuizGeneratorRegistry';

/**
 * Validated Generic generator that provides highly specific questions 
 * for over 50+ diverse topics in Math, Physics, and Statistics.
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
        // --- STATISTICS & PROBABILITY ---
        if (this.id.includes('chi_square')) return this.genChiSquare(index);
        if (this.id.includes('anova')) return this.genANOVA(index);
        if (this.id.includes('regression') || this.id.includes('bivariate')) return this.genRegression(index);
        if (this.id.includes('inference') || this.id.includes('hypothesis') || this.id.includes('confidence')) return this.genInference(index);
        if (this.id.includes('probability') || this.id.includes('combinatorics') || this.id.includes('random_variables')) return this.genProbability(index);
        if (this.id.includes('study_design') || this.id.includes('data') || this.id.includes('distribution')) return this.genDescriptiveStats(index);

        // --- PHYSICS ---
        if (this.id.includes('kinematics')) return this.genKinematics(index);
        if (this.id.includes('dynamics') || this.id.includes('forces') || this.id.includes('mechanics') || this.id.includes('physics1')) return this.genDynamics(index);
        if (this.id.includes('energy') || this.id.includes('work')) return this.genEnergy(index);
        if (this.id.includes('momentum')) return this.genMomentum(index);
        if (this.id.includes('rotation') || this.id.includes('torque')) return this.genRotation(index);
        if (this.id.includes('oscillations')) return this.genOscillations(index);
        if (this.id.includes('fluid')) return this.genFluids(index);
        if (this.id.includes('thermo')) return this.genThermodynamics(index);
        if (this.id.includes('electro') || this.id.includes('magnet') || this.id.includes('circuit')) return this.genElectromagnetism(index);
        if (this.id.includes('wave') || this.id.includes('optic') || this.id.includes('sound')) return this.genWavesOptics(index);
        if (this.id.includes('modern')) return this.genModernPhysics(index);

        // --- CALCULUS & LINEAR ALGEBRA ---
        if (this.id.includes('diff_eq') || this.id.includes('laplace')) return this.genDiffEq(index);
        if (this.id.includes('multivariable') || this.id.includes('partial') || this.id.includes('vector') || this.id.includes('multiple_integrals')) return this.genMultivariable(index);
        if (this.id.includes('matrix') || this.id.includes('eigen') || this.id.includes('space')) return this.genLinearAlgebra(index);
        if (this.id.includes('series')) return this.genSeries(index);
        if (this.id.includes('parametric') || this.id.includes('polar')) return this.genParametricPolar(index);
        if (this.id.includes('derivatives')) return this.genDerivativesApp(index);
        if (this.id.includes('integrals')) return this.genIntegralsApp(index);

        // --- FALLBACK ---
        return this.genAlgebra(index);
    }

    // ==========================================
    // STATISTICS GENERATORS
    // ==========================================

    private genChiSquare(index: number): QuizQuestion {
        const rows = this.randInt(2, 4);
        const cols = this.randInt(2, 4);
        const df = (rows - 1) * (cols - 1);

        return this.buildQuestion(
            `${this.id}_${index}`,
            `For a Chi-Square test of independence with a contingency table of size $${rows} \\times ${cols}$, what are the degrees of freedom?`,
            `$${df}$`,
            [`$${rows * cols - 1}$`, `$${rows + cols - 2}$`, `$${rows * cols}$`],
            'easy',
            `Degrees of freedom $df = (r-1)(c-1) = (${rows}-1)(${cols}-1) = ${df}$.`
        );
    }

    private genANOVA(index: number): QuizQuestion {
        const k = this.randInt(3, 5); // groups
        const N = this.randInt(20, 50); // total sample
        const dfBetween = k - 1;
        const dfWithin = N - k;

        return this.buildQuestion(
            `${this.id}_${index}`,
            `In a one-way ANOVA with $k=${k}$ groups and a total sample size of $N=${N}$, what are the degrees of freedom for the error (within-groups)?`,
            `$${dfWithin}$`,
            [`$${dfBetween}$`, `$${N - 1}$`, `$${k}$`],
            'medium',
            `$df_{within} = N - k = ${N} - ${k} = ${dfWithin}$.`
        );
    }

    private genRegression(index: number): QuizQuestion {
        const r = (this.randInt(50, 95) / 100).toFixed(2);
        const r2 = (parseFloat(r) * parseFloat(r)).toFixed(3);

        return this.buildQuestion(
            `${this.id}_${index}`,
            `If the correlation coefficient is $r = ${r}$, what is the coefficient of determination $R^2$?`,
            `$${r2}$`,
            [`$${(1 - parseFloat(r2)).toFixed(3)}$`, `$${(parseFloat(r) * 2).toFixed(2)}$`, `$${Math.sqrt(parseFloat(r)).toFixed(3)}$`],
            'easy',
            `$R^2$ is simply the square of $r$: $(${r})^2 = ${r2}$.`
        );
    }

    private genInference(index: number): QuizQuestion {
        const alpha = 0.05;
        const pVal = (this.randInt(1, 40) / 1000).toFixed(3); // strictly less than 0.05

        return this.buildQuestion(
            `${this.id}_${index}`,
            `You perform a hypothesis test and calculate a p-value of $${pVal}$. Using $\\alpha = 0.05$, what is your conclusion?`,
            `Reject $H_0$.`,
            [`Fail to reject $H_0$.`, `Accept $H_0$.`, `Transform the data.`],
            'easy',
            `Since $p = ${pVal} < 0.05$, the result is statistically significant, so we reject the null hypothesis $H_0$.`
        );
    }

    private genProbability(index: number): QuizQuestion {
        const n = this.randInt(5, 10);
        const k = this.randInt(2, n - 1);

        // nCk calculation
        const fact = (num: number): number => num <= 1 ? 1 : num * fact(num - 1);
        const combinations = fact(n) / (fact(k) * fact(n - k));

        return this.buildQuestion(
            `${this.id}_${index}`,
            `How many ways can you choose $${k}$ items from a set of $${n}$ distinct items (order doesn't matter)?`,
            `$${combinations}$`,
            [`$${fact(n) / fact(n - k)}$`, `$${fact(n)}$`, `$${n * k}$`],
            'medium',
            `Use the combination formula $\\binom{n}{k} = \\frac{n!}{k!(n-k)!}$.`
        );
    }

    private genDescriptiveStats(index: number): QuizQuestion {
        const nums = [this.randInt(1, 10), this.randInt(1, 10), this.randInt(1, 10), this.randInt(1, 10), this.randInt(1, 10)].sort((a, b) => a - b);
        const med = nums[2];

        return this.buildQuestion(
            `${this.id}_${index}`,
            `Find the **median** of the dataset: $\\{${nums.join(', ')}\\}$`,
            `$${med}$`,
            [`$${med + 1}$`, `$${med - 1}$`, `$${(nums[0] + nums[4]) / 2}$`],
            'easy',
            `The median is the middle value in a sorted list: ${med}.`
        );
    }

    // ==========================================
    // PHYSICS GENERATORS
    // ==========================================

    private genKinematics(index: number): QuizQuestion {
        const v0 = this.randInt(0, 10);
        const a = this.randInt(2, 5);
        const t = this.randInt(2, 4);
        const v = v0 + a * t;

        return this.buildQuestion(
            `${this.id}_${index}`,
            `A car starts with velocity $${v0}\\text{ m/s}$ and accelerates at $${a}\\text{ m/s}^2$ for $${t}\\text{ s}$. Final velocity?`,
            `$${v}\\text{ m/s}$`,
            [`$${v0 + a}\\text{ m/s}$`, `$${a * t}\\text{ m/s}$`, `$${v + 5}\\text{ m/s}$`],
            'easy',
            `Use $v = v_0 + at = ${v0} + (${a})(${t}) = ${v}$.`
        );
    }

    private genDynamics(index: number): QuizQuestion {
        const m = this.randInt(5, 20);
        const g = 10;
        const w = m * g;

        return this.buildQuestion(
            `${this.id}_${index}`,
            `What is the weight of a $${m}\\text{ kg}$ object on Earth ($g \\approx 10\\text{ m/s}^2$)?`,
            `$${w}\\text{ N}$`,
            [`$${m}\\text{ N}$`, `$${w / 10}\\text{ N}$`, `$${w * 2}\\text{ N}$`],
            'easy',
            `Weight $W = mg = ${m} \\times 10 = ${w}\\text{ N}$.`
        );
    }

    private genEnergy(index: number): QuizQuestion {
        const m = this.randInt(2, 5);
        const v = this.randInt(2, 6);
        const ke = 0.5 * m * v * v;

        return this.buildQuestion(
            `${this.id}_${index}`,
            `Calculate the kinetic energy of a $${m}\\text{ kg}$ object moving at $${v}\\text{ m/s}$.`,
            `$${ke}\\text{ J}$`,
            [`$${m * v}\\text{ J}$`, `$${ke * 2}\\text{ J}$`, `$${0.5 * m * v}\\text{ J}$`],
            'medium',
            `$KE = \\frac{1}{2}mv^2 = 0.5 \\cdot ${m} \\cdot ${v}^2 = ${ke}\\text{ J}$.`
        );
    }

    private genMomentum(index: number): QuizQuestion {
        const m = this.randInt(2, 5);
        const v = this.randInt(3, 8);
        const p = m * v;

        return this.buildQuestion(
            `${this.id}_${index}`,
            `What is the momentum of a $${m}\\text{ kg}$ object moving at $${v}\\text{ m/s}$?`,
            `$${p}\\text{ kg m/s}$`,
            [`$${0.5 * m * v ^ 2}\\text{ kg m/s}$`, `$${v / m}\\text{ kg m/s}$`, `$${p + 10}\\text{ kg m/s}$`],
            'easy',
            `$p = mv = ${m} \\cdot ${v} = ${p}$.`
        );
    }

    private genRotation(index: number): QuizQuestion {
        const I = this.randInt(2, 5);
        const alpha = this.randInt(2, 4);
        const tau = I * alpha;

        return this.buildQuestion(
            `${this.id}_${index}`,
            `A wheel has rotational inertia $I = ${I}\\text{ kg m}^2$ and angular acceleration $\\alpha = ${alpha}\\text{ rad/s}^2$. What represents the net torque $\\tau$?`,
            `$${tau}\\text{ N m}$`,
            [`$${I / alpha}\\text{ N m}$`, `$${I + alpha}\\text{ N m}$`, `$${alpha}\\text{ N m}$`],
            'medium',
            `Newton's 2nd Law for Rotation: $\\tau = I\\alpha = ${I} \\cdot ${alpha} = ${tau}$.`
        );
    }

    private genOscillations(index: number): QuizQuestion {
        return this.buildQuestion(
            `${this.id}_${index}`,
            `For a simple harmonic oscillator, at maximum displacement, the velocity is:`,
            `Zero`,
            [`Maximum`, `Half of max`, `Undefined`],
            'easy',
            `At amplitude (max displacement), the object stops momentarily to reverse direction, so $v=0$.`
        );
    }

    private genFluids(index: number): QuizQuestion {
        return this.buildQuestion(
            `${this.id}_${index}`,
            `Bernoulli's principle states that for an incompressible fluid, as speed increases, pressure:`,
            `Decreases`,
            [`Increases`, `Remains constant`, `Fluctuates`],
            'medium',
            `Bernoulli equation: $P + \\frac{1}{2}\\rho v^2 + \\dots = \\text{constant}$. If $v$ goes up, $P$ must go down.`
        );
    }

    private genThermodynamics(index: number): QuizQuestion {
        return this.buildQuestion(
            `${this.id}_${index}`,
            `The First Law of Thermodynamics is essentially a statement of conservation of:`,
            `Energy`,
            [`Momentum`, `Mass`, `Entropy`],
            'easy',
            `$\Delta U = Q - W$. It states internal energy changes differ by heat added minus work done (Energy conservation).`
        );
    }

    private genElectromagnetism(index: number): QuizQuestion {
        const q1 = this.randInt(1, 5);
        const q2 = this.randInt(1, 5);
        const r = this.randInt(1, 3);
        const num = q1 * q2;
        const den = r * r;

        return this.buildQuestion(
            `${this.id}_${index}`,
            `Coulomb's Law force $F$ between charges $q_1=${q1}C$, $q_2=${q2}C$ at distance $r=${r}m$ is proportional to:`,
            `$${num}/${den}$`,
            [`$${num / r}$`, `$${q1 + q2}/${r}$`, `$${den}/${num}$`],
            'medium',
            `$F = k \\frac{q_1 q_2}{r^2} \\propto \\frac{${q1}\\cdot${q2}}{${r}^2} = \\frac{${num}}{${den}}$.`
        );
    }

    private genWavesOptics(index: number): QuizQuestion {
        const f = this.randInt(200, 500);
        const lambda = 2;
        const v = f * lambda;

        return this.buildQuestion(
            `${this.id}_${index}`,
            `Wave speed equation: $f = ${f}\\text{ Hz}$, $\\lambda = ${lambda}\\text{ m}$. Find velocity $v$.`,
            `$${v}\\text{ m/s}$`,
            [`$${f / lambda}\\text{ m/s}$`, `$${f + lambda}\\text{ m/s}$`, `$${lambda}\\text{ m/s}$`],
            'easy',
            `$v = f\\lambda = ${f} \\cdot ${lambda} = ${v}$.`
        );
    }

    private genModernPhysics(index: number): QuizQuestion {
        return this.buildQuestion(
            `${this.id}_${index}`,
            `According to Special Relativity, as an object's speed approaches the speed of light $c$, its relativistic mass:`,
            `Increases towards infinity`,
            [`Decreases to zero`, `Remains constant`, `Becomes negative`],
            'medium',
            `Mass increases with velocity factor $\\gamma = 1/\\sqrt{1-v^2/c^2}$. As $v \\to c$, $\\gamma \\to \\infty$.`
        );
    }

    // ==========================================
    // CALCULUS GENERATORS
    // ==========================================

    private genDiffEq(index: number): QuizQuestion {
        const k = this.randInt(2, 5);
        return this.buildQuestion(
            `${this.id}_${index}`,
            `General solution to $y'' + ${k * k}y = 0$?`,
            `$y = C_1 \\cos(${k}x) + C_2 \\sin(${k}x)$`,
            [`$y = C_1 e^{${k}x} + C_2 e^{-${k}x}$`, `$y = C_1 \\cos(${k}x)$`, `$y = \\sin(${k}x) + C$`],
            'hard',
            `Characteristic equation $r^2 + ${k * k} = 0 \\implies r = \\pm ${k}i$. Solution is oscillatory.`
        );
    }

    private genMultivariable(index: number): QuizQuestion {
        return this.buildQuestion(
            `${this.id}_${index}`,
            `Unless magnitude is zero, the gradient vector $\\nabla f(x,y)$ always points in the direction of:`,
            `Maximum increase of $f$`,
            [`Maximum decrease of $f$`, `Zero change (level curve)`, `Tangent line`],
            'medium',
            `The gradient vector points in the direction of steepest ascent.`
        );
    }

    private genLinearAlgebra(index: number): QuizQuestion {
        return this.buildQuestion(
            `${this.id}_${index}`,
            `If a matrix $A$ has determinant 0, then:`,
            `It is not invertible (singular).`,
            [`It is symmetric.`, `It has only positive eigenvalues.`, `It is the identity matrix.`],
            'medium',
            `An invertible matrix must have $\\det(A) \\neq 0$.`
        );
    }

    private genSeries(index: number): QuizQuestion {
        return this.buildQuestion(
            `${this.id}_${index}`,
            `Does the geometric series $\\sum_{n=0}^{\\infty} r^n$ converge if $|r| = 1$?`,
            `No`,
            [`Yes`, `Only if r=1`, `Only if r=-1`],
            'easy',
            `Geometric series only converges for $|r| < 1$.`
        );
    }

    private genParametricPolar(index: number): QuizQuestion {
        return this.buildQuestion(
            `${this.id}_${index}`,
            `Convert polar point $(r, \\theta) = (2, \\pi)$ to Cartesian $(x,y)$.`,
            `$(-2, 0)$`,
            [`$(2, 0)$`, `$(0, 2)$`, `$(0, -2)$`],
            'medium',
            `$x = r\\cos\\theta = 2\\cos\\pi = -2$. $y = r\\sin\\theta = 2\\sin\\pi = 0$.`
        );
    }

    private genDerivativesApp(index: number): QuizQuestion {
        return this.buildQuestion(
            `${this.id}_${index}`,
            `To find local extrema of $f(x)$, you should first solve for $x$ where:`,
            `$f'(x) = 0$ or DNE`,
            [`$f''(x) = 0$`, `$f(x) = 0$`, `$f'(x) > 0$`],
            'easy',
            `Critical points occur where the derivative is zero or undefined.`
        );
    }

    private genIntegralsApp(index: number): QuizQuestion {
        return this.buildQuestion(
            `${this.id}_${index}`,
            `The area between curves $y=f(x)$ and $y=g(x)$ from $a$ to $b$ (assume $f \\ge g$) is:`,
            `$\\int_a^b (f(x) - g(x)) \\, dx$`,
            [`$\\int_a^b f(x)g(x) \\, dx$`, `$\\int_a^b (f(x) + g(x)) \\, dx$`, `$f(b) - g(a)$`],
            'easy',
            `Area is the integral of (Upper - Lower).`
        );
    }

    private genAlgebra(index: number): QuizQuestion {
        const x = this.randInt(-5, 5);
        const a = this.randInt(2, 5);
        const b = this.randInt(1, 10);
        const res = a * x + b;

        return this.buildQuestion(
            `${this.id}_${index}`,
            `Solve: $${a}x + ${b} = ${res}$`,
            `$x = ${x}$`,
            [`$x = ${x + 1}$`, `$x = ${x - 1}$`, `$x = ${-x}$`],
            'easy',
            `Subtract ${b}, get ${a}x = ${res - b}. Divide by ${a}, x = ${x}.`
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

// Full registration from manifest
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
