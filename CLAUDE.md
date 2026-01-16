# CLAUDE.md - Finding Good V2 Monorepo

**⚠️ FIRST: Read `CLAUDE_RULES.md` for session rules and learned patterns.**

This file helps Claude understand the project structure and current state.

## Project Overview

Finding Good is Brian Fretwell's Narrative Integrity coaching platform.
- **Business model:** Speaking engagements + high-ticket coaching ($6-8k/month)
- **Core belief:** Everything a person needs is already within them - it just needs drawn out

## Framework: Prioritize → Prove → Predict

The tools follow Brian's methodology:
1. **Priority** - Name what actually matters
2. **Prove** - Own the actions that created outcomes
3. **Predict** - Align with others on what's coming
4. **Together** - Community layer that makes solo tools social

## Monorepo Structure

```
apps/
├── dashboard/    Port 3001 - Coach view (dashboard.findinggood.com)
├── priority/     Port 3002 - Priority Builder (priority.findinggood.com)
├── prove/        Port 3003 - Prove Tool (proof.findinggood.com)
├── predict/      Port 3004 - Predict Tool (predict.findinggood.com)
└── together/     Port 3005 - Client community (together.findinggood.com)

packages/
└── shared/       Shared auth, UI components, types

supabase/         Database migrations (single Supabase instance)
docs/             Specs and documentation
```

## Key Commands

```bash
# Run all apps locally
pnpm dev

# Run specific app
cd apps/dashboard && pnpm dev

# Install dependencies
pnpm install
```

## Database

All apps share one Supabase instance. Key tables:
- `clients` - Coaching clients
- `snapshots` - FIRES assessments
- `predictions` - Predict tool entries
- `validations` - Prove tool entries
- `priorities` - Priority entries (renamed from impact_verifications)
- `outcome_predictions` - New table for prove tool predictions

## Current State (January 2026)

- Migration to monorepo complete
- All 5 apps deployed and working
- Enterprise readiness in progress

## Source of Truth

Read `docs/Finding_Good_Source_of_Truth_v3.md` for full methodology.

## Development Rules

Read `DEVELOPMENT.md` for git workflow, commit conventions, and session guidelines.

## Starting a Claude Session

1. Read this file (CLAUDE.md)
2. Run `git status` to see current state
3. Run `git log --oneline -5` to see recent work
4. Ask Brian what he wants to work on
5. Follow DEVELOPMENT.md for workflow

## Session Handoff

If context is running low or ending a session:
1. Commit all working code
2. Update CURRENT_WORK.md with status (create if needed)
3. Push to GitHub
4. Tell Brian what's done and what's next
