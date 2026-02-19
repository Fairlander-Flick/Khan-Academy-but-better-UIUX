import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { CourseService } from '../services/CourseService';
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

    if (!course) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Course not found.</Text>
            </View>
        );
    }

    const renderUnit = ({ item, index }: { item: Unit; index: number }) => (
        <TouchableOpacity
            style={styles.unitCard}
            onPress={() => onUnitPress(courseId, item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.unitLeft}>
                <View style={[styles.unitNumber, { backgroundColor: course.color + '20' }]}>
                    <Text style={[styles.unitNumberText, { color: course.color }]}>
                        {index + 1}
                    </Text>
                </View>
                <View style={styles.unitInfo}>
                    <Text style={styles.unitTitle}>{item.title}</Text>
                    <Text style={styles.unitMeta}>
                        {item.lessons.length} lessons
                        {item.quizGeneratorId ? ' • Quiz available' : ''}
                    </Text>
                </View>
            </View>

            <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: course.color + '30' }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>

                <Text style={[styles.courseTitle, { color: course.color }]}>
                    {course.title}
                </Text>
                <Text style={styles.courseSubtitle}>
                    {course.units.length} units
                </Text>
            </View>

            {/* Units List */}
            <FlatList
                data={course.units}
                renderItem={renderUnit}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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
    courseTitle: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    courseSubtitle: {
        fontSize: 14,
        color: '#6C7293',
        marginTop: 4,
        fontWeight: '500',
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
