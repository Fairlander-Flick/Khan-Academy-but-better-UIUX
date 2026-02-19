import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Animated,
    useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';
import { CourseService } from '../services/CourseService';
import { ProgressService } from '../services/ProgressService';

interface LessonDetailScreenProps {
    courseId: string;
    unitId: string;
    lessonId: string;
    onBack: () => void;
}

const LessonDetailScreen: React.FC<LessonDetailScreenProps> = ({
    courseId,
    unitId,
    lessonId,
    onBack,
}) => {
    const [loading, setLoading] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const course = CourseService.getCourse(courseId);
    const unit = CourseService.getUnit(courseId, unitId);
    const lesson = unit?.lessons.find(l => l.id === lessonId);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const btnScale = useRef(new Animated.Value(1)).current;
    const { width } = useWindowDimensions();

    useEffect(() => {
        setIsComplete(ProgressService.isComplete(courseId, unitId, lessonId));
        const unsub = ProgressService.subscribe(() => {
            setIsComplete(ProgressService.isComplete(courseId, unitId, lessonId));
        });
        Animated.timing(fadeAnim, {
            toValue: 1, duration: 300, useNativeDriver: true,
        }).start();
        return unsub;
    }, []);

    const handleToggleComplete = async () => {
        Animated.sequence([
            Animated.spring(btnScale, { toValue: 0.92, tension: 200, friction: 10, useNativeDriver: true }),
            Animated.spring(btnScale, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }),
        ]).start();
        await ProgressService.toggle(courseId, unitId, lessonId);
    };

    const onVideoReady = useCallback(() => {
        setLoading(false);
    }, []);

    const onVideoEnd = useCallback(() => {
        // Auto-complete when video finishes
        if (!ProgressService.isComplete(courseId, unitId, lessonId)) {
            ProgressService.markComplete(courseId, unitId, lessonId);
        }
    }, [courseId, unitId, lessonId]);

    if (!course || !unit || !lesson) {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorEmoji}>⚠️</Text>
                    <Text style={styles.errorText}>Lesson not found.</Text>
                </View>
            </View>
        );
    }

    const isArticle = lesson.type === 'article';
    const videoId = !isArticle ? (lesson as any).youtubeVideoId : null;
    const hasVideo = !!videoId;
    const contentUrl = isArticle ? lesson.articleUrl : null;
    const playerHeight = Math.round((width - 0) * 9 / 16); // 16:9 ratio

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: course.color + '30' }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.lessonTypeRow}>
                    <View style={[styles.typeBadge, {
                        backgroundColor: isArticle ? '#E67E22' + '25' : '#3498DB' + '25',
                    }]}>
                        <Text style={[styles.typeBadgeText, {
                            color: isArticle ? '#E67E22' : '#3498DB',
                        }]}>
                            {isArticle ? '📄 Article' : '▶ Video'}
                        </Text>
                    </View>
                    {isComplete && (
                        <View style={styles.completeBadge}>
                            <Text style={styles.completeBadgeText}>✓ Completed</Text>
                        </View>
                    )}
                </View>

                <Text style={[styles.lessonTitle, { color: course.color }]} numberOfLines={2}>
                    {lesson.title}
                </Text>
                <Text style={styles.breadcrumb}>
                    {course.title} › {unit.title.replace(/^Unit \d+:\s*/, '')}
                </Text>
            </View>

            {/* Content Area */}
            <View style={styles.contentArea}>
                {isArticle ? (
                    // Article: WebView with info banner
                    <>
                        <View style={styles.articleBanner}>
                            <Text style={styles.articleBannerIcon}>📄</Text>
                            <View style={styles.articleBannerTextContainer}>
                                <Text style={styles.articleBannerTitle}>Khan Academy Article</Text>
                                <Text style={styles.articleBannerSubtext}>
                                    This content is hosted on khanacademy.org
                                </Text>
                            </View>
                        </View>
                        {contentUrl ? (
                            <WebView
                                source={{ uri: contentUrl }}
                                style={styles.webview}
                                onLoadStart={() => setLoading(true)}
                                onLoadEnd={() => setLoading(false)}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                startInLoadingState={false}
                                allowsFullscreenVideo={true}
                            />
                        ) : (
                            <View style={styles.noContent}>
                                <Text style={styles.noContentEmoji}>🔗</Text>
                                <Text style={styles.noContentText}>Article URL not available.</Text>
                            </View>
                        )}
                    </>
                ) : hasVideo ? (
                    // Video: YouTube IFrame Player
                    <View style={styles.videoContainer}>
                        <YoutubePlayer
                            height={playerHeight}
                            videoId={videoId}
                            play={false}
                            onReady={onVideoReady}
                            onChangeState={(event: string) => {
                                if (event === 'ended') {
                                    onVideoEnd();
                                }
                            }}
                            webViewProps={{
                                androidLayerType: 'hardware',
                            }}
                        />
                        {loading && (
                            <View style={[styles.videoLoading, { height: playerHeight }]}>
                                <ActivityIndicator size="large" color={course.color} />
                                <Text style={styles.loadingText}>Loading video...</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    // No video available
                    <View style={styles.noContent}>
                        <Text style={styles.noContentEmoji}>📹</Text>
                        <Text style={styles.noContentText}>Video not available yet.</Text>
                        <Text style={styles.noContentSubtext}>
                            This lesson's video hasn't been linked yet.
                        </Text>
                    </View>
                )}

                {/* Article loading overlay */}
                {loading && isArticle && contentUrl && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={course.color} />
                        <Text style={styles.loadingText}>Loading article...</Text>
                    </View>
                )}
            </View>

            {/* Bottom bar: video info + Mark Complete */}
            <View style={styles.bottomBar}>
                {!isArticle && hasVideo && (
                    <View style={styles.videoInfo}>
                        <Text style={styles.videoInfoTitle} numberOfLines={1}>
                            {(lesson as any).youtubeTitle || lesson.title}
                        </Text>
                        <Text style={styles.videoInfoChannel}>Khan Academy</Text>
                    </View>
                )}

                <Animated.View style={{ transform: [{ scale: btnScale }], flex: isArticle || !hasVideo ? 1 : undefined }}>
                    <TouchableOpacity
                        style={[styles.completeBtn, isComplete && styles.completeBtnDone]}
                        onPress={handleToggleComplete}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.completeBtnText, isComplete && styles.completeBtnTextDone]}>
                            {isComplete ? '✓ Completed' : '○ Mark as Complete'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
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
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    backText: {
        color: '#6C7293',
        fontSize: 15,
        fontWeight: '600',
    },
    lessonTypeRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'center',
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    completeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#4CD96420',
        marginLeft: 8,
    },
    completeBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4CD964',
    },
    lessonTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    breadcrumb: {
        fontSize: 13,
        color: '#6C7293',
        fontWeight: '500',
    },
    contentArea: {
        flex: 1,
        position: 'relative',
    },
    videoContainer: {
        backgroundColor: '#000',
        position: 'relative',
    },
    videoLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0A0E21',
        alignItems: 'center',
        justifyContent: 'center',
    },
    webview: {
        flex: 1,
        backgroundColor: '#0A0E21',
    },
    articleBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1D1F33',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2D2F45',
    },
    articleBannerIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    articleBannerTextContainer: {
        flex: 1,
    },
    articleBannerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#E67E22',
    },
    articleBannerSubtext: {
        fontSize: 12,
        color: '#6C7293',
        marginTop: 1,
    },
    noContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noContentEmoji: {
        fontSize: 56,
        marginBottom: 16,
    },
    noContentText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    noContentSubtext: {
        fontSize: 14,
        color: '#6C7293',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0A0E21E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#6C7293',
        fontSize: 14,
        marginTop: 12,
        fontWeight: '600',
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: '#1D1F33',
        backgroundColor: '#0D1127',
    },
    videoInfo: {
        flex: 1,
        marginRight: 12,
    },
    videoInfoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    videoInfoChannel: {
        fontSize: 12,
        color: '#6C7293',
        fontWeight: '500',
    },
    completeBtn: {
        backgroundColor: '#1D1F33',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2D2F45',
    },
    completeBtnDone: {
        backgroundColor: '#4CD96418',
        borderColor: '#4CD96440',
    },
    completeBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    completeBtnTextDone: {
        color: '#4CD964',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LessonDetailScreen;
