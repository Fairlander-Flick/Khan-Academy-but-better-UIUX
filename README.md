# Khan Academy Better UI — Offline Learning App

A reimagined, modern, and offline-first mobile interface for Khan Academy content, built with **React Native** (CLI).

> ⚠️ **Note on YouTube Downloads**:  
> The UI currently **simulates** video downloads. Actual file downloading from YouTube is restricted by YouTube's Terms of Service (ToS). The "Download" button demonstrates the UI/UX flow and state management but does not save video files to disk.
> 
> However, **Article** content (HTML) and **Quiz** progress are fully functional and persist offline.

## 🚀 Features

### 📚 Course & Content
- **Modern Tablet UI**: Grid layout optimized for tablets with staggered animations.
- **Course Navigation**: Drill down from Course → Unit → Lesson.
- **Rich Content Support**:
  - **Videos**: Played via YouTube IFrame API (hardware accelerated).
  - **Articles**: Rendered via WebView with Khan Academy branding.
  - **Quizzes**: Interactive quizzes with **LaTeX math rendering** (KaTeX).

### 📊 Progress Tracking (Offline Capable)
- **Persisted Progress**: Tracks completion of every lesson and quiz.
- **Visuals**:
  - Progress rings on course cards.
  - Green checkmarks (✓) for completed items.
  - Overall progress bar on the home screen.
- **Resume Anywhere**: Continues exactly where you left off.

### 🧠 Interactive Quizzes
- **Infinite Practice**: Procedurally generated math questions (Derivatives, etc.).
- **Math Rendering**: Beautiful mathematical notation using **KaTeX**.
- **Quiz Flow**: 4 questions + 1 bonus question logic.
- **Gamification**: Earn stars (1-3) based on performance.

### ⬇️ Download Manager (UI Demo)
- **State Management**: Tracks `not_downloaded` → `downloading` → `downloaded` states.
- **Persistence**: Remembers "downloaded" status across app restarts.
- **Animation**: Simulated download progress ring.

## 🛠️ Tech Stack

- **React Native (CLI)** — Core framework
- **TypeScript** — Strict type safety
- **React Native Reanimated** — Complex animations (staggered lists, press effects)
- **AsyncStorage** — Offline persistence (progress & settings)
- **react-native-youtube-iframe** — YouTube playback
- **react-native-webview** — Article & Math rendering
- **KaTeX** — Math typesetting

## 🏁 Getting Started

### Prerequisites
- Node.js & npm
- Android Studio (SDK API 34+)
- Java JDK 17

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Fairlander-Flick/Khan-Academy-but-better-UIUX.git
   cd "Khan Academy but Better UI"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Metro Bundler**
   ```bash
   npm start
   ```

4. **Run on Android Emulator/Device**
   ```bash
   npm run android
   ```

## 📸 Screenshots

| Home Screen | Unit Detail | Quiz |
|-------------|-------------|------|
| *(Course Grid)* | *(Lessons & Progress)* | *(LaTeX rendering)* |

## 🤝 Contributing

This is a personal project to demonstrate UI/UX skills and offline-first architecture. Feel free to fork and improve!

## 📄 License

MIT

---

*Verified working on Android Emulator (API 34 'UpsideDownCake').*
