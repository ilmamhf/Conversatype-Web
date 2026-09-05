# Conversatype — Product Requirements Document (PRD)

## 1. Product Overview & Vision
**Conversatype** is a web-based typing speed and accuracy trainer that merges the sub-millisecond precision of **Monkeytype** with the friendly, accessible, tactile aesthetic of modern gamified educational apps like **Duolingo**.

Instead of transcribing arbitrary dictionary word lists, players engage in authentic, linear multi-turn conversations with simulated NPCs across two visual formats:
1. **App Chat Simulations**: Familiar instant messaging interface (WhatsApp / iMessage / Slack aesthetic).
2. **Real-Life Scenarios**: Situation-based roleplay paired with contextual environmental photography (e.g., ordering specialty coffee, clearing airport customs, answering behavioral interview questions).

---

## 2. Target Audience & Market Positioning
1. **English Environment Learners & Remote Workers**: Non-native English speakers practicing realistic chat etiquette, contractions, and workplace phrasing for international remote jobs and exams.
2. **Keyboard Enthusiasts & Typists**: Typists seeking realistic sentence flow with natural grammar, punctuation, and capitalization beyond repetitive word lists.
3. **Students & All-Age Learners**: Accessible, friendly typing practice with cheerful audio feedback and no intimidating clutter.

---

## 3. Functional Requirements (FR)

| ID | Module | Description | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **FR-01** | **Typing Engine Core** | Real-time keystroke capture, character validation, caret positioning, backspace rollback. | Zero input lag; displays target text with character states (`pending`, `current`, `correct`, `incorrect`); spaces have guaranteed visible width and never collapse. |
| **FR-02** | **Metrics & Analytics** | Live calculation of Net WPM, Raw WPM, Accuracy (%), Error count, and Duration. | Standard formula: $\text{WPM} = \frac{(\text{Correct Characters} / 5)}{\text{Minutes}}$; accuracy calculated continuously; live updates during test. |
| **FR-03** | **NPC Dialogue Sequencer** | Turn-based linear dialogue state machine. Completing user line dispatches bubble, triggers realistic NPC typing indicator (`...`), then delivers reply. | User input locks during NPC turns; realistic typing delay (500ms - 800ms); smooth auto-scroll to bottom. |
| **FR-04** | **Zero-Scroll Viewport Layout** | 100% on-screen layout without page scrollbars. Desktop uses a side-by-side split for Real-Life scenarios; mobile uses a compact 48px header strip. | Entire application fits inside `h-screen max-h-screen overflow-hidden`; only the chat feed scrolls internally. |
| **FR-05** | **10 Multi-Turn Linear Scenarios** | 5 App Chat scenarios + 5 Real-Life scenarios. Every scenario is standalone, non-branching, and features 5–6 turns. | Dialogue follows natural conversational punctuation (no robotic trailing dots on casual text bubbles). |
| **FR-06** | **Procedural Audio Synthesizer** | Low-latency Web Audio API mechanical switch sounds (Tactile Thock, Cherry MX Blue, Bubble Pop, Silent) and message pings. | Synthesized on the client with zero external audio file latency. |
| **FR-07** | **Performance Scorecard & Chart** | End-of-session summary with Net WPM, Raw WPM, Accuracy, Errors, Time, S/A/B/C/D Rank Badge, and an SVG WPM timeline curve. | Includes one-click shareable text card copy and celebration confetti. |
| **FR-08** | **Multi-Theme Engine** | Clean, generic themes without third-party trademark names (Fresh Lime, Clean Mint, Midnight Charcoal, Arctic Frost). | Toggled instantly via dynamic CSS variables without page refreshes; persisted in `localStorage`. |
| **FR-09** | **Multi-Phase Scenario Discovery** | 2-Phase Scenario Selector: Phase 1 selects context (Casual, Workplace, Social, Travel, Daily Life); Phase 2 selects scenario & difficulty. | Includes breadcrumbs, back button, difficulty filters, and personal best WPM badges. |

---

## 4. Non-Functional Requirements (NFR)
- **Performance**: Sub-1ms keystroke processing time; 60+ FPS animation frames on modern desktop and mobile browsers.
- **Accessibility**: High contrast text ratios (WCAG AA compliant), clear focus indicators, keyboard shortcuts (`Tab + Enter` to restart, `Esc` to browse scenarios).
- **Zero Server Latency (Local-First)**: Core gameplay and persistence operate 100% client-side via `localStorage`.
