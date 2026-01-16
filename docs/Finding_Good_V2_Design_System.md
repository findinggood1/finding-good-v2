# Finding Good V2: Design System

**Version:** 1.0  
**Created:** January 11, 2026  
**Status:** Block 5 Complete  
**Purpose:** Unified visual language for all Finding Good tools

---

## Executive Summary

This design system ensures visual consistency across Predict Tool, Priority Builder, Proof Tool, Dashboard, and the Campfire (social layer). The aesthetic is **calm, grounded, and intentional** — reflecting the "narrative integrity" positioning.

**Design Philosophy:**
- Clarity over decoration
- Calm confidence, not urgency
- Tools that feel like a trusted space, not a productivity app
- Mobile-first for daily tools, desktop-optimized for coaching

---

## Part 1: Color System

### Core Palette

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-primary` | `#1B5666` | 27, 86, 102 | Brand headers, primary actions, links |
| `--color-primary-dark` | `#174552` | 23, 69, 82 | Hover states, emphasis |
| `--color-secondary` | `#678C95` | 103, 140, 149 | Buttons, secondary text, icons |
| `--color-secondary-light` | `#3C7181` | 60, 113, 129 | Borders, subtle accents |
| `--color-accent` | `#CBC13D` | 203, 193, 61 | Active states, selection, emphasis, success |
| `--color-background` | `#EDF2F2` | 237, 242, 242 | Page backgrounds |
| `--color-surface` | `#FFFFFF` | 255, 255, 255 | Cards, modals, input fields |
| `--color-text-primary` | `#1A1A1A` | 26, 26, 26 | Headlines, primary text |
| `--color-text-secondary` | `#4A5568` | 74, 85, 104 | Body text, descriptions |
| `--color-text-muted` | `#718096` | 113, 128, 150 | Hints, placeholders, captions |
| `--color-border` | `#D1D5DB` | 209, 213, 219 | Input borders, dividers |
| `--color-border-light` | `#E5E7EB` | 229, 231, 235 | Subtle dividers |

### FIRES Element Colors

Used for visualizing FIRES analysis results. These are semantic colors that overlay the brand palette.

| Element | Hex | Token | Usage |
|---------|-----|-------|-------|
| Feelings | `#E57373` | `--fires-feelings` | Red - emotional signals |
| Influence | `#64B5F6` | `--fires-influence` | Blue - agency/control |
| Resilience | `#81C784` | `--fires-resilience` | Green - handling difficulty |
| Ethics | `#FFD54F` | `--fires-ethics` | Yellow - purpose/values |
| Strengths | `#BA68C8` | `--fires-strengths` | Purple - capabilities |

**FIRES Display Rules:**
- Use at 100% opacity for badges, tags, and chart segments
- Use at 20% opacity for background highlights
- Always pair with the element name (accessibility)
- In text, use the brand palette — FIRES colors are for data visualization only

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#CBC13D` | Completion, positive feedback (uses accent) |
| `--color-warning` | `#F6AD55` | Caution, attention needed |
| `--color-error` | `#E53E3E` | Errors, destructive actions |
| `--color-info` | `#3C7181` | Informational messages |

### State Colors

| State | Background | Border | Text |
|-------|------------|--------|------|
| Default | `#FFFFFF` | `#D1D5DB` | `#1A1A1A` |
| Hover | `#EDF2F2` | `#678C95` | `#1A1A1A` |
| Active/Selected | `#CBC13D` at 15% | `#CBC13D` | `#1A1A1A` |
| Focus | `#FFFFFF` | `#1B5666` (2px) | `#1A1A1A` |
| Disabled | `#F3F4F6` | `#E5E7EB` | `#9CA3AF` |

---

## Part 2: Typography

### Font Stack

| Role | Font Family | Fallback | Weight |
|------|-------------|----------|--------|
| Brand/H1 | Fjord One | Georgia, serif | 700 (Bold) |
| Headers | Omnes | system-ui, sans-serif | 600 (Semibold) |
| Body | Outfit | system-ui, sans-serif | 300 (Light), 400 (Regular) |

**Web Font Loading:**
```css
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');

/* Fjord One - for brand headers */
@import url('https://fonts.googleapis.com/css2?family=Fjord+One&display=swap');

/* Omnes - if not available, use Outfit Semibold as fallback */
```

