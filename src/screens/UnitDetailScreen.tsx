import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { CourseService } from '../services/CourseService';
import { Lesson } from '../types';

interface UnitDetailScreenProps {
    courseId: string;
    unitId: string;
    onLessonPress: (courseId: string, unitId: string, lessonId: string) => void;
    onQuizPress: (courseId: string, unitId: string) => void;
    onBack: () => void;
}

const UnitDetailScreen: React.FC<UnitDetailScreenProps> = ({
    courseId,
    unitId,
    onLessonPress,
    onQuizPress,
    onBack,
}) => {
    const course = CourseService.getCourse(courseId);
    const unit = CourseService.getUnit(courseId, unitId);

    if (!course || !unit) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Unit not found.</Text>
            </View>
        );
    }

    const renderLesson = ({ item, index }: { item: Lesson; index: number }) => {
        const isArticle = item.type === 'article';
        return (
            <TouchableOpacity
                style={styles.lessonCard}
                onPress={() => onLessonPress(courseId, unitId, item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.lessonLeft}>
                    <View style={[styles.playIcon, isArticle && styles.articleIcon]}>
                        <Text style={[styles.playIconText, isArticle && styles.articleIconText]}>
                            {isArticle ? '📄' : '▶'}
                        </Text>
                    </View>
                    <View style={styles.lessonInfo}>
                        <Text style={styles.lessonTitle}>{item.title}</Text>
                        <Text style={styles.lessonType}>
                            {isArticle ? 'Article · Khan Academy' : item.duration || 'Video'}
                        </Text>
                    </View>
                </View>

                {!isArticle && (
                    <View style={styles.downloadIcon}>
                        <Text style={styles.downloadIconText}>⬇</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: course.color + '30' }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>

                <Text style={styles.courseLabel}>{course.title}</Text>
                <Text style={[styles.unitTitle, { color: course.color }]}>{unit.title}</Text>
                <Text style={styles.meta}>
                    {unit.lessons.length} lessons
                    {unit.quizGeneratorId ? ' • Quiz available' : ''}
                </Text>
            </View>

            {/* Lessons */}
            {unit.lessons.length > 0 ? (
                <FlatList
                    data={unit.lessons}
                    renderItem={renderLesson}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyLessons}>
                    <Text style={styles.emptyEmoji}>📹</Text>
                    <Text style={styles.emptyText}>No videos added yet.</Text>
                    <Text style={styles.emptySubtext}>
                        Playlist links will be added by the developer.
                    </Text>
                </View>
            )}

            {/* Quiz Button */}
            {unit.quizGeneratorId && (
                <TouchableOpacity
                    style={[styles.quizBtn, { backgroundColor: course.color }]}
                    onPress={() => onQuizPress(courseId, unitId)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.quizBtnText}>🧠 Start Quiz</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0E21',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    backButton: {
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    backText: {
        color: '#6C7293',
        fontSize: 15,
        fontWeight: '600',
    },
    courseLabel: {
        fontSize: 13,
        color: '#6C7293',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    unitTitle: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    meta: {
        fontSize: 14,
        color: '#6C7293',
        marginTop: 4,
        fontWeight: '500',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    lessonCard: {
        backgroundColor: '#1D1F33',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 2,
    },
    lessonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    playIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2D2F45',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    playIconText: {
        fontSize: 12,
        color: '#3498DB',
    },
    lessonInfo: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    articleIcon: {
        backgroundColor: '#E67E2220',
    },
    articleIconText: {
        color: '#E67E22',
    },
    lessonType: {
        fontSize: 12,
        color: '#6C7293',
        marginTop: 2,
    },
    lessonDuration: {
        fontSize: 12,
        color: '#6C7293',
        marginTop: 2,
    },
    downloadIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#2D2F45',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    downloadIconText: {
        fontSize: 14,
        color: '#6C7293',
    },
    emptyLessons: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6C7293',
    },
    quizBtn: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        right: 24,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    quizBtnText: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 40,
    },
});

export default UnitDetailScreen;
