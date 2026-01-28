# Finding Good V2: Feature Tracker

**Purpose:** Single source of truth for ALL features. If it's not here, it doesn't exist.  
**Rule:** Check this before starting ANY phase. Update when features complete.  
**Last Updated:** January 28, 2026 (Added Phase F.0)

---

## How To Use This Document

1. **Before creating a phase plan:** Check which features are "Not Assigned"
2. **When creating a phase plan:** Move features to that phase, update status to "Planned"
3. **When building:** Update status to "In Progress"
4. **When complete:** Update status to "Complete" with date
5. **If scope changes:** Update notes, don't delete features

---

## Feature Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Complete | Built and working |
| 🔨 In Progress | Currently being built |
| 📋 Planned | Assigned to a phase |
| ⏳ Not Assigned | Needs a phase |
| ❌ Cut | Explicitly removed (with reason) |

---

## PART 1: NAVIGATION & STRUCTURE

**Source:** V2 Spec Part 2, Navigation Restructure v1

| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| Sidebar with Four I's dropdowns | A | ✅ Complete | |
| Home route (/) | A | ✅ Complete | |
| Campfire route (/campfire) | A | ✅ Complete | |
| Exchange route (/exchange) | A | ✅ Complete | |
| Impact landing (/impact) | C | ✅ Complete | |
| Impact self (/impact/self) | C | ✅ Complete | |
| Impact others (/impact/others) | F | 📋 Planned | Wizard needed |
| Improve landing (/improve) | C | ✅ Complete | |
| Improve self (/improve/self) | C | ✅ Complete | |
| Improve others (/improve/others) | F | 📋 Planned | Wizard needed |
| Inspire landing (/inspire) | C | ✅ Complete | |
| Inspire self (/inspire/self) | C | ✅ Complete | |
| Inspire others (/inspire/others) | C | ✅ Complete | Full wizard |
| Map route (/map) | B | ✅ Complete | Analytics moved here |
| Chat route (/chat) | I | 📋 Planned | AI discovery page |
| Profile route (/profile) | J | 📋 Planned | Needs settings |
| Learn route (/learn) | — | ⏳ Not Assigned | Placeholder exists |
| Old route redirects | A | ✅ Complete | priority→impact, etc |

---

## PART 2: HOME PAGE

**Source:** V2 Spec Part 3-4, Navigation Restructure Part 4

### Your Influence Section
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| Permission display + edit | B | ✅ Complete | |
| Practice display + edit | B | ✅ Complete | |
| Focus items display + edit | B | ✅ Complete | |
| Link to Predict goal | — | ⏳ Not Assigned | "Supporting: [goal]" |

### Daily Check-in
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| Focus item checkboxes | B | ✅ Complete | |
| Engagement rating (1-5) | B | ✅ Complete | |
| Reflection question | B | ✅ Complete | |
| Answer saves to DB | B | ✅ Complete | daily_reflections table |
| **Bridge question logic** | H | 📋 Planned | "What made it land?" |
| **Bridge → Priority pre-fill** | H | 📋 Planned | Flow into Priority |
| **Week history calendar** | H | 📋 Planned | ✓/○ per day |
| **Weekly engagement averages** | H | 📋 Planned | Per focus item |

### Circle Tracker
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| **Show circle members** | G | 📋 Planned | Who's in your circle |
| **Check-in status (✓/○)** | G | 📋 Planned | Who checked in today |
| **Show their Permission** | G | 📋 Planned | What they're working on |
| **"Inspire me" button** | G | 📋 Planned | Gentle nudge |
| **user_circles table** | G | 📋 Planned | Database |

### Notifications Section
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| **Notifications display** | G | 📋 Planned | List of pending items |
| **Recognition notifications** | G | 📋 Planned | "Sarah recognized you" |
| **Ask notifications** | G | 📋 Planned | "Elena is asking..." |
| **Response notifications** | G | 📋 Planned | "David responded" |
| **Click → scroll to item** | G | 📋 Planned | Navigation |
| **[Clear] button** | G | 📋 Planned | Mark as read |
| **notifications table** | G | 📋 Planned | Database |

### This Week Section
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| Active predictions display | B | ✅ Complete | |
| Evidence counts | B | ✅ Complete | |
| Progress indicators | B | ✅ Complete | |