**Note:** Omnes is a commercial font. For V2 build, use Outfit at 600 weight as the H2 fallback unless Omnes is licensed.

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-brand` | 28px / 1.75rem | 1.2 | Fjord 700 | "Finding Good" wordmark |
| `--text-h1` | 24px / 1.5rem | 1.3 | Fjord 700 | Page titles, tool names |
| `--text-h2` | 20px / 1.25rem | 1.4 | Outfit 600 | Section headers |
| `--text-h3` | 18px / 1.125rem | 1.4 | Outfit 600 | Card titles, subsections |
| `--text-body` | 16px / 1rem | 1.6 | Outfit 400 | Primary body text |
| `--text-body-light` | 16px / 1rem | 1.6 | Outfit 300 | Secondary body text |
| `--text-small` | 14px / 0.875rem | 1.5 | Outfit 400 | Captions, helper text |
| `--text-xs` | 12px / 0.75rem | 1.4 | Outfit 400 | Labels, timestamps |

### Mobile Type Adjustments

| Token | Desktop | Mobile (< 640px) |
|-------|---------|------------------|
| `--text-brand` | 28px | 24px |
| `--text-h1` | 24px | 20px |
| `--text-h2` | 20px | 18px |
| `--text-h3` | 18px | 16px |

---

## Part 3: Spacing & Layout

### Spacing Scale

Based on 4px grid for precision, 8px base unit for consistency.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight spacing, icon gaps |
| `--space-2` | 8px | Compact element spacing |
| `--space-3` | 12px | Default inline spacing |
| `--space-4` | 16px | Standard component padding |
| `--space-5` | 20px | Medium gaps |
| `--space-6` | 24px | Section spacing |
| `--space-8` | 32px | Large section gaps |
| `--space-10` | 40px | Page section dividers |
| `--space-12` | 48px | Major layout breaks |
| `--space-16` | 64px | Page margins (desktop) |

### Container Widths

| Token | Width | Usage |
|-------|-------|-------|
| `--container-xs` | 320px | Mobile minimum |
| `--container-sm` | 480px | Narrow cards, modals |
| `--container-md` | 640px | Default content width |
| `--container-lg` | 768px | Wide content |
| `--container-xl` | 1024px | Dashboard layouts |
| `--container-max` | 1200px | Maximum page width |

### Breakpoints

| Name | Width | Target |
|------|-------|--------|
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktop |

### Layout Principles

**Mobile First:**
- All tools designed mobile-first
- Touch targets minimum 44px × 44px
- Bottom navigation for primary actions (thumb zone)
- Stack layouts vertically, expand horizontally on larger screens

**Desktop Enhancement:**
- Dashboard uses sidebar navigation
- Multi-column layouts at `lg` breakpoint
- Hover states and tooltips

---

## Part 4: Components

### Buttons

**Primary Button**
```css
.btn-primary {
  background: var(--color-primary); /* #1B5666 */
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: background 150ms ease;
}
.btn-primary:hover {
  background: var(--color-primary-dark); /* #174552 */
}
.btn-primary:active {
  background: var(--color-primary-dark); /* #174552 */
}
```

**Secondary Button (Outline)**
```css
.btn-secondary {
  background: transparent;
  color: var(--color-secondary);
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary);
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  transition: all 150ms ease;
}
.btn-secondary:hover {
  background: var(--color-secondary);
  color: white;
}
```

**Text Button**
```css
.btn-text {
  background: none;
  color: var(--color-primary);
  padding: 8px 12px;
  border: none;
  font-weight: 500;
  text-decoration: underline;
}
```

**Button Sizes**
| Size | Padding | Font Size | Min Height |
|------|---------|-----------|------------|
| Small | 8px 16px | 14px | 36px |
| Default | 12px 24px | 16px | 44px |
| Large | 16px 32px | 18px | 52px |

### Cards

**Standard Card**
```css
.card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
```

**Interactive Card** (clickable)
```css
.card-interactive {
  /* base card styles */
  cursor: pointer;
  transition: box-shadow 150ms ease, transform 150ms ease;
}
.card-interactive:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
```

**Highlighted Card** (selected/active)
```css
.card-highlighted {
  /* base card styles */
  border: 2px solid var(--color-accent);
  background: rgba(203, 193, 61, 0.08);
}
```

### Form Elements

**Text Input**
```css
.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  background: var(--color-surface);
  transition: border-color 150ms ease;
}
.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(27, 86, 102, 0.1);
}
.input::placeholder {
  color: var(--color-text-muted);
}
```

**Textarea**
```css
.textarea {
  /* Same as input */
  min-height: 120px;
  resize: vertical;
  line-height: 1.6;
}
```

**Select**
```css
.select {
  /* Same as input */
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* chevron icon */
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}
```

**Radio/Checkbox (Selection Cards)**

For FIRES questions and multi-choice, use selection cards instead of native controls:
```css
.selection-card {
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease;
}
.selection-card:hover {
  border-color: var(--color-secondary);
  background: var(--color-background);
}
.selection-card.selected {
  border-color: var(--color-accent);
  background: rgba(203, 193, 61, 0.1);
}
```

### Progress Indicators

**Step Progress** (for multi-step flows)
```
[1]----[2]----[3]----[4]----[5]
 ●──────●──────○──────○──────○
