import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import { CourseService } from '../services/CourseService';
import { ProgressService } from '../services/ProgressService';
import { DownloadService, DownloadStatus } from '../services/DownloadService';
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
    const [, setTick] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Subscribe to both progress and download changes
    useEffect(() => {
        const unsub1 = ProgressService.subscribe(() => setTick(t => t + 1));
        const unsub2 = DownloadService.subscribe(() => setTick(t => t + 1));
        return () => { unsub1(); unsub2(); };
    }, []);

    // Fade-in on mount
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1, duration: 300, useNativeDriver: true,
        }).start();
    }, []);

    if (!course || !unit) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Unit not found.</Text>
            </View>
        );
    }

    const unitProgress = ProgressService.getUnitProgress(courseId, unitId);

    const renderLesson = ({ item, index }: { item: Lesson; index: number }) => (
        <AnimatedLessonCard
            item={item}
            index={index}
            courseId={courseId}
            unitId={unitId}
            courseColor={course.color}
            onPress={() => onLessonPress(courseId, unitId, item.id)}
        />
    );

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: course.color + '30' }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>

                <Text style={styles.courseLabel}>{course.title}</Text>
                <Text style={[styles.unitTitle, { color: course.color }]}>{unit.title}</Text>

                <View style={styles.headerMetaRow}>
                    <Text style={styles.meta}>
                        {unit.lessons.length} lessons
                        {unit.quizGeneratorId ? ' • Quiz available' : ''}
                    </Text>
                    <Text style={[styles.progressText, {
                        color: unitProgress.percent === 100 ? '#4CD964' : '#6C7293',
                    }]}>
                        {unitProgress.completed}/{unitProgress.total} done
                    </Text>
                </View>

                {/* Unit progress bar */}
                <View style={styles.headerProgressBar}>
                    <View style={[styles.headerProgressFill, {
                        width: `${unitProgress.percent}%`,
                        backgroundColor: unitProgress.percent === 100 ? '#4CD964' : course.color,
                    }]} />
                </View>
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
                    <Text style={styles.emptyText}>No lessons added yet.</Text>
                    <Text style={styles.emptySubtext}>
                        Content will be added by the developer.
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
        </Animated.View>
    );
};

/** Individual animated lesson card */
const AnimatedLessonCard = ({
    item, index, courseId, unitId, courseColor, onPress,
}: {
    item: Lesson; index: number; courseId: string; unitId: string;
    courseColor: string; onPress: () => void;
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const isArticle = item.type === 'article';
    const isComplete = ProgressService.isComplete(courseId, unitId, item.id);
    const downloadInfo = DownloadService.getStatus(item.id);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0, duration: 300, delay: index * 40, useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1, duration: 300, delay: index * 40, useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const onPressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97, tension: 100, friction: 10, useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1, tension: 100, friction: 10, useNativeDriver: true,
        }).start();
    };

    const getDownloadIcon = (): string => {
        switch (downloadInfo.status) {
            case 'downloaded': return '✅';
            case 'downloading': return '⏳';
            default: return '⬇';
        }
    };

    const getDownloadColor = (): string => {
        switch (downloadInfo.status) {
            case 'downloaded': return '#4CD964';
            case 'downloading': return '#F5A623';
            default: return '#6C7293';
        }
    };

    return (
        <Animated.View style={{
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            opacity: opacityAnim,
        }}>
            <TouchableOpacity
                style={[
                    styles.lessonCard,
                    isComplete && styles.lessonCardComplete,
                ]}
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={1}
            >
                <View style={styles.lessonLeft}>
                    {/* Completion / Type icon */}
                    <View style={[
                        styles.lessonIcon,
                        isComplete && styles.lessonIconComplete,
                        isArticle && !isComplete && styles.articleIcon,
                    ]}>
                        <Text style={[
                            styles.lessonIconText,
                            isComplete && styles.lessonIconTextComplete,
                            isArticle && !isComplete && styles.articleIconText,
                        ]}>
                            {isComplete ? '✓' : isArticle ? '📄' : '▶'}
                        </Text>
                    </View>

                    <View style={styles.lessonInfo}>
                        <Text style={[
                            styles.lessonTitle,
                            isComplete && styles.lessonTitleComplete,
                        ]} numberOfLines={2}>
                            {item.title}
                        </Text>
                        <Text style={styles.lessonType}>
                            {isArticle ? 'Article · Khan Academy' : item.duration || 'Video'}
                        </Text>
                    </View>
                </View>

                {/* Download button (only for video lessons) */}
                {!isArticle && (
                    <TouchableOpacity
                        style={[styles.downloadIcon, {
                            backgroundColor: downloadInfo.status === 'downloaded' ? '#4CD96415' : '#2D2F45',
                        }]}
                        onPress={(e) => {
                            e.stopPropagation();
                            DownloadService.toggle(item.id);
                        }}
                        activeOpacity={0.6}
                    >
                        <Text style={[styles.downloadIconText, { color: getDownloadColor() }]}>
                            {getDownloadIcon()}
                        </Text>
                        {/* Download progress ring */}
                        {downloadInfo.status === 'downloading' && (
                            <View style={styles.downloadProgressRing}>
                                <View style={[styles.downloadProgressFill, {
                                    width: `${downloadInfo.progress}%`,
                                }]} />
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        </Animated.View>
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
    headerMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    meta: {
        fontSize: 14,
        color: '#6C7293',
        fontWeight: '500',
    },
    progressText: {
        fontSize: 13,
        fontWeight: '700',
    },
    headerProgressBar: {
        height: 4,
        backgroundColor: '#1D1F33',
        borderRadius: 2,
        marginTop: 12,
        overflow: 'hidden',
    },
    headerProgressFill: {
        height: '100%',
        borderRadius: 2,
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
    lessonCardComplete: {
        borderLeftWidth: 3,
        borderLeftColor: '#4CD964',
    },
    lessonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    lessonIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2D2F45',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    lessonIconComplete: {
        backgroundColor: '#4CD96420',
    },
    lessonIconText: {
        fontSize: 12,
        color: '#3498DB',
    },
    lessonIconTextComplete: {
        fontSize: 14,
        color: '#4CD964',
        fontWeight: '800',
    },
    articleIcon: {
        backgroundColor: '#E67E2220',
    },
    articleIconText: {
        color: '#E67E22',
    },
    lessonInfo: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    lessonTitleComplete: {
        color: '#B0B8D0',
    },
    lessonType: {
        fontSize: 12,
        color: '#6C7293',
        marginTop: 2,
    },
    downloadIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        position: 'relative',
        overflow: 'hidden',
    },
    downloadIconText: {
        fontSize: 14,
    },
    downloadProgressRing: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#2D2F45',
        borderRadius: 2,
    },
    downloadProgressFill: {
        height: '100%',
        backgroundColor: '#F5A623',
        borderRadius: 2,
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
