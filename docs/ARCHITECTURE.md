# Conversatype — System Architecture & Technical Specifications

## 1. High-Level Architecture Overview

Conversatype is engineered as a **Local-First, Zero-Latency Client Application** built on React 18, TypeScript, and Vite. The system is designed to eliminate network round-trips during gameplay to ensure instantaneous typing responsiveness.

```
+-------------------------------------------------------------------------+
|                              USER BROWSER                               |
|                                                                         |
|  +--------------------+   +---------------------+   +----------------+  |
|  |     UI Layer       |   |  useTypingEngine    |   | useDialogueLoop|  |
|  | (React + Tailwind) |<->| (Keystroke Validate)|<->| (State Machine)|  |
|  +--------------------+   +---------------------+   +----------------+  |
|            |                         |                       |          |
|            v                         v                       v          |
|  +--------------------+   +---------------------+   +----------------+  |
|  |  Theme Engine      |   | soundService        |   | storageService |  |
|  |  (CSS Variables)   |   | (Web Audio API)     |   | (LocalStorage) |  |
|  +--------------------+   +---------------------+   +----------------+  |
+-------------------------------------------------------------------------+
```

---

## 2. Core Typing Engine Pipeline

The typing engine is encapsulated in the `useTypingEngine` hook. On each keyboard event:

```
[Keydown Event]
       |
       v
[Ignore Meta / System Keys (Shift, Ctrl, Alt, CapsLock, Tab)]
       |
       +---> [Backspace?] ---> Rollback last typed character ---> Sound: Key Click
       |
       v
[Printable Character?]
       |
       v
[Compare Typed vs Expected Char at current index]
       |
       +---> Correct? ---> Mark 'correct' (green) ---> Sound: Key Click
       |
       +---> Incorrect? ---> Mark 'incorrect' (red) ---> Increment Error ---> Sound: Error Blip
       |
       v
[Check if Sentence Finished]
       |
       +---> Yes ---> Trigger onSentenceComplete callback with stats
       +---> No  ---> Update live WPM, accuracy, and caret position
```

### Metrics Calculation Formula
$$\text{Net WPM} = \max\left(0, \text{round}\left(\frac{\text{Correct Characters} / 5}{\text{Elapsed Minutes}}\right)\right)$$
$$\text{Raw WPM} = \text{round}\left(\frac{\text{Total Characters Typed} / 5}{\text{Elapsed Minutes}}\right)$$
$$\text{Accuracy} = \text{round}\left(\frac{\text{Correct Characters}}{\text{Total Characters Typed}} \times 100\right)$$

---

## 3. Web Audio Synthesizer Architecture

Rather than loading high-latency external audio files, `soundService` procedurally generates audio in real time using the browser's `AudioContext`:
- **Tactile Thock**: Sine wave oscillator sweeping from 180Hz to 60Hz with a triangle click transient (60ms).
- **Cherry MX Blue**: Triangle wave oscillator sweeping from 1200Hz to 300Hz (40ms).
- **Bubble Pop**: Sine wave ramping from 500Hz to 1200Hz (35ms).
- **Message Sent**: Ascending 3-tone arpeggio (C5 $\rightarrow$ E5 $\rightarrow$ G5).
- **Message Received**: 2-tone chime (A4 $\rightarrow$ E5).
- **Victory Fanfare**: C Major chord progression with harmonic envelope decay.

---

## 4. Zero-Scroll Viewport Layout Design

To prevent standard browser page scrolling:
- Root application container is set to `h-screen w-screen max-h-screen overflow-hidden flex flex-col`.
- **Desktop (screens $\ge$ 768px)**:
  - Real-Life mode uses a **2-column split layout**:
    - Left column: `SceneFrame` (`w-72` / `w-80`) with photo, location badge, and NPC role.
    - Right column: Chat simulator (`flex-1 min-h-0`).
- **Mobile (screens $<$ 768px)**:
  - Real-Life mode uses a **compact 48px header strip** above the chat.
- The `ChatFeed` has `flex-1 min-h-0 overflow-y-auto`, ensuring that only the messages list scrolls internally while the typing box remains anchored at the bottom.

---

## 5. Dynamic CSS Theme System

Themes are activated by setting the `data-theme` attribute on `document.documentElement`:
- `fresh`: Fresh Lime (Clean light gray, pure white cards, vibrant lime green).
- `mint`: Clean Mint (Modern white, minimal borders, emerald green).
- `charcoal`: Midnight Charcoal (Dark charcoal, golden yellow accents).
- `frost`: Arctic Frost (Arctic slate, frost cyan accents).