```
- Completed: `var(--color-accent)` filled circle
- Current: `var(--color-primary)` filled circle with pulse animation
- Upcoming: `var(--color-border)` hollow circle
- Connector line: `var(--color-border-light)`, changes to `var(--color-accent)` when passed

**Score Display**
```css
.score-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 48px;
  border-radius: 50%;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 18px;
}
.score-badge.low { /* 1-2 */
  background: #FEE2E2;
  color: #991B1B;
}
.score-badge.medium { /* 3 */
  background: #FEF3C7;
  color: #92400E;
}
.score-badge.high { /* 4-5 */
  background: rgba(203, 193, 61, 0.2);
  color: #1B5666;
}
```

### FIRES Visualization

**FIRES Badge**
```css
.fires-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}
.fires-badge.feelings {
  background: rgba(229, 115, 115, 0.2);
  color: #C62828;
}
/* ... repeat for each element */
```

**FIRES Bar Chart** (for zone visualization)
```
Feelings     ████████░░░░  67%
Influence    ██████████░░  83%
Resilience   ██████░░░░░░  50%
Ethics       ████████████  100%
Strengths    ████░░░░░░░░  33%
```

### Navigation

**Top Bar (Mobile)**
```css
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
}
```

**Bottom Navigation (Mobile - Tools)**
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
}
.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--color-text-muted);
  font-size: 12px;
}
.bottom-nav-item.active {
  color: var(--color-primary);
}
```

**Sidebar (Desktop - Dashboard)**
```css
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 240px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border-light);
  padding: 24px 0;
}
```

---

## Part 5: Page Layouts

### Tool Flow Layout (Predict, Priority, Proof)

Mobile-first, centered content:

```
┌─────────────────────────────────────┐
│  [←]     Finding Good      [?]      │  ← Top bar
├─────────────────────────────────────┤
│                                     │
│         ┌───────────────┐           │
│         │  Tool Name    │           │  ← Serif H1
│         │  Tagline      │           │
│         └───────────────┘           │
│                                     │
│  ○ ── ○ ── ● ── ○ ── ○              │  ← Progress
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │     Question / Content      │    │  ← Card
│  │                             │    │
│  │     [Input Area]            │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│         [Continue Button]           │
│                                     │
└─────────────────────────────────────┘
```

**Max content width:** 640px (centered)
**Card padding:** 24px
**Vertical rhythm:** 24px between major elements

### Dashboard Layout

Desktop-first, sidebar + main content:

```
┌────────────┬────────────────────────────────────────────┐
│            │  [Search]              [Notifications] [⚙] │
│  Finding   ├────────────────────────────────────────────┤
│  Good      │                                            │
│            │  Welcome back, Brian                       │
│  ─────     │                                            │
│            │  ┌──────────────────┐ ┌──────────────────┐ │
│  Overview  │  │ Prediction 1     │ │ Prediction 2     │ │
│  Clients   │  │ Score: 72        │ │ Score: 58        │ │
│  Campfire  │  └──────────────────┘ └──────────────────┘ │
│  Maps      │                                            │
│  Settings  │  Recent Activity                           │
│            │  ┌────────────────────────────────────────┐│
│            │  │ Priority confirmed • 2h ago            ││
│            │  │ Proof captured • Yesterday             ││
│            │  └────────────────────────────────────────┘│
└────────────┴────────────────────────────────────────────┘
```

