Great, this is the right moment to add the **technical spine** — *without collapsing into “tool-building” mode*.

Below is a **technology spec aligned with the simulator’s intent**.
I’ll explicitly call out **why each choice fits a simulator**, not a production PM tool.

---

# AI Sprint Simulator — Technical Specification

## 1. Architectural Principles (Non-Negotiable)

This is **not** a CRUD-heavy enterprise app.

The system must:

1. **Simulate time** (day-by-day progression)
2. **Recalculate state deterministically**
3. **Visualize change, not store truth**
4. **Make AI reasoning explainable**

So we optimize for:

* Deterministic simulation
* Fast iteration
* Visual clarity
* Low infra complexity

---

## 2. High-Level Architecture

```
Browser (Simulator UI)
  |
  |-- Simulation State Engine (in-memory)
  |
  |-- AI Reasoning Layer (mocked or LLM-backed)
```

No backend required for v1.

---

## 3. Frontend Framework (Strong Recommendation)

### ✅ **React + Vite**

**Why**

* Fast iteration
* Excellent component ecosystem
* Easy state orchestration
* Works extremely well with Cursor

**Do not** use:

* Next.js App Router (overkill)
* Heavy SSR frameworks (not needed)
* Low-code builders (kills nuance)

---

## 4. State Management (Critical)

### ✅ **Zustand**

This is important.

**Why Zustand is ideal for a simulator**

* Global simulation state is explicit
* Easy time-travel & resets
* Minimal boilerplate
* Deterministic updates

Redux is too verbose.
Local React state is too fragmented.

---

## 5. Simulation Engine (Core System)

### Approach

* **Pure in-memory state machine**
* No async dependencies
* No side effects except state transitions

### Key Concept

Time advances **only when the user moves the day slider**.

---

### Simulation Loop (Conceptual)

```
onDayAdvance():
  read currentDayState
  apply availability overrides
  recalc capacity
  burn down remaining points
  update forecasts
  append AI decision log
```

This makes the system:

* Predictable
* Debuggable
* Explainable

---

## 6. AI Layer (Important Distinction)

### V1: Rule-Based “AI”

Use deterministic heuristics:

* Capacity reduction
* Velocity adjustment
* Spillover detection
* Plain-English explanations

**Why**

* Builds trust
* Avoids hallucination
* Teaches the model clearly

---

### V2: Optional LLM Enhancement

When needed:

* OpenAI / Anthropic API
* Used ONLY for:

  * Epic → story breakdown
  * Natural-language explanations
  * “What changed and why” summaries

**Never** let LLMs mutate core state directly.

---

## 7. Visualization & Motion (Very Important)

### Charts & Timelines

* **Recharts** or **VisX**
* Deterministic rendering
* Simple animated transitions

### Motion

* **Framer Motion**

  * Day transitions
  * Task spillover animation
  * Confidence band tightening

Motion is not cosmetic — it conveys learning.

---

## 8. UI Framework

### ✅ Tailwind CSS

**Why**

* Fast layout iteration
* Consistent spacing
* Works well with Cursor
* Encourages system thinking

Optional:

* Shadcn/ui for base components (cards, sliders)

---

## 9. File & Module Structure (Conceptual)

```
/src
  /simulation
    simulationEngine.ts
    dayReestimator.ts
    velocityModel.ts
    decisionLog.ts

  /state
    simulationStore.ts
    teamStore.ts

  /screens
    TeamSetupScreen.tsx
    EpicBreakdownScreen.tsx
    DailySprintPlaybackScreen.tsx

  /components
    DayTimeline.tsx
    TeamAvailabilityPanel.tsx
    DailyRealityControls.tsx
    LivingDashboard.tsx
    AIDecisionLog.tsx
```

This separation keeps **thinking** separate from **rendering**.

---

## 10. Time Control Model (Key UX Feature)

### Timeline Scrubber

* Day-by-day (Mon–Fri)
* No skipping without recalculation
* Clear indication of “current simulated day”

### Reset / Replay

* Reset sprint
* Replay with different disruptions
* Compare runs (optional later)

This turns the app into a **learning lab**.

---

## 11. Data Persistence (Minimal)

### V1

* No persistence
* In-memory only
* Optional “Export scenario” as JSON

### V2

* LocalStorage or URL state
* Shareable simulations

Avoid backend until learning is validated.

---

## 12. Metrics Computation (Design Choice)

All metrics must be:

* Derived
* Deterministic
* Explainable

No black-box scores.

Example:

* Confidence % = function of variance + remaining capacity
* Velocity trend = rolling average, visible formula

---

## 13. Performance Requirements

* Handles 5–15 team members
* 20–40 stories
* Instant recalculation (<50ms per day advance)

Anything slower breaks the “scrub time” experience.

---

## 14. What to Avoid (Strong Opinions)

❌ Over-engineered backend
❌ Jira-style workflows
❌ Real user auth
❌ Fine-grained permissions
❌ Production-grade accuracy claims

This is a **simulator, not a contract**.

---

## 15. Why This Stack Is “Right” for Your POV

| Requirement     | Stack Fit        |
| --------------- | ---------------- |
| System thinking | React + Zustand  |
| Time simulation | Pure JS engine   |
| Visual learning | Framer Motion    |
| Explainable AI  | Rule-based core  |
| Fast iteration  | Vite + Tailwind  |
| Cursor-friendly | All of the above |

This stack lets you **teach a new operating model**, not ship a SaaS prematurely.

---

## 16. How to Hand This to Cursor (Exact Prompt)

When ready, paste this into Cursor:

> “Build an AI Sprint Simulator using React, Vite, Zustand, and Tailwind.
> This is a time-based simulation, not a task tool.
> Implement a daily re-estimation engine that recalculates capacity, velocity, ETA, and confidence as the user advances days.
> Prioritize clarity, explainability, and motion over CRUD.”

Cursor will do the rest.


