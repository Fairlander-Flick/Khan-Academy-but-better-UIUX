import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    useWindowDimensions,
} from 'react-native';
import { CourseService } from '../services/CourseService';
import { Course } from '../types';

interface HomeScreenProps {
    onCoursePress: (courseId: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onCoursePress }) => {
    const courses = CourseService.getAllCourses();
    const { width } = useWindowDimensions();

    // Tablet: 2-3 columns based on screen width
    const numColumns = width > 900 ? 3 : width > 600 ? 2 : 1;
    const cardWidth = (width - 48 - (numColumns - 1) * 16) / numColumns;

    const renderCourseCard = ({ item }: { item: Course }) => {
        const unitCount = CourseService.getUnitCount(item.id);
        const videoCount = CourseService.getVideoCount(item.id);

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    { width: cardWidth, borderLeftColor: item.color },
                ]}
                onPress={() => onCoursePress(item.id)}
                activeOpacity={0.7}
            >
                <View style={[styles.cardIconContainer, { backgroundColor: item.color + '15' }]}>
                    <Text style={[styles.cardIcon, { color: item.color }]}>
                        {getEmojiForCourse(item.id)}
                    </Text>
                </View>

                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                </Text>

                <View style={styles.cardMeta}>
                    <Text style={styles.cardMetaText}>
                        {unitCount} units • {videoCount} videos
                    </Text>
                </View>

                <View style={[styles.cardAccent, { backgroundColor: item.color }]} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Khan Academy</Text>
                <Text style={styles.headerSubtitle}>Better UI • Offline</Text>
            </View>

            {/* Greeting */}
            <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>
                    {getGreeting()}
                </Text>
                <Text style={styles.greetingSubtext}>
                    Ready to learn? Pick a course below.
                </Text>
            </View>

            {/* Course Grid */}
            <FlatList
                data={courses}
                renderItem={renderCourseCard}
                keyExtractor={item => item.id}
                numColumns={numColumns}
                key={numColumns} // Re-render on column change
                contentContainerStyle={styles.grid}
                columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
                showsVerticalScrollIndicator={false}
            />
        </View>
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
        // Shadow
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    cardIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
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