**Sidebar width:** 240px (collapsible on tablet)
**Main content max width:** 1024px
**Grid:** 12-column, 24px gutters

### Results/Output Layout

Structured display of AI analysis:

```
┌─────────────────────────────────────┐
│         Your Results                │
├─────────────────────────────────────┤
│                                     │
│  Predictability Score               │
│  ┌─────────────────────────────┐    │
│  │     ●●●●●●●○○○  72/100      │    │
│  └─────────────────────────────┘    │
│                                     │
│  ─────────────────────────────      │
│                                     │
│  FIRES Analysis                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ...       │
│  │  F  │ │  I  │ │  R  │           │
│  │ 4/5 │ │ 3/5 │ │ 5/5 │           │
│  └─────┘ └─────┘ └─────┘           │
│                                     │
│  ─────────────────────────────      │
│                                     │
│  Key Insight                        │
│  "Your resilience is strong..."     │
│                                     │
│  ─────────────────────────────      │
│                                     │
│  [Share to Campfire]  [Download]    │
│                                     │
└─────────────────────────────────────┘
```

---

## Part 6: Campfire (Social Layer)

### Design Philosophy

The Campfire is **not** a social media feed. It's a space for:
- Sharing important moments with people who matter
- Getting and giving inspiration
- Witnessing others' integrity work

**Visual Differentiation from Social Media:**
- No infinite scroll (paginated or limited display)
- No metrics obsession (no like counts, just presence)
- No algorithmic sorting (chronological only)
- Warm, intimate aesthetic (not clinical or attention-grabbing)

### Campfire Entry Card

```
┌─────────────────────────────────────┐
│  ○ Sarah M.              2 hours ago│
│                                     │
│  "Made progress on my presentation  │
│  by breaking it into smaller chunks.│
│  Felt relief when I stopped trying  │
│  to do it all at once."             │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🔥 Resilience  💡 Influence │    │  ← FIRES detected
│  └─────────────────────────────┘    │
│                                     │
│  Working on: Quarterly Review       │  ← Prediction context
│                                     │
└─────────────────────────────────────┘
```

**Card styling:**
- Softer shadows than standard cards
- Slightly warmer background tint
- No hard borders
- Avatar or initial, not profile pictures

### Reactions (v2.0.5)

Minimal, meaningful reactions — not "likes":

| Emoji | Meaning | When to use |
|-------|---------|-------------|
| 🔥 | "That resonates" | Strong connection to the share |
| 💡 | "I learned something" | Insight gained |
| 🙌 | "I see you" | Acknowledgment, witnessing |

**Implementation:**
- Tap to react (toggle)
- Show reaction count subtly: "🔥 3"
- No notifications by default (opt-in for v2.0.5)

### Campfire in Dashboard

```
┌─────────────────────────────────────┐
│  🔥 Campfire                        │
│                                     │
│  What's inspiring your circle       │  ← Warm intro text
│                                     │
│  ┌─────────────────────────────┐    │
│  │  [Entry Card 1]             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  [Entry Card 2]             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  [Entry Card 3]             │    │
│  └─────────────────────────────┘    │
│                                     │
│  [View more from your circle →]     │
│                                     │
└─────────────────────────────────────┘
```

### Empty State

When user has no Campfire connections yet:

```
┌─────────────────────────────────────┐
│                                     │
│          🔥                         │
│                                     │
│    Your Campfire is waiting         │
│                                     │
│    When you ask someone what        │
│    mattered to them, or share       │
│    what mattered to you, they       │
│    become part of your circle.      │
│                                     │
│    [Confirm what mattered today]    │
│                                     │
└─────────────────────────────────────┘
```

---

## Part 7: Tool-Specific Patterns

### Predict Tool

**Entry Point:**
- Clear value proposition: "See how ready you are to succeed"
- Option to select existing prediction or create new
- Max 3 active predictions enforced in UI