### Recent Activity Section
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| Sent entries display | B | ✅ Complete | |
| Received entries display | B | ✅ Complete | |

### Insights Section
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| Rule-based messages | B | ✅ Complete | |
| AI-generated insights | K | 📋 Planned | Coached only |

---

## PART 3: CAMPFIRE FEED

**Source:** V2 Spec Part 3

| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| Feed display | Jan 17 | ✅ Complete | Earlier build |
| Feed card component | Jan 17 | ✅ Complete | |
| FIRES badge on cards | Jan 17 | ✅ Complete | |
| **Recognition counts** | G | 📋 Planned | "👏 3 recognized" |
| **[👏 Recognize] button** | G | 📋 Planned | One-click action |
| **recognitions table** | G | 📋 Planned | Database |
| Empty state CTA | Jan 17 | ✅ Complete | |

---

## PART 4: EXCHANGE

**Source:** V2 Spec Part 6 (Navigation Restructure)

| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| Partners list | D | ✅ Complete | |
| Pending invitations | D | ✅ Complete | |
| Invite flow | D | ✅ Complete | Inline in list |
| Partnership detail view | D | ✅ Complete | |
| Partner's Influence display | D | ✅ Complete | |
| Mutual activity display | D | ✅ Complete | |
| exchange_partnerships table | D | ✅ Complete | |

---

## PART 5: TOOL LANDING PAGES

**Source:** Navigation Restructure Part 5

| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| ToolLandingPage component | C | ✅ Complete | Reusable |
| Impact landing content | C | ✅ Complete | |
| Improve landing content | C | ✅ Complete | |
| Inspire landing content | C | ✅ Complete | |
| Recent entries on landing | C | ✅ Complete | |
| Self/Others card navigation | C | ✅ Complete | |

---

## PART 6: IMPACT TOOL

**Source:** V2 Spec, Priority/Proof Build Spec

### Impact Self (was Priority)
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| Entry form | — | ✅ Complete | Existing Priority |
| Branding update | C | ✅ Complete | |
| FIRES extraction | — | ✅ Complete | Existing |
| Share to feed toggle | — | ⏳ Not Assigned | |

### Impact Others (Recognize) — Now "Impacts Others"
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| **WHO step** | F | ✅ Complete | Name + email + relationship |
| **WHAT step** | F | ✅ Complete | What they did |
| **MEANING step** | F | ✅ Complete | What it showed |
| **IMPACT step** | F | ✅ Complete | How it affected you |
| **PREVIEW step** | F | ✅ Complete | Review + share toggle |
| **COMPLETE step** | F | ✅ Complete | Share link |
| **Recipient view page** | F | ✅ Complete | /impacts/view/:shareId |
| **Thank button** | F | ✅ Complete | Acknowledge receipt |
| **Dual FIRES extraction** | F.5 | 📋 Future | Sender + recipient (AI) |
| **Clarity grade** | F.5 | 📋 Future | ○○○ / ●●○ / ●●● (AI) |
| **Go deeper question** | F.5 | 📋 Future | AI follow-up |

---

## PART 7: IMPROVE TOOL

**Source:** V2 Spec, Priority/Proof Build Spec

### Improve Self (was Proof)
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| Entry form | — | ✅ Complete | Existing Proof |
| Branding update | C | ✅ Complete | |
| FIRES extraction | — | ✅ Complete | Existing |
| Share to feed toggle | — | ⏳ Not Assigned | |

### Improve Others (Witness) — Now "Insights Others"
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| **WHO step** | F | ✅ Complete | Name + email + relationship |
| **OUTCOME step** | F | ✅ Complete | What they accomplished |
| **PROCESS step** | F | ✅ Complete | How they did it |
| **KEY MOVE step** | F | ✅ Complete | Decision that stood out |
| **IMPACT step** | F | ✅ Complete | The effect |
| **PREVIEW step** | F | ✅ Complete | Review + share toggle |
| **COMPLETE step** | F | ✅ Complete | Share link |
| **Recipient view page** | F | ✅ Complete | /insights/view/:shareId |
| **Thank button** | F | ✅ Complete | Acknowledge receipt |
| **Recipe output** | F | ✅ Complete | UI ready (AI fills later) |
| **Dual FIRES extraction** | F.5 | 📋 Future | Sender + recipient (AI) |

