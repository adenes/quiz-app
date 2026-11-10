# Quiz App 🩺🧘📱

A modern, mobile-first interactive quiz and exam preparation web application with multi-test dataset selection: **Anatómia és Élettan** (100 questions) and **Gerinctréning** (50 questions).

---

## 🌟 Features

### 📚 1. Multi-Test Dataset Selection
- **Anatómia és Élettan (100 Questions)**: 11 comprehensive chapters covering planes & directions, bones, joints, spine, thorax, pelvis, and all muscle groups (back, abdomen, chest, shoulder, arm, lower limb, core) with Latin & Hungarian terminology and anatomical diagrams.
- **Gerinctréning (50 Questions)**: Focused on spinal biomechanics, spinal curves (lordosis, kyphosis), intervertebral disc physiology and loading, deep core stabilization system (transversus abdominis, multifidus, pelvic floor, diaphragm), and targeted posture exercises.
- **Independent Test Scoping**: Bookmarks, mistake tracking, quiz history, and statistics are scoped per test so your progress never collides. Switch between tests anytime from the home screen.

### 📱 2. Mobile-First Design & Desktop Device Simulator
- **Native Mobile Experience**: Designed from the ground up for smartphones with edge-to-edge layout, safe-area inset support, touch-optimized tap targets (48px+), and haptic micro-interactions.
- **Desktop Simulator Frame**: When viewed on desktop screens, the app renders inside a realistic flagship smartphone mockup (featuring a dynamic island, simulated status bar, and clock).
- **One-Click View Mode Toggle**: Easily switch between the mobile phone frame and full-width layout using the desktop toolbar button (`📱 Mobil Keret` / `🖥️ Teljes Nézet`).

### 🎓 3. Three Interactive Quiz Modes
1. **Practice Mode (Tanulás)**:
   - Instant visual feedback (emerald green for correct answers, rose red for mistakes).
   - In-depth anatomical explanation cards revealed immediately after answering.
   - Consecutive correct streak counter (🔥 *Streak* badge).
2. **Weak Spots / Mistakes Practice (Tévesztett kérdések)**:
   - Automatically tracks incorrectly answered questions per test in `localStorage`.
   - Practice only your mistakes until you achieve 100% mastery.
3. **Bookmarked Questions (Csillagozott kérdések)**:
   - Star any challenging question anytime using the top-right star icon to review in a dedicated test session later.

### 📑 4. Dynamic Topic & Chapter Categories
Categories dynamically adapt based on the selected test:
- **Anatómia**: Síkok és irányok, Csontok és ízületek, Gerincoszlop és mellkas, Medence és izomtan, Hátizmok, Hasizmok, Mellizmok, Vállizmok és rotátorköpeny, Kar és alkar, Alsó végtag, Core izomzat.
- **Gerinctréning**: Gerinc felépítése és görbületei, Porckorongok és biomechanika, Core és mély stabilizáló rendszer, Helyes tartás és mozgásminták, Gyakorlatok és edzéselvek.

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

### 🖼️ 5. Anatomical & Biomechanical Illustrations (Latin & Hungarian)
- **High-Resolution Medical Diagrams**: Visual explanations featuring tailored, high-clarity medical anatomical illustrations across both datasets:
  - **Anatómia és Élettan**: 11 body categories including planes, joints, vertebral column, pelvis, rotator cuff, pectoral, abdominal wall, and limbs.
  - **Gerinctréning**: 5 specialized biomechanics infographics covering the intervertebral disc cross-section (*Anulus fibrosus & Nucleus pulposus* with 2/5, 1/5, 1/3 height ratios and longitudinal ligaments), single vertebra parts (*Corpus, Arcus, Foramen vertebrale, Processus spinosus & transversus*), physiological spinal curves and movements (*Lordosis, Kyphosis, Flexio, Extensio spinous crowding, Lateroflexio rib restriction, C1-C2 Rotatio*), deep core stabilization inner unit (*Diaphragma, Transversus abdominis, Multifidus, Diaphragma pelvis, IAP*), and ergonomic posture/exercises (100–110° sitting, 10–20° thigh incline, quadruped, plank, prone).
- **Bilingual Terminology**: All diagram structures are systematically labeled in both **Latin** (*Nomina Anatomica*) and **Hungarian** (e.g. *M. supraspinatus / Tövis feletti izom*, *Discus intervertebralis / Porckorong*, *Anulus fibrosus / Rostos gyűrű*, *Nucleus pulposus / Kocsonyás mag*, *Columna vertebralis / Gerincoszlop*).
- **Interactive Full-Screen Lightbox**: Tap any diagram card in practice mode or during test review to open an edge-to-edge lightbox modal for detailed study and zooming.

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

## 🌐 GitHub Pages Deployment

This repository is configured with an automated GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys the static web app on every push to the `main` branch.

### Live URL:
👉 **[https://adenes.github.io/quiz-app/](https://adenes.github.io/quiz-app/)**

### Enabling GitHub Pages in Repository Settings:
1. Go to your repository on GitHub: `https://github.com/adenes/quiz-app`
2. Click **Settings** ⚙️ → **Pages** (under "Code and automation" on the left sidebar).
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. Push your commits to `main`:
   ```bash
   git add .
   git commit -m "Deploy Quiz App to GitHub Pages"
   git push origin main
   ```
5. GitHub Actions will automatically run the build and publish the website!

---

## 📁 Project Structure

```text
├── index.html              # Main HTML entrypoint & viewport meta tags
├── package.json            # Project dependencies and npm scripts
├── README.md               # English documentation
├── src/
│   ├── app.js              # State management, multi-test router, event listeners, keyboard nav
│   ├── data/
│   │   ├── anatomia.json   # 100-question Anatomy & Physiology dataset with Latin/Hungarian labels
│   │   ├── gerinctrening.json # 50-question Spine Training dataset with biomechanics explanations
│   │   └── questions.js    # Multi-test manager, category filtering, and Fisher-Yates shuffle
│   ├── styles/
│   │   ├── variables.css   # Color palettes, light/dark tokens, shadows, transitions
│   │   ├── main.css        # Layout, mobile frame mockup, desktop simulator
│   │   └── components.css  # Cards, buttons, test selector grid, sheets, progress bars, and animations
│   └── utils/
│       ├── audio.js        # Web Audio API sound synthesizer
│       ├── dialog.js       # Custom animated confirmation & alert modal
│       ├── storage.js      # LocalStorage manager (per-test bookmarks, history, mistakes, settings)
│       └── confetti.js     # Lightweight canvas confetti particle animation
```

---

## 📄 License

MIT License. Designed and developed for interactive anatomy and physiology learning.