**Question Flow:**
- One question per screen (mobile)
- Large textarea for open responses
- Helper text expandable (not always visible)
- Progress clearly visible

**Results:**
- Predictability Score prominent
- FIRES breakdown expandable
- Connection suggestions based on gaps
- Clear CTA: "Start building evidence with Priority Builder"

### Priority Builder

**Daily Entry:**
- Prediction selector at top (which goal/challenge?)
- Three core questions with helper framings
- Helper framings as clickable chips, not dropdown
- Quick path: ~2 minutes

**Ask Flow:**
- After self-confirmation, prompt: "Who else should claim what mattered today?"
- Simple name/email entry
- Preview of what they'll receive
- Share via link or email

**Completion:**
- Priority Line displayed prominently
- Option to share to Campfire
- Streak/consistency indicator (subtle)

### Proof Tool

**Mode Selection:**
- Three clear paths: Self / Request / Send
- Visual distinction between modes
- "Self" as default, others clearly secondary

**Self Flow:**
- Goal/challenge context
- Intensity selection (Light / Balanced / Deeper)
- Questions scaled to intensity
- AI analysis at end

**Results:**
- Scores with rubric explainers
- FIRES extraction
- Proof Line (shareable summary)
- Pattern recognition
- CTA: Share to Campfire or request external perspective

### Dashboard

**Client Selection (Coach View):**
- Client cards show: Name, primary prediction, predictability score, last activity
- Sort by: Last active, Score (low to high), Alphabetical
- Quick filters: Active this week, Needs attention

**Client Detail:**
- Predictions as primary navigation
- Activity feeds under each prediction
- FIRES signals aggregated across tools
- Coach notes inline

**User Dashboard:**
- My Predictions as hero section
- Campfire feed
- Integrity Map access
- Quick actions: Confirm priority, Capture proof

---

## Part 8: Motion & Animation

### Principles

- **Purposeful:** Animation should guide attention or provide feedback
- **Subtle:** Nothing that distracts from the content
- **Fast:** Most transitions under 200ms
- **Respectful:** Honor reduced-motion preferences

### Standard Transitions

| Element | Duration | Easing |
|---------|----------|--------|
| Button hover | 150ms | ease-out |
| Card hover | 150ms | ease-out |
| Modal open | 200ms | ease-out |
| Modal close | 150ms | ease-in |
| Page transition | 200ms | ease-in-out |
| Accordion expand | 200ms | ease-out |

### Specific Animations

**Score Reveal:**
```css
@keyframes score-count-up {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
/* 300ms duration, triggered when score appears */
```

**Progress Step Complete:**
```css
@keyframes step-complete {
  0% { background-color: var(--color-primary); }
  50% { background-color: var(--color-accent); transform: scale(1.2); }
  100% { background-color: var(--color-accent); transform: scale(1); }
}
/* 400ms duration */
```

**Campfire Entry Appear:**
```css
@keyframes campfire-entry {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
/* 200ms duration, staggered for multiple entries */
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Part 9: Accessibility

### Requirements

- **WCAG 2.1 AA compliance** minimum
- All interactive elements keyboard accessible
- Focus indicators visible (2px primary color outline)
- Color contrast ratios:
  - Normal text: 4.5:1 minimum
  - Large text: 3:1 minimum
  - UI components: 3:1 minimum

### Color Contrast Verification

| Combination | Ratio | Pass |
|-------------|-------|------|
| Primary (#1B5666) on Background (#EDF2F2) | 5.8:1 | ✓ AA |
| Primary (#1B5666) on White | 6.9:1 | ✓ AAA |
| Secondary (#678C95) on White | 3.4:1 | ✓ Large text |
| Text Primary (#1A1A1A) on White | 16.1:1 | ✓ AAA |
| Text Primary (#1A1A1A) on Background (#EDF2F2) | 13.5:1 | ✓ AAA |
| Accent (#CBC13D) on White | 1.8:1 | ✗ Text only |

**Note:** Accent yellow should not be used for text. Use for backgrounds, borders, and icons only.

### Form Accessibility

- Labels always visible (no placeholder-only inputs)
- Error messages associated with inputs via `aria-describedby`
- Required fields marked with text, not just asterisk
- Focus management in multi-step flows

### Screen Reader Considerations

- Semantic HTML (proper heading hierarchy)
- ARIA labels for icon-only buttons
- Live regions for dynamic content (scores, feedback)
- Skip links for navigation

---

## Part 10: Implementation Notes

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'fg-primary': '#1B5666',
        'fg-primary-dark': '#174552',
        'fg-secondary': '#678C95',
        'fg-secondary-light': '#3C7181',
        'fg-accent': '#CBC13D',
        'fg-background': '#EDF2F2',
        'fg-surface': '#FFFFFF',
        'fires-feelings': '#E57373',
        'fires-influence': '#64B5F6',
        'fires-resilience': '#81C784',
        'fires-ethics': '#FFD54F',
        'fires-strengths': '#BA68C8',
      },
      fontFamily: {
        'brand': ['Fjord One', 'Georgia', 'serif'],
        'heading': ['Outfit', 'system-ui', 'sans-serif'],
        'body': ['Outfit', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'brand': ['1.75rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h1': ['1.5rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h2': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h3': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'input': '8px',
        'badge': '16px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'focus': '0 0 0 3px rgba(27, 86, 102, 0.1)',
      },
    },
  },
}
```

