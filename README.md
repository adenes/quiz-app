# Quiz App 🩺📱

A modern, mobile-first interactive quiz and exam preparation web application built around an extensive 100-question Anatomy & Physiology (*Anatómia és Élettan*) dataset.

---

## 🌟 Features

### 📱 1. Mobile-First Design & Desktop Device Simulator
- **Native Mobile Experience**: Designed from the ground up for smartphones with edge-to-edge layout, safe-area inset support, touch-optimized tap targets (48px+), and haptic micro-interactions.
- **Desktop Simulator Frame**: When viewed on desktop screens, the app renders inside a realistic flagship smartphone mockup (featuring a dynamic island, simulated status bar, and clock).
- **One-Click View Mode Toggle**: Easily switch between the mobile phone frame and full-width layout using the desktop toolbar button (`📱 Mobil Keret` / `🖥️ Teljes Nézet`).

### 🎓 2. Four Interactive Quiz Modes
1. **Practice Mode (Tanulás)**:
   - Instant visual feedback (emerald green for correct answers, rose red for mistakes).
   - In-depth anatomical explanation cards revealed immediately after answering.
   - Consecutive correct streak counter (🔥 *Streak* badge).
2. **Exam Simulation (Vizsga)**:
   - Live elapsed timer for realistic test conditions.
   - Answers are recorded without spoiling results during the test.
   - Comprehensive end-of-test evaluation featuring an animated circular score chart, time statistics, and detailed review.
3. **Weak Spots / Mistakes Practice (Tévesztett kérdések)**:
   - Automatically tracks incorrectly answered questions in `localStorage`.
   - Practice only your mistakes until you achieve 100% mastery.
4. **Bookmarked Questions (Csillagozott kérdések)**:
   - Star any challenging question anytime using the top-right star icon to review in a dedicated test session later.

### 📑 3. Topic & Chapter Categories
The 100 questions are categorized into 11 distinct anatomical chapters:
- **Planes & Directions** / *Síkok és irányok* (Questions 1–10)
- **Bones & Joints** / *Csontok és ízületek* (Questions 11–20)
- **Spine & Thorax** / *Gerincoszlop és mellkas* (Questions 21–30)
- **Pelvis & Muscle Fundamentals** / *Medence és izomtan* (Questions 31–40)
- **Back Muscles** / *Hátizmok* (Questions 41–50)
- **Abdominal Muscles** / *Hasizmok* (Questions 51–58)
- **Chest Muscles** / *Mellizmok* (Questions 59–65)
- **Shoulder & Rotator Cuff** / *Vállizmok és rotátorköpeny* (Questions 66–73)
- **Arm & Forearm Muscles** / *Kar és alkar* (Questions 74–80)
- **Lower Limb Muscles** / *Alsó végtag* (Questions 81–96)
- **Core Muscles & Stabilization** / *Core izomzat* (Questions 97–100)

### 🎛️ 4. Advanced UX & Audio
- **100-Question Sheet Navigator**: Click the grid icon in the header to open a bottom-sheet drawer with color-coded badges for all questions (green = correct, red = wrong, blue = current, gold star = bookmarked). Tap any number to jump directly to that question.
- **Web Audio API Sound Engine**: Zero-dependency synthesized audio feedback (soft tap clicks, cheerful chime for correct answers, gentle buzz for incorrect answers, streak arpeggios, and a victory fanfare with confetti on scores ≥ 70%). Mute toggle available anytime.
- **Question & Option Randomization**: Question shuffling is enabled by default so each test presents a fresh and engaging randomized sequence (can be toggled anytime in the settings along with answer option shuffling).
- **Dark & Light Mode**: Sleek obsidian dark theme by default, with one-tap toggle to a clean medical light theme.
- **Desktop Keyboard Shortcuts**:
  - `1`, `2`, `3`, `4` or `A`, `B`, `C`, `D`: Select an answer option
  - `Enter`, `Space`, or `→`: Next question
  - `←`: Previous question
  - `S`: Toggle Star / Bookmark
  - `M`: Toggle Sound Mute

---

## 🛠️ Technology Stack

- **Core**: Vanilla HTML5 & ES Modules (JavaScript)
- **Styling**: Vanilla CSS with Custom Properties (CSS Tokens, Glassmorphism, Micro-animations)
- **Tooling**: [Vite](https://vitejs.dev/) for blazing fast development and optimized production bundling
- **Audio & Visuals**: Web Audio API (native audio synthesis) & HTML5 Canvas confetti generator

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) & npm

### Installation
```bash
# Clone or navigate to the project directory
cd /path/to/iwi-test

# Install dependencies
npm install
```

### Running Locally
```bash
# Start the local development server
npm run dev
```
Open your browser at: **`http://localhost:5173/`**

### Building for Production
```bash
# Build the production bundle
npm run build

# Preview the production build locally
npm run preview
```

---

## 📁 Project Structure

```text
├── index.html              # Main HTML entrypoint & viewport meta tags
├── package.json            # Project dependencies and npm scripts
├── README.md               # English documentation
├── src/
│   ├── app.js              # State management, router, event listeners, keyboard nav
│   ├── data/
│   │   ├── questions.json  # 100-question Anatomy & Physiology dataset with explanations
│   │   └── questions.js    # Data helper, category filtering, and Fisher-Yates shuffle
│   ├── styles/
│   │   ├── variables.css   # Color palettes, light/dark tokens, shadows, transitions
│   │   ├── main.css        # Layout, mobile frame mockup, desktop simulator
│   │   └── components.css  # Cards, buttons, sheets, progress bars, and animations
│   └── utils/
│       ├── audio.js        # Web Audio API sound synthesizer
│       ├── storage.js      # LocalStorage manager for bookmarks, history, and mistakes
│       └── confetti.js     # Lightweight canvas confetti particle animation
```

---

## 📄 License

MIT License. Designed and developed for interactive anatomy and physiology learning.
