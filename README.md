# Conversatype ⚡

> **A conversational typing trainer merging Monkeytype precision with Duolingo delight.**
> Practice chatting in realistic English environments for remote jobs, travel, and everyday life with zero-latency character validation and simulated NPC dialogues.

![Conversatype Preview](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop)

---

## 🚀 Key Features

- **Monkeytype-Grade Typing Mechanics**: Sub-millisecond keystroke capture, character-by-character validation (green correct, red incorrect with error count, dimmed pending), smooth blinking cursor, and backspace correction.
- **Duolingo-Inspired Friendly UI**: Rounded accessible aesthetic (`rounded-3xl`), 3D tactile buttons with press feedback, and celebratory confetti upon completing tests.
- **Two Simulation Formats**:
  1. **App Chat Simulations**: 5 realistic messaging scenarios (Late-Night Food Delivery, Accidental Group Chat Drama, IT Support Helpdesk, First Dating App Opener, Urgent 6 PM Slack Ping).
  2. **Real-Life Scenarios**: 5 situational roleplay scenarios paired with high-impact photographic scene cards (Third-Wave Barista Rush, Tech Job Behavioral Interview, Airport Customs & Border Clearance, Emergency Clinic Consultation, Five-Star Hotel Late Check-In).
- **Procedural Web Audio Synthesizer**: Low-latency mechanical keyboard switch clicks (Tactile Thock, Cherry MX Blue, Bubble Pop) and message delivery chimes synthesized via the Web Audio API without downloading audio assets.
- **Live Performance Scorecard**: Net WPM, Raw WPM, Accuracy (%), Key Misstrokes, Time, Performance Tier badge (S/A/B/C/D), SVG WPM progression graph, and one-click shareable result cards.
- **SEO & English Career Learner Optimization**: Structured with Schema.org JSON-LD and OpenGraph tags targeting English workplace dialogue practice.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 + TypeScript + Vite
- **Styling & Design System**: Tailwind CSS v4 + Plus Jakarta Sans & JetBrains Mono fonts
- **Icons**: Lucide React
- **Celebration**: `canvas-confetti`
- **Audio**: Web Audio API (Zero external MP3 dependency)
- **Data & State**: Decoupled custom hooks (`useTypingEngine`, `useDialogueLoop`) + LocalStorage persistence for personal bests and audio preferences.

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```
Generates an optimized static bundle in `dist/`, ready to deploy to Cloudflare Pages, Vercel, Netlify, or GitHub Pages.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Tab` + `Enter` | Restart current scenario instantly |
| `Esc` | Open Scenario Browser modal |
| `Backspace` | Rollback and correct mistyped characters |

---

## 📂 Project Architecture

```
conversatype-web/
├── src/
│   ├── types/               # TypeScript domain types (scenario, typing, settings)
│   ├── data/                # 10 linear multi-turn scenarios (App Chat & Real-Life)
│   ├── hooks/               # useTypingEngine & useDialogueLoop state machines
│   ├── lib/                 # audio synthesizer, metrics math, local storage
│   ├── components/
│   │   ├── ui/              # Duolingo tactile buttons, badges, modals
│   │   ├── layout/          # Header, Footer
│   │   ├── chat/            # ChatFeed, MessageBubble, TypingInput, TypingIndicator
│   │   ├── scenario/        # SceneFrame, ScenarioSelector
│   │   └── scorecard/       # ScorecardModal, WpmChart
│   ├── styles/              # Tailwind CSS directives & animations
│   ├── App.tsx              # Main Game Coordinator
│   └── main.tsx             # DOM Root
```

---

## 📚 Project Documentation

Comprehensive product and technical documentation is available in the [`docs/`](./docs) directory:
- [Product Requirements Document (PRD)](./docs/PRD.md)
- [System Architecture & Technical Specifications](./docs/ARCHITECTURE.md)
- [Scenario Catalog & Dialogue Specifications](./docs/SCENARIOS.md)
- [Future Roadmap & Monetization Strategy](./docs/ROADMAP.md)

---

## 🗺️ Future Roadmap

- [ ] **AI Fluency Test ("Blind Mode")**: Hide text hints and let users formulate replies based on situational prompts, evaluated by LLM for grammar, tone, and WPM.
- [ ] **Multilingual Support (i18n)**: Spanish, French, Japanese, German, Indonesian, and Mandarin.
- [ ] **Global Daily Leaderboard**: Seeded daily scenario challenge (Wordle-style) with Supabase backend.
- [ ] **Custom Scenario Builder**: Allow community users to author and share their own conversational typing challenges.