### Component Library Approach

**Recommendation:** Build a small shared component library that all tools import:

```
/packages
  /fg-ui
    /components
      Button.tsx
      Card.tsx
      Input.tsx
      Select.tsx
      Progress.tsx
      FiresBadge.tsx
      ScoreBadge.tsx
      CampfireCard.tsx
    /styles
      tokens.css
      base.css
    index.ts
```

This ensures consistency and reduces duplication across Predict, Priority, Proof, and Dashboard.

### Image Assets Needed

| Asset | Format | Sizes | Usage |
|-------|--------|-------|-------|
| Logo (wordmark) | SVG | N/A | Headers |
| Logo (icon only) | SVG, PNG | 32, 64, 128, 512 | Favicons, app icons |
| FIRES icons | SVG | N/A | Element indicators |
| Empty state illustrations | SVG | N/A | Onboarding, empty states |
| Campfire icon | SVG | N/A | Campfire section |

---

## Part 11: Design Checklist for V2 Build

### Per-Tool Checklist

- [ ] Typography follows system (Fjord for brand/H1, Outfit for body)
- [ ] Colors match palette (no hardcoded values)
- [ ] Buttons use standard sizes and styles
- [ ] Form elements consistent
- [ ] Cards use standard padding and radius
- [ ] FIRES display uses semantic colors
- [ ] Progress indicators follow pattern
- [ ] Mobile layout works at 320px width
- [ ] Touch targets 44px minimum
- [ ] Focus states visible
- [ ] Reduced motion respected

### Campfire-Specific Checklist

- [ ] Entry cards distinct from standard cards (warmer feel)
- [ ] No metric obsession (counts subtle or hidden)
- [ ] Chronological order only
- [ ] Empty state encouraging, not guilt-inducing
- [ ] Reactions minimal and meaningful
- [ ] Clear what's shared vs. private

### Dashboard-Specific Checklist

- [ ] Predictions prominently displayed
- [ ] Activity feeds scannable
- [ ] Coach view distinct from user view
- [ ] Client list sortable and filterable
- [ ] Integrity Map accessible
- [ ] Settings clearly organized

---

## Appendix: Quick Reference

### Color Tokens
```
Primary:      #1B5666
Primary Dark: #174552
Secondary:    #678C95
Accent:       #CBC13D
Background:   #EDF2F2
Surface:      #FFFFFF
```

### Type Quick Reference
```
Brand/H1: Fjord One Bold, 24-28px
H2: Outfit Semibold, 20px
H3: Outfit Semibold, 18px
Body: Outfit Light/Regular, 16px
Small: Outfit Regular, 14px
```

### Spacing Quick Reference
```
Tight: 4px
Compact: 8px
Default: 16px
Section: 24px
Large: 32px
Page: 48-64px
```

---

**Document Status:** Block 5 COMPLETE  
**Next Step:** Block 6 — Build Planning + Sequencing  
**Created:** January 11, 2026
