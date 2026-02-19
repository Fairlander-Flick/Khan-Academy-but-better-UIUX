import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import QuizEngine from '../services/QuizEngine';
import { CourseService } from '../services/CourseService';
import { QuizSession, QuizResult } from '../types';

interface QuizScreenProps {
    courseId: string;
    unitId: string;
    isGrandQuiz?: boolean;
    onBack: () => void;
    onComplete: (result: QuizResult) => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({
    courseId,
    unitId,
    isGrandQuiz = false,
    onBack,
    onComplete,
}) => {
    const [session, setSession] = useState<QuizSession | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    const unit = CourseService.getUnit(courseId, unitId);
    const course = CourseService.getCourse(courseId);

    useEffect(() => {
        if (unit?.quizGeneratorId) {
            const newSession = QuizEngine.createSession(
                courseId,
                unitId,
                unit.quizGeneratorId,
                isGrandQuiz,
            );
            setSession(newSession);
        }
    }, [courseId, unitId, unit, isGrandQuiz]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, [session?.currentIndex, fadeAnim]);

    const handleOptionSelect = useCallback((optionId: string) => {
        if (showFeedback || !session) return;
        setSelectedOption(optionId);
    }, [showFeedback, session]);

    const handleSubmit = useCallback(() => {
        if (!selectedOption || !session) return;

        setShowFeedback(true);

        // Auto-advance after feedback delay
        setTimeout(() => {
            const updated = QuizEngine.submitAnswer(session, selectedOption);
            const state = QuizEngine.checkQuizState(updated);

            if (state === 'bonus_needed') {
                const withBonus = QuizEngine.addBonusQuestion(updated);
                setSession(withBonus);
            } else if (state === 'complete') {
                const result = QuizEngine.calculateResult(updated);
                onComplete(result);
                return;
            } else {
                setSession(updated);
            }

            setSelectedOption(null);
            setShowFeedback(false);
            fadeAnim.setValue(0);
        }, 1500);
    }, [selectedOption, session, onComplete, fadeAnim]);

    if (!session || session.questions.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>🚧</Text>
                    <Text style={styles.emptyTitle}>Quiz Not Available Yet</Text>
                    <Text style={styles.emptySubtext}>
                        No question generator found for this unit.
                    </Text>
                    <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                        <Text style={styles.backBtnText}>← Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const currentQ = session.questions[session.currentIndex];
    if (!currentQ) {
        const result = QuizEngine.calculateResult(session);
        onComplete(result);
        return null;
    }

    const isCorrect = selectedOption === currentQ.correctOptionId;
    const isBonusQuestion = session.bonusTriggered &&
        session.currentIndex === session.questions.length - 1;

    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>

                <View style={styles.progressContainer}>
                    {session.questions.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.progressDot,
                                i < session.currentIndex && styles.progressDone,
                                i === session.currentIndex && styles.progressActive,
                                session.answers[i]?.correct === false && styles.progressWrong,
                            ]}
                        />
                    ))}
                </View>

                <Text style={styles.questionCount}>
                    {session.currentIndex + 1}/{session.questions.length}
                </Text>
            </View>

            {/* Bonus Badge */}
            {isBonusQuestion && (
                <View style={styles.bonusBadge}>
                    <Text style={styles.bonusBadgeText}>⭐ BONUS QUESTION</Text>
                </View>
            )}

            {/* Question */}
            <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
                <Text style={styles.difficultyBadge}>
                    {currentQ.difficulty === 'easy' ? '🟢 Easy' :
                        currentQ.difficulty === 'medium' ? '🟡 Medium' : '🔴 Hard'}
                </Text>
                <Text style={styles.questionText}>{currentQ.text}</Text>
            </Animated.View>

            {/* Options */}
            <View style={styles.optionsContainer}>
                {currentQ.options.map(option => {
                    const isSelected = selectedOption === option.id;
                    const isCorrectOption = option.id === currentQ.correctOptionId;

                    let optionStyle = styles.option;
                    let textColor = '#FFFFFF';

                    if (showFeedback) {
                        if (isCorrectOption) {
                            optionStyle = { ...styles.option, ...styles.optionCorrect };
                            textColor = '#2ECC71';
                        } else if (isSelected && !isCorrectOption) {
                            optionStyle = { ...styles.option, ...styles.optionWrong };
                            textColor = '#E74C3C';
                        }
                    } else if (isSelected) {
                        optionStyle = { ...styles.option, ...styles.optionSelected };
                        textColor = '#FFFFFF';
                    }

                    return (
                        <TouchableOpacity
                            key={option.id}
                            style={[optionStyle]}
                            onPress={() => handleOptionSelect(option.id)}
                            disabled={showFeedback}
                            activeOpacity={0.7}
                        >
                            <View style={styles.optionLetter}>
                                <Text style={[styles.optionLetterText, { color: textColor }]}>
                                    {option.id}
                                </Text>
                            </View>
                            <Text style={[styles.optionText, { color: textColor }]}>
                                {option.text}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Feedback */}
            {showFeedback && (
                <View style={[styles.feedbackBar, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
                    <Text style={styles.feedbackText}>
                        {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                    </Text>
                    {!isCorrect && currentQ.explanation && (
                        <Text style={styles.feedbackExplanation}>{currentQ.explanation}</Text>
                    )}
                </View>
            )}

            {/* Submit Button */}
            {!showFeedback && (
                <TouchableOpacity
                    style={[styles.submitBtn, !selectedOption && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={!selectedOption}
                >
                    <Text style={styles.submitBtnText}>Check Answer</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0E21',
        padding: 20,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    closeText: {
        color: '#6C7293',
        fontSize: 22,
        fontWeight: '300',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#2D2F45',
    },
    progressDone: {
        backgroundColor: '#2ECC71',
    },
    progressActive: {
        backgroundColor: '#3498DB',
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    progressWrong: {
        backgroundColor: '#E74C3C',
    },
    questionCount: {
        color: '#6C7293',
        fontSize: 14,
        fontWeight: '600',
    },
    bonusBadge: {
        backgroundColor: '#F39C12' + '20',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'center',
        marginBottom: 16,
    },
    bonusBadgeText: {
        color: '#F39C12',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    },
    questionContainer: {
        marginBottom: 32,
    },
    difficultyBadge: {
        fontSize: 13,
        color: '#6C7293',
        marginBottom: 12,
        fontWeight: '600',
    },
    questionText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: 28,
    },
    optionsContainer: {
        gap: 12,
    },
    option: {
        backgroundColor: '#1D1F33',
        borderRadius: 14,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionSelected: {
        borderColor: '#3498DB',
        backgroundColor: '#1D1F33',
    },
    optionCorrect: {
        borderColor: '#2ECC71',
        backgroundColor: '#2ECC71' + '10',
    },
    optionWrong: {
        borderColor: '#E74C3C',
        backgroundColor: '#E74C3C' + '10',
    },
    optionLetter: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#2D2F45',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    optionLetterText: {
        fontSize: 15,
        fontWeight: '800',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    feedbackBar: {
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
    },
    feedbackCorrect: {
        backgroundColor: '#2ECC71' + '15',
    },
    feedbackWrong: {
        backgroundColor: '#E74C3C' + '15',
    },
    feedbackText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    feedbackExplanation: {
        fontSize: 13,
        color: '#AEB6BF',
        marginTop: 6,
        lineHeight: 18,
    },
    submitBtn: {
        marginTop: 24,
        backgroundColor: '#3498DB',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitBtnDisabled: {
        backgroundColor: '#2D2F45',
    },
    submitBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6C7293',
        marginBottom: 24,
    },
    backBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        backgroundColor: '#1D1F33',
    },
    backBtnText: {
        color: '#6C7293',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default QuizScreen;
