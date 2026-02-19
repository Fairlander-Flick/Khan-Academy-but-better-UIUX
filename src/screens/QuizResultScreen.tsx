import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { QuizResult } from '../types';
import { CourseService } from '../services/CourseService';

interface QuizResultScreenProps {
    courseId: string;
    unitId: string;
    result: QuizResult;
    onRetry: () => void;
    onBack: () => void;
}

const QuizResultScreen: React.FC<QuizResultScreenProps> = ({
    courseId,
    unitId,
    result,
    onRetry,
    onBack,
}) => {
    const course = CourseService.getCourse(courseId);
    const unit = CourseService.getUnit(courseId, unitId);

    const starDisplay = '⭐'.repeat(result.stars) + '☆'.repeat(3 - result.stars);

    const getMessage = (): { title: string; subtitle: string; color: string } => {
        switch (result.stars) {
            case 3:
                return {
                    title: 'Perfect! 🎉',
                    subtitle: 'You aced it! All answers correct.',
                    color: '#2ECC71',
                };
            case 2:
                return {
                    title: 'Good Job! 👍',
                    subtitle: result.bonusUsed
                        ? 'You recovered with the bonus question!'
                        : 'Almost there!',
                    color: '#F39C12',
                };
            case 1:
                return {
                    title: 'Keep Practicing 📖',
                    subtitle: 'Review the material and try again.',
                    color: '#E67E22',
                };
            default:
                return {
                    title: 'Don\'t Give Up! 💪',
                    subtitle: 'Practice makes perfect. Try again!',
                    color: '#E74C3C',
                };
        }
    };

    const message = getMessage();

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {/* Stars */}
                <Text style={styles.stars}>{starDisplay}</Text>

                {/* Message */}
                <Text style={[styles.title, { color: message.color }]}>
                    {message.title}
                </Text>
                <Text style={styles.subtitle}>{message.subtitle}</Text>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{result.correctAnswers}</Text>
                        <Text style={styles.statLabel}>Correct</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{result.totalQuestions}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{result.stars}/3</Text>
                        <Text style={styles.statLabel}>Stars</Text>
                    </View>
                </View>

                {/* Course/Unit Info */}
                <Text style={styles.courseInfo}>
                    {course?.title} › {unit?.title}
                </Text>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.btn, styles.retryBtn]}
                        onPress={onRetry}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.retryBtnText}>🔄 Try Again</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btn, styles.doneBtn]}
                        onPress={onBack}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.doneBtnText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0E21',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: '#1D1F33',
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        width: '100%',
        maxWidth: 480,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
    },
    stars: {
        fontSize: 40,
        marginBottom: 20,
        letterSpacing: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#6C7293',
        marginBottom: 32,
        textAlign: 'center',
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0A0E21',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 32,
        marginBottom: 24,
    },
    stat: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 12,
        color: '#6C7293',
        marginTop: 4,
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: '#2D2F45',
        marginHorizontal: 16,
    },
    courseInfo: {
        fontSize: 13,
        color: '#6C7293',
        marginBottom: 28,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    btn: {
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 28,
        flex: 1,
        alignItems: 'center',
    },
    retryBtn: {
        backgroundColor: '#2D2F45',
    },
    retryBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    doneBtn: {
        backgroundColor: '#3498DB',
    },
    doneBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default QuizResultScreen;
