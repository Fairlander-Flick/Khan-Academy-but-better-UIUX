/**
 * Khan Academy Offline — Better UI
 * Data-driven, extendable education app for Android tablets.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import CourseDetailScreen from './src/screens/CourseDetailScreen';
import UnitDetailScreen from './src/screens/UnitDetailScreen';
import QuizScreen from './src/screens/QuizScreen';
import QuizResultScreen from './src/screens/QuizResultScreen';
import LessonDetailScreen from './src/screens/LessonDetailScreen';
import { QuizResult } from './src/types';
import { ProgressService } from './src/services/ProgressService';
import { DownloadService } from './src/services/DownloadService';

type Screen =
  | { name: 'Home' }
  | { name: 'CourseDetail'; courseId: string }
  | { name: 'UnitDetail'; courseId: string; unitId: string }
  | { name: 'Quiz'; courseId: string; unitId: string; isGrandQuiz?: boolean }
  | { name: 'QuizResult'; courseId: string; unitId: string; result: QuizResult }
  | { name: 'LessonDetail'; courseId: string; unitId: string; lessonId: string };

function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'Home' });
  const [servicesReady, setServicesReady] = useState(false);

  // Initialize persistence services
  useEffect(() => {
    Promise.all([
      ProgressService.init(),
      DownloadService.init(),
    ]).then(() => setServicesReady(true));
  }, []);

  // Navigation callbacks
  const navigateToCourse = useCallback((courseId: string) => {
    setScreen({ name: 'CourseDetail', courseId });
  }, []);

  const navigateToUnit = useCallback((courseId: string, unitId: string) => {
    setScreen({ name: 'UnitDetail', courseId, unitId });
  }, []);

  const navigateToQuiz = useCallback((courseId: string, unitId: string) => {
    setScreen({ name: 'Quiz', courseId, unitId });
  }, []);

  const navigateToLesson = useCallback((courseId: string, unitId: string, lessonId: string) => {
    setScreen({ name: 'LessonDetail', courseId, unitId, lessonId });
  }, []);

  const navigateToQuizResult = useCallback(
    (courseId: string, unitId: string, result: QuizResult) => {
      setScreen({ name: 'QuizResult', courseId, unitId, result });
    },
    [],
  );

  const goBack = useCallback(() => {
    switch (screen.name) {
      case 'CourseDetail':
        setScreen({ name: 'Home' });
        break;
      case 'UnitDetail':
        setScreen({ name: 'CourseDetail', courseId: screen.courseId });
        break;
      case 'Quiz':
        setScreen({ name: 'UnitDetail', courseId: screen.courseId, unitId: screen.unitId });
        break;
      case 'QuizResult':
        setScreen({ name: 'UnitDetail', courseId: screen.courseId, unitId: screen.unitId });
        break;
      case 'LessonDetail':
        setScreen({ name: 'UnitDetail', courseId: screen.courseId, unitId: screen.unitId });
        break;
      default:
        break;
    }
  }, [screen]);

  const renderScreen = () => {
    switch (screen.name) {
      case 'Home':
        return <HomeScreen onCoursePress={navigateToCourse} />;

      case 'CourseDetail':
        return (
          <CourseDetailScreen
            courseId={screen.courseId}
            onUnitPress={navigateToUnit}
            onBack={goBack}
          />
        );

      case 'UnitDetail':
        return (
          <UnitDetailScreen
            courseId={screen.courseId}
            unitId={screen.unitId}
            onLessonPress={navigateToLesson}
            onQuizPress={navigateToQuiz}
            onBack={goBack}
          />
        );

      case 'Quiz':
        return (
          <QuizScreen
            courseId={screen.courseId}
            unitId={screen.unitId}
            isGrandQuiz={screen.isGrandQuiz}
            onBack={goBack}
            onComplete={(result) =>
              navigateToQuizResult(screen.courseId, screen.unitId, result)
            }
          />
        );

      case 'QuizResult':
        return (
          <QuizResultScreen
            courseId={screen.courseId}
            unitId={screen.unitId}
            result={screen.result}
            onRetry={() =>
              setScreen({
                name: 'Quiz',
                courseId: screen.courseId,
                unitId: screen.unitId,
              })
            }
            onBack={goBack}
          />
        );

      case 'LessonDetail':
        return (
          <LessonDetailScreen
            courseId={screen.courseId}
            unitId={screen.unitId}
            lessonId={screen.lessonId}
            onBack={goBack}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      {renderScreen()}
    </SafeAreaProvider>
  );
}

export default App;
