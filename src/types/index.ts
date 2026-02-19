// Data-Driven Course Types

export interface Course {
  id: string;
  title: string;
  icon: string;
  color: string;
  units: Unit[];
}

export interface Unit {
  id: string;
  title: string;
  playlistId?: string; // YouTube Playlist ID
  quizGeneratorId?: string; // Maps to a registered quiz generator
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type?: 'video' | 'article'; // Defaults to 'video' if omitted
  videoId?: string; // YouTube Video ID (for type='video')
  articleUrl?: string; // Khan Academy article URL (for type='article')
  duration?: string; // e.g. "14:32"
}

// Quiz Types

export interface QuizQuestion {
  id: string;
  text: string; // Can contain LaTeX: "$f(x) = 3x^2$"
  options: QuizOption[];
  correctOptionId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

export interface QuizOption {
  id: string;
  text: string; // Can contain LaTeX
}

export interface QuizSession {
  courseId: string;
  unitId: string;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: { questionId: string; selectedOptionId: string; correct: boolean }[];
  bonusTriggered: boolean;
  stars: 0 | 1 | 2 | 3;
  isGrandQuiz: boolean;
}

export type QuizResult = {
  totalQuestions: number;
  correctAnswers: number;
  stars: 0 | 1 | 2 | 3;
  bonusUsed: boolean;
};

// Video Types

export interface VideoDownload {
  videoId: string;
  localPath: string | null;
  status: 'not_downloaded' | 'downloading' | 'downloaded' | 'error';
  progress: number; // 0-100
  quality: '360p' | '720p' | '1080p';
}

// Navigation Types

export type RootStackParamList = {
  Home: undefined;
  CourseDetail: { courseId: string };
  UnitDetail: { courseId: string; unitId: string };
  VideoPlayer: { courseId: string; unitId: string; lessonId: string };
  Quiz: { courseId: string; unitId: string; isGrandQuiz?: boolean };
  QuizResult: { result: QuizResult };
};
