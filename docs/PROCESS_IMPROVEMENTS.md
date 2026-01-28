# Process Improvements Tracker

**Purpose:** Track ideas for improving our build process  
**Rule:** Add ideas here, evaluate periodically, implement when timing is right

---

## Active Improvements

*Improvements we're currently implementing or have implemented.*

| Improvement | Status | Date | Notes |
|-------------|--------|------|-------|
| Collaboration Protocol doc | ✅ Done | Jan 27, 2026 | `docs/COLLABORATION_PROTOCOL.md` |
| Handoff template | ✅ Done | Jan 27, 2026 | `docs/handoffs/TEMPLATE.md` |
| Test personas documentation | ✅ Done | Jan 27, 2026 | `docs/testing/TEST_PERSONAS.md` |
| Checkpoint workflow | ✅ Done | Jan 27, 2026 | Documented in protocol |

---

## Queued Improvements

*Improvements we've decided to do but haven't started yet.*

| Improvement | Priority | Effort | Payoff | Notes |
|-------------|----------|--------|--------|-------|
| Dev database clone | High | Medium | High | Separate Supabase project for dev/testing — do after Phase B/C stable |
| Test data seeding script | High | Medium | High | SQL script to populate dev DB with personas (needs dev DB first) |
| Component inventory doc | Medium | Low | Medium | Document what exists in @finding-good/shared |
| Pre-flight automation | Low | Medium | Medium | Script that runs all checks before build |
| HomePage visual design pass | Medium | High | High | Make Home page emotionally engaging — colors, celebration states, reduce whitespace |

---

## Ideas to Evaluate

*Ideas that might be good but need more thought.*

| Idea | Type | Questions to Answer |
|------|------|---------------------|
| Visual regression testing | Tool | Which tool? Worth the setup? |
| Build packet generator | Script | Can we auto-generate from specs? |
| Storybook for components | Tool | Would we actually use it? |
| E2E tests for critical paths | Tests | Playwright? Cypress? Which paths? |
| Database migration versioning | Process | Do we need more than what we have? |
| AI-assisted code review | Process | Can Desktop Claude review PRs? |
| Vercel MCP integration | Tool | Pause/resume deploys during builds? Worth setup vs manual pause or feature branches? |

---

## Rejected/Deferred Ideas

*Ideas we considered but decided against (with reasoning).*

| Idea | Reason Deferred |
|------|-----------------|
| (none yet) | |

---

## How to Add Ideas

When you notice friction or opportunity:

1. Add to "Ideas to Evaluate" with a brief description
2. Note what questions need answering
3. During a planning session, evaluate and move to Queued or Rejected
4. When implementing, move to Active with status updates

---

## Evaluation Criteria

When deciding whether to implement:

| Factor | Weight | Questions |
|--------|--------|-----------|
| **Payoff** | High | Will this save significant time/errors over 10+ sessions? |
| **Effort** | Medium | Can we do this in < 1 hour? Or is it a project? |
| **Risk** | Medium | Could this break things or add complexity? |
| **Timing** | Low | Is now the right time, or after current phase? |

**Rule:** Bias toward "better" over "faster" — we want sustainable improvements.

---

## Recent Observations

*Quick notes from recent sessions that might become improvements.*

**Jan 27, 2026 (Phase A):**
- Checkpoint workflow worked well — validation caught the Map/Chat locking issue (role-based, not a bug)
- Having naming concordance doc prevented confusion
- Desktop reading code + Brian testing UI is good separation
- Claude Code's Supabase MCP access is powerful — could do more schema verification upfront

---

## MCP/Tool Opportunities

*Tools or MCPs that might help.*

| Tool/MCP | What It Could Do | Status |
|----------|------------------|--------|
| Supabase MCP | ✅ Already have — schema queries, migrations | Active |
| GitHub MCP | ✅ Already have — commits, pushes | Active |
| Browser MCP | Could automate UI testing? | Explore |
| Linear/Jira MCP | Track tasks programmatically? | Not needed yet |
| Figma MCP | Pull designs directly? | Not needed yet |

---

**End of Process Improvements Tracker**
