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
import { ProgressService, ProgressStats } from '../services/ProgressService';
import { Unit } from '../types';

interface CourseDetailScreenProps {
    courseId: string;
    onUnitPress: (courseId: string, unitId: string) => void;
    onBack: () => void;
}

const CourseDetailScreen: React.FC<CourseDetailScreenProps> = ({
    courseId,
    onUnitPress,
    onBack,
}) => {
    const course = CourseService.getCourse(courseId);
    const [, setTick] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Subscribe to progress changes
    useEffect(() => {
        const unsub = ProgressService.subscribe(() => setTick(t => t + 1));
        return unsub;
    }, []);

    // Fade-in on mount
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
        }).start();
    }, []);

    if (!course) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Course not found.</Text>
            </View>
        );
    }

    const courseProgress = ProgressService.getCourseProgress(courseId);

    const renderUnit = ({ item, index }: { item: Unit; index: number }) => {
        const unitProgress = ProgressService.getUnitProgress(courseId, item.id);
        const isComplete = unitProgress.percent === 100;

        return (
            <AnimatedUnitCard
                item={item}
                index={index}
                courseId={courseId}
                courseColor={course.color}
                progress={unitProgress}
                isComplete={isComplete}
                onPress={() => onUnitPress(courseId, item.id)}
            />
        );
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: course.color + '30' }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>

                <Text style={[styles.courseTitle, { color: course.color }]}>
                    {course.title}
                </Text>

                <View style={styles.headerMeta}>
                    <Text style={styles.courseSubtitle}>
                        {course.units.length} units • {courseProgress.completed}/{courseProgress.total} completed
                    </Text>
                </View>

                {/* Course-level progress bar */}
                <View style={styles.headerProgressBar}>
                    <View style={[styles.headerProgressFill, {
                        width: `${courseProgress.percent}%`,
                        backgroundColor: course.color,
                    }]} />
                </View>
            </View>

            {/* Units List */}
            <FlatList
                data={course.units}
                renderItem={renderUnit}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </Animated.View>
    );
};

/** Individual animated unit card */
const AnimatedUnitCard = ({
    item, index, courseId, courseColor, progress, isComplete, onPress,
}: {
    item: Unit; index: number; courseId: string; courseColor: string;
    progress: ProgressStats; isComplete: boolean;
    onPress: () => void;
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(25)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0, duration: 350, delay: index * 60, useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true,
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

    return (
        <Animated.View style={{
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            opacity: opacityAnim,
        }}>
            <TouchableOpacity
                style={styles.unitCard}
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={1}
            >
                <View style={styles.unitLeft}>
                    <View style={[
                        styles.unitNumber,
                        { backgroundColor: isComplete ? '#4CD96420' : courseColor + '20' },
                    ]}>
                        <Text style={[
                            styles.unitNumberText,
                            { color: isComplete ? '#4CD964' : courseColor },
                        ]}>
                            {isComplete ? '✓' : index + 1}
                        </Text>
                    </View>
                    <View style={styles.unitInfo}>
                        <Text style={styles.unitTitle}>{item.title}</Text>
                        <Text style={styles.unitMeta}>
                            {progress.completed}/{progress.total} completed
                            {item.quizGeneratorId ? ' • Quiz' : ''}
                        </Text>
                        {/* Unit progress bar */}
                        <View style={styles.unitProgressBar}>
                            <View style={[styles.unitProgressFill, {
                                width: `${progress.percent}%`,
                                backgroundColor: isComplete ? '#4CD964' : courseColor,
                            }]} />
                        </View>
                    </View>
                </View>

                <Text style={styles.chevron}>›</Text>
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
    courseTitle: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerMeta: {
        marginTop: 4,
    },
    courseSubtitle: {
        fontSize: 14,
        color: '#6C7293',
        fontWeight: '500',
    },
    headerProgressBar: {
        height: 4,
        backgroundColor: '#1D1F33',
        borderRadius: 2,
        marginTop: 14,
        overflow: 'hidden',
    },
    headerProgressFill: {
        height: '100%',
        borderRadius: 2,
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    unitCard: {
        backgroundColor: '#1D1F33',
        borderRadius: 14,
        padding: 18,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    unitLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    unitNumber: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    unitNumberText: {
        fontSize: 16,
        fontWeight: '800',
    },
    unitInfo: {
        flex: 1,
    },
    unitTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 3,
    },
    unitMeta: {
        fontSize: 13,
        color: '#6C7293',
        fontWeight: '500',
    },
    unitProgressBar: {
        height: 3,
        backgroundColor: '#2D2F45',
        borderRadius: 2,
        marginTop: 8,
        overflow: 'hidden',
    },
    unitProgressFill: {
        height: '100%',
        borderRadius: 2,
    },
    chevron: {
        fontSize: 22,
        color: '#6C7293',
        fontWeight: '300',
        marginLeft: 8,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 40,
    },
});

export default CourseDetailScreen;
