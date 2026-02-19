import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { CourseService } from '../services/CourseService';

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
    const course = CourseService.getCourse(courseId);
    const unit = CourseService.getUnit(courseId, unitId);
    const lesson = unit?.lessons.find(l => l.id === lessonId);

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
    const hasVideo = !isArticle && (lesson as any).youtubeVideoId;

    // Build the content URL
    const getContentUrl = (): string | null => {
        if (isArticle && lesson.articleUrl) {
            return lesson.articleUrl;
        }
        if (!isArticle) {
            const videoId = (lesson as any).youtubeVideoId;
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;
            }
        }
        return null;
    };

    const contentUrl = getContentUrl();

    // Dark YouTube embed page for video lessons
    const videoHtml = (videoId: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0A0E21; display: flex; align-items: center; justify-content: center; height: 100vh; }
        .video-container { position: relative; width: 100%; padding-bottom: 56.25%; }
        .video-container iframe {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          border: none; border-radius: 12px;
        }
      </style>
    </head>
    <body>
      <div class="video-container">
        <iframe
          src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>
    </body>
    </html>
  `;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: course.color + '30' }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.lessonTypeRow}>
                    <View style={[styles.typeBadge, { backgroundColor: isArticle ? '#E67E22' + '25' : '#3498DB' + '25' }]}>
                        <Text style={[styles.typeBadgeText, { color: isArticle ? '#E67E22' : '#3498DB' }]}>
                            {isArticle ? '📄 Article' : '▶ Video'}
                        </Text>
                    </View>
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
                    // Video: YouTube embed
                    <WebView
                        source={{ html: videoHtml((lesson as any).youtubeVideoId) }}
                        style={styles.webview}
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        mediaPlaybackRequiresUserAction={false}
                        allowsFullscreenVideo={true}
                        allowsInlineMediaPlayback={true}
                    />
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

                {/* Loading overlay */}
                {loading && contentUrl && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={course.color} />
                        <Text style={styles.loadingText}>
                            {isArticle ? 'Loading article...' : 'Loading video...'}
                        </Text>
                    </View>
                )}
            </View>

            {/* Video info section (only for videos) */}
            {!isArticle && hasVideo && (
                <View style={styles.videoInfo}>
                    <Text style={styles.videoInfoTitle}>{(lesson as any).youtubeTitle || lesson.title}</Text>
                    <Text style={styles.videoInfoChannel}>Khan Academy</Text>
                </View>
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
    videoInfo: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#1D1F33',
    },
    videoInfoTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    videoInfoChannel: {
        fontSize: 13,
        color: '#6C7293',
        fontWeight: '500',
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
