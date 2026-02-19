import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    useWindowDimensions,
    Animated,
} from 'react-native';
import { CourseService } from '../services/CourseService';
import { ProgressService, ProgressStats } from '../services/ProgressService';
import { Course } from '../types';

interface HomeScreenProps {
    onCoursePress: (courseId: string) => void;
}

/** Animated circular progress ring */
const ProgressRing = ({ percent, color, size = 44 }: { percent: number; color: string; size?: number }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(animatedValue, {
            toValue: percent,
            tension: 40,
            friction: 8,
            useNativeDriver: false,
        }).start();
    }, [percent]);

    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            {/* Background ring */}
            <View style={{
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: color + '15',
            }} />
            {/* Progress fill (simplified arc using border) */}
            <View style={{
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: color,
                borderRightColor: 'transparent',
                borderBottomColor: percent > 50 ? color : 'transparent',
                borderLeftColor: percent > 75 ? color : 'transparent',
                transform: [{ rotate: '-45deg' }],
                opacity: percent > 0 ? 1 : 0,
            }} />
            {/* Center text */}
            <Text style={{ fontSize: 11, fontWeight: '800', color: color }}>
                {percent}%
            </Text>
        </View>
    );
};

const HomeScreen: React.FC<HomeScreenProps> = ({ onCoursePress }) => {
    const courses = CourseService.getAllCourses();
    const { width } = useWindowDimensions();
    const [, setTick] = useState(0); // Force re-render on progress change
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Subscribe to progress changes
    useEffect(() => {
        const unsub = ProgressService.subscribe(() => setTick(t => t + 1));
        return unsub;
    }, []);

    // Fade-in animation on mount
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    // Tablet: 2-3 columns based on screen width
    const numColumns = width > 900 ? 3 : width > 600 ? 2 : 1;
    const cardWidth = (width - 48 - (numColumns - 1) * 16) / numColumns;

    const totalProgress = ProgressService.getTotalProgress();

    const renderCourseCard = ({ item, index }: { item: Course; index: number }) => {
        const unitCount = CourseService.getUnitCount(item.id);
        const videoCount = CourseService.getVideoCount(item.id);
        const progress = ProgressService.getCourseProgress(item.id);

        return (
            <AnimatedCourseCard
                item={item}
                index={index}
                cardWidth={cardWidth}
                unitCount={unitCount}
                videoCount={videoCount}
                progress={progress}
                onPress={() => onCoursePress(item.id)}
            />
        );
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Khan Academy</Text>
                <Text style={styles.headerSubtitle}>Better UI • Offline</Text>
            </View>

            {/* Greeting + Overall Progress */}
            <View style={styles.greetingContainer}>
                <View style={styles.greetingRow}>
                    <View style={styles.greetingTextContainer}>
                        <Text style={styles.greeting}>
                            {getGreeting()}
                        </Text>
                        <Text style={styles.greetingSubtext}>
                            {totalProgress.completed > 0
                                ? `${totalProgress.completed}/${totalProgress.total} lessons completed`
                                : 'Ready to learn? Pick a course below.'}
                        </Text>
                    </View>
                    {totalProgress.completed > 0 && (
                        <View style={styles.totalProgressContainer}>
                            <ProgressRing percent={totalProgress.percent} color="#4CD964" size={52} />
                        </View>
                    )}
                </View>

                {/* Overall progress bar */}
                {totalProgress.completed > 0 && (
                    <View style={styles.overallProgressBar}>
                        <View style={[styles.overallProgressFill, {
                            width: `${totalProgress.percent}%`,
                            backgroundColor: '#4CD964',
                        }]} />
                    </View>
                )}
            </View>

            {/* Course Grid */}
            <FlatList
                data={courses}
                renderItem={renderCourseCard}
                keyExtractor={item => item.id}
                numColumns={numColumns}
                key={numColumns}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
                showsVerticalScrollIndicator={false}
            />
        </Animated.View>
    );
};

/** Individual animated course card */
const AnimatedCourseCard = ({
    item, index, cardWidth, unitCount, videoCount, progress, onPress,
}: {
    item: Course; index: number; cardWidth: number;
    unitCount: number; videoCount: number; progress: ProgressStats;
    onPress: () => void;
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const onPressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={{
            transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
            ],
            opacity: opacityAnim,
        }}>
            <TouchableOpacity
                style={[styles.card, { width: cardWidth, borderLeftColor: item.color }]}
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={1}
            >
                <View style={styles.cardTopRow}>
                    <View style={[styles.cardIconContainer, { backgroundColor: item.color + '15' }]}>
                        <Text style={[styles.cardIcon, { color: item.color }]}>
                            {getEmojiForCourse(item.id)}
                        </Text>
                    </View>
                    {progress.percent > 0 && (
                        <ProgressRing percent={progress.percent} color={item.color} size={38} />
                    )}
                </View>

                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                </Text>

                <View style={styles.cardMeta}>
                    <Text style={styles.cardMetaText}>
                        {unitCount} units • {videoCount} lessons
                    </Text>
                </View>

                {/* Progress bar */}
                {progress.percent > 0 && (
                    <View style={styles.cardProgressBar}>
                        <View style={[styles.cardProgressFill, {
                            width: `${progress.percent}%`,
                            backgroundColor: item.color,
                        }]} />
                    </View>
                )}

                <View style={[styles.cardAccent, { backgroundColor: item.color }]} />
            </TouchableOpacity>
        </Animated.View>
    );
};

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️ Good Morning';
    if (hour < 18) return '🌤️ Good Afternoon';
    return '🌙 Good Evening';
}

function getEmojiForCourse(courseId: string): string {
    const map: Record<string, string> = {
        differential_calculus: '📐',
        differential_equations: '🔀',
        integral_calculus: '∫',
        linear_algebra: '🔢',
        multivariable_calculus: '📊',
        statistics_probability: '🎲',
        ap_physics_1: '🚀',
        ap_physics_2: '⚡',
    };
    return map[courseId] || '📚';
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0E21',
    },
    header: {
        paddingTop: 16,
        paddingHorizontal: 24,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6C7293',
        marginTop: 2,
        fontWeight: '500',
    },
    greetingContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    greetingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    greetingTextContainer: {
        flex: 1,
    },
    greeting: {
        fontSize: 22,
        fontWeight: '700',
        color: '#E8E8E8',
    },
    greetingSubtext: {
        fontSize: 14,
        color: '#6C7293',
        marginTop: 4,
    },
    totalProgressContainer: {
        marginLeft: 16,
    },
    overallProgressBar: {
        height: 4,
        backgroundColor: '#1D1F33',
        borderRadius: 2,
        marginTop: 14,
        overflow: 'hidden',
    },
    overallProgressFill: {
        height: '100%',
        borderRadius: 2,
    },
    grid: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#1D1F33',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderLeftWidth: 4,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardIcon: {
        fontSize: 24,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        lineHeight: 22,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardMetaText: {
        fontSize: 13,
        color: '#6C7293',
        fontWeight: '500',
    },
    cardProgressBar: {
        height: 3,
        backgroundColor: '#2D2F45',
        borderRadius: 2,
        marginTop: 12,
        overflow: 'hidden',
    },
    cardProgressFill: {
        height: '100%',
        borderRadius: 2,
    },
    cardAccent: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 60,
        height: 60,
        borderTopLeftRadius: 60,
        opacity: 0.06,
    },
});

export default HomeScreen;