---

## PART 8: INSPIRE TOOL

**Source:** V2 Spec, Predict Build Spec

### Inspire Self (was Predict)
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| Entry form | — | ✅ Complete | Existing Predict |
| Branding update | C | ✅ Complete | |
| FIRES assessment | — | ✅ Complete | Existing |
| Share to feed toggle | — | ⏳ Not Assigned | |

### Inspire Others (Believe)
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| WHO step | C | ✅ Complete | |
| WHAT step | C | ✅ Complete | Belief statement |
| WHY step | C | ✅ Complete | Reason/evidence |
| PREVIEW step | C | ✅ Complete | |
| COMPLETE step | C | ✅ Complete | |
| Recipient view page | C | ✅ Complete | |
| Thank button | C | ✅ Complete | |
| inspire_others table | C | ✅ Complete | |

---

## PART 9: MAP PAGE (Coached)

**Source:** V2 Spec Part 6

### Currently Built
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| Predictability card | B | ✅ Complete | Moved from Home |
| FIRES grid | B | ✅ Complete | Moved from Home |
| Activity counts | Jan 17 | ✅ Complete | |
| Yours vs Others chart | Jan 17 | ✅ Complete | Basic version |

### AI Features (Coached Only)
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| **"What's Emerging"** | K | 📋 Planned | AI theme extraction |
| **Theme badges** | K | 📋 Planned | "🔥 Transparency 8x" |
| **Trend indicators** | K | 📋 Planned | "📈 Increasing" |
| **Discovery question** | K | 📋 Planned | "What makes it stick?" |
| **"You vs Others" enhanced** | K | 📋 Planned | Gap analysis |
| **"The Thread"** | K | 📋 Planned | AI narrative synthesis |
| **map-themes-extract function** | K | 📋 Planned | Edge function |
| **map-thread-generate function** | K | 📋 Planned | Edge function |

---

## PART 10: CHAT PAGE (Coached)

**Source:** V2 Spec Part 7

| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| **Chat page UI** | I | 📋 Planned | |
| **Suggested questions** | I | 📋 Planned | "What patterns..." |
| **Message input + send** | I | 📋 Planned | |
| **Chat history display** | I | 📋 Planned | |
| **chat_conversations table** | I | 📋 Planned | Database |
| **chat-discovery function** | I | 📋 Planned | Edge function |
| **Access user's data** | I | 📋 Planned | Priorities, proofs, etc |
| **Lock for non-coached** | I | 📋 Planned | Preview state |

---

## PART 11: PROFILE PAGE

**Source:** V2 Spec Part 9

### Account Section
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| Email display | — | ✅ Complete | Basic exists |
| Email change | J | 📋 Planned | |
| Password change | J | 📋 Planned | |
| Sign out | — | ✅ Complete | |

### Coach Connection
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| **Coach name display** | J | 📋 Planned | "Connected to: Brian" |
| **Connection date** | J | 📋 Planned | "Since: Jan 15" |
| **Week progress** | J | 📋 Planned | "Week 6 of 12" |
| **[Manage] button** | J | 📋 Planned | |

### Notification Preferences
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| **Email on recognition** | J | 📋 Planned | Toggle |
| **Email on ask** | J | 📋 Planned | Toggle |
| **Daily reminder** | J | 📋 Planned | Toggle + time |
| **Weekly summary** | J | 📋 Planned | Toggle |
| **notification_preferences column** | J | 📋 Planned | JSONB |

### Privacy Controls
| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| **Coach sees check-ins** | J | 📋 Planned | Toggle |
| **Coach sees priorities** | J | 📋 Planned | Toggle |
| **Coach sees proofs** | J | 📋 Planned | Toggle |
| **Coach sees recognition** | J | 📋 Planned | Toggle |
| **Hide individual entries** | J | 📋 Planned | 👁️ icon |
| **privacy_settings column** | J | 📋 Planned | JSONB |

---

## PART 12: MY FOCUS

**Source:** V2 Spec Part 8

| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| Focus display | B | ✅ Complete | In Home |
| Focus edit | B | ✅ Complete | Inline |
| Permission display/edit | B | ✅ Complete | In Home |
| Practice display/edit | B | ✅ Complete | In Home |
| Link to Predict goal | — | ⏳ Not Assigned | |
| **Focus history** | J | 📋 Planned | Evolution tracking |
| **focus_history table** | J | 📋 Planned | Database |

---

## PART 13: DASHBOARD (Coach View)

**Source:** Dashboard V2 Spec

| Feature | Phase | Status | Notes |
|---------|-------|--------|-------|
| Client list | E | ✅ Complete | |
| Engagement indicators | E | ✅ Complete | |
| YOUR INFLUENCE section | E | ✅ Complete | Per client |
| Quick Prep section | E | ✅ Complete | |
| Activity feed | E | ✅ Complete | V2 naming |
| Impact tab | E | ✅ Complete | |
| Improve tab | E | ✅ Complete | |
| Inspire tab | E | ✅ Complete | |
| **Sent/received in tabs** | E.5 | 📋 Planned | |
| **Upload file → Notes** | E.5 | 📋 Planned | |

---

## PART 14: DATABASE TABLES

| Table | Phase | Status | Notes |
|-------|-------|--------|-------|
| daily_reflections | B | ✅ Complete | |
| exchange_partnerships | D | ✅ Complete | |
| inspire_others | C | ✅ Complete | |
| **user_circles** | G | 📋 Planned | Circle membership |
| **recognitions** | G | 📋 Planned | Recognition counts |
| **inspire_requests** | G | 📋 Planned | "Inspire me" nudges |
| **notifications** | G | 📋 Planned | Aggregated notifications |
| **chat_conversations** | I | 📋 Planned | Chat history |
| **focus_history** | J | 📋 Planned | Focus evolution |

---

## PART 15: EDGE FUNCTIONS

| Function | Phase | Status | Notes |
|----------|-------|--------|-------|
| validation-interpret | — | ✅ Complete | Existing |
| priority-analyze | — | ✅ Complete | Existing |
| predict-analyze | — | ✅ Complete | Existing |
| **priority-recognition-analyze** | F | 📋 Planned | Impact Others |
| **proof-observation-analyze** | F | 📋 Planned | Improve Others |
| **chat-discovery** | I | 📋 Planned | Chat AI |
| **map-themes-extract** | K | 📋 Planned | Map AI |
| **map-thread-generate** | K | 📋 Planned | Map AI |

---

## SUMMARY: Features by Phase

### Phase F.0: Terminology Rename (PREP) ✅ COMPLETE
- "Impact" → "Impacts" (routes, nav, pages, components) ✓
- "Improve" → "Insights" (routes, nav, pages, components) ✓
- "Inspire" → "Inspirations" (routes, nav, pages, components) ✓
- Update all imports and references ✓
- Test all routes still work ✓

### Phase F: Send Tools
- Impact Others wizard (6 steps)
- Impact recipient view + thank
- Improve Others wizard (7 steps)
- Improve recipient view + thank + recipe
- Dual FIRES extraction
- Clarity grade + go deeper

### Phase G: Social Features
- Circle tracker (who's checked in)
- "Inspire me" requests
- Notifications section
- Recognition counts on feed
- [👏 Recognize] buttons
- Database: user_circles, recognitions, inspire_requests, notifications

### Phase H: Check-in Enhancement
- Bridge question logic
- Bridge → Priority pre-fill
- Week history calendar
- Weekly engagement averages

### Phase I: Chat Page
- Chat UI
- Suggested questions
- Chat history
- chat-discovery edge function
- chat_conversations table
- Lock for non-coached

### Phase J: Profile & Settings
- Account settings (email/password change)
- Coach connection display
- Notification preferences
- Privacy controls
- Focus history
- focus_history table

### Phase K: Map AI Features (Coached)
- "What's Emerging" section
- Enhanced "You vs Others"
- "The Thread" narrative
- Edge functions for AI synthesis

---

## NOT ASSIGNED (Need Phase)

| Feature | Source | Priority |
|---------|--------|----------|
| Learn page content | V2 Spec | Low |
| Share to feed toggles | V2 Spec | Medium |
| Link Focus to Predict goal | V2 Spec Part 8 | Low |

---

**End of Feature Tracker**
