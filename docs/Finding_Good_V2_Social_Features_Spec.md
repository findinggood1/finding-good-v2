# Finding Good V2: Social Features Specification

**Purpose:** Clear specs for social/connection features to prevent misinterpretation  
**Core Philosophy:** "The ask IS the gift" — inviting reflection is valuable in itself

---

## Core Principle

Finding Good's social layer is NOT:
- Social media (no likes, followers, metrics)
- Feedback collection (not asking "how am I doing?")
- Performance review (not evaluating others)

Finding Good's social layer IS:
- Mutual reflection (both people benefit from the prompt)
- Evidence sharing (concrete moments, not abstract praise)
- Connection building (through shared vulnerability)

---

## Feature 1: Ask Flow (Priority Builder)

### Purpose
User A invites User B to reflect on **User B's own experience**. The invitation itself prompts valuable reflection — that's the gift.

### WHO does WHAT for WHOM
| Actor | Action | Beneficiary |
|-------|--------|-------------|
| User A (requester) | Sends invitation | User B (receives prompt to reflect) |
| User B (responder) | Answers about THEIR OWN experience | Themselves (clarity) + User A (connection) |

### Flow
1. User A fills out Ask form (recipient info + optional message)
2. User B receives link
3. User B sees: "[User A] invited you to share what matters"
4. User B answers 3 questions about **their own** recent experience
5. User B submits → Thank you screen
6. User A sees User B's response (creates connection)

### UX Copy

**Ask Page (User A creating invitation):**
```
Header: "Invite Someone to Reflect"
Subtext: "Send a prompt that helps someone notice what's going well in their life."

Fields:
- "Who are you inviting?" (name)
- "Their email"
- "How do you know them?" (optional)
- "Add a personal note" (optional)
  Placeholder: "Hey, I've been using this tool to notice what matters. Thought you might enjoy it too."
```

**Respond Page (User B answering):**
```
Header: "[Brian] invited you to share what matters"
Subtext: "Take 2 minutes to reflect on something that went well recently."

If personal message exists:
"[Brian] says: [personal message]"

Questions (about USER B's experience):
1. "What went well for you recently?"
2. "What was your part in making that happen?"
3. "What impact did it have?"

Submit button: "Share My Reflection"
```

**Thank You Page:**
```
Header: "Thanks for sharing"
Subtext: "Your reflection has been shared with [Brian]. Taking time to notice what matters is how we build clarity."

Optional: "Want to start your own practice?" → Link to sign up
```

### Anti-Patterns (DO NOT DO)
- ❌ "What do you think matters most to [requester]?"
- ❌ "Give feedback about [requester]"
- ❌ "How is [requester] doing?"
- ❌ Any question about the requester's performance

---

## Feature 2: Campfire / Inspiration Feed

### Purpose
A warm, intimate space where connections share moments of clarity. NOT a social media feed — no metrics, no competition.

### WHO does WHAT for WHOM
| Actor | Action | Beneficiary |
|-------|--------|-------------|
| User | Shares Priority confirmation | Their connections (inspiration) |
| Connections | See what matters to user | Themselves (ideas) + User (feeling seen) |

### Visibility Rules
- Only mutual connections see each other's shares
- Mutual = User A shared with User B, OR User B responded to User A's ask
- No follower counts, no public profiles

### UX Copy

**Share Toggle (on Priority confirmation):**
```
Label: "Share to Campfire"
Subtext: "Let your connections see what mattered today"
Default: OFF (opt-in sharing)
```

**Campfire Feed:**
```
Header: "Campfire"
Subtext: "Moments of clarity from people in your circle"

Empty state: "Your campfire is quiet. As you connect with others through sharing and asking, their reflections will appear here."

Card format:
- "[Name] noticed something that mattered"
- Priority Line (the integrity statement)
- FIRES badges (what elements were present)
- Timestamp
- NO like counts, NO comments (v1)
```

### Anti-Patterns (DO NOT DO)
- ❌ Like buttons with visible counts
- ❌ "X people liked this"
- ❌ Follower/following counts
- ❌ Public discovery feed
- ❌ Algorithmic ranking

---

## Feature 3: Connections Page

### Purpose
Show who you've shared with and who has shared with you. A relationship map, not a follower list.

### Connection Types
| Type | How Created | Visibility |
|------|-------------|------------|
| You → Them | You sent Ask, they responded | You see their shares |
| Them → You | They sent Ask, you responded | They see your shares |
| Mutual | Both directions exist | Both see each other |

### UX Copy

**Connections Page:**
```
Header: "Your Circle"
Subtext: "People you've shared with and who have shared with you"

Sections:
1. "Mutual" — Full two-way sharing
2. "You invited" — You sent Ask, awaiting or completed
3. "Invited you" — They sent Ask, you responded

Card format:
- Name
- How connected: "Responded to your invitation" / "You responded to theirs"
- Last interaction date
```

### Anti-Patterns (DO NOT DO)
- ❌ "Followers" / "Following" language
- ❌ Connection counts as status
- ❌ "Add friend" mechanics

---

## Feature 4: Send Priority to Someone (Priority Builder)

### Purpose
Share YOUR Priority reflection directly with someone specific, as evidence of impact they may not know about.

### WHO does WHAT for WHOM
| Actor | Action | Beneficiary |
|-------|--------|-------------|
| User | Shares their Priority | Recipient (receives concrete evidence of positive impact) |

### Flow
1. User completes Priority confirmation
2. User sees "Send to Someone" option
3. User selects/enters recipient
4. Recipient gets email with the Priority Line and impact statement
5. This creates a connection (recipient can now see user's Campfire shares)

### UX Copy

**Send Screen:**
```
Header: "Share this with someone"
Subtext: "Let someone know they made a difference"

"Who should see this?"
- Dropdown of existing connections
- Or "Someone new" → name + email

"Add context" (optional)
Placeholder: "I wanted you to know this mattered..."

Button: "Send"
```

**Email to Recipient:**
```
Subject: "[Name] shared something with you"

Body:
"[Name] reflected on something that went well and wanted you to know:

[Priority Line - the integrity statement]

[Optional context message]

---
This was shared via Finding Good, a tool for noticing what matters."
```

### Anti-Patterns (DO NOT DO)
- ❌ Automated blast to all connections
- ❌ "Share to all" option
- ❌ Generic notifications without content

---

## Feature 5: Proof Request Flow (Proof Tool)

### Purpose
Ask someone specific to share evidence of YOUR impact on THEM. This is the one case where you're asking about yourself — but framed as asking them to reflect on their experience of you.

### WHO does WHAT for WHOM
| Actor | Action | Beneficiary |
|-------|--------|-------------|
| User A | Asks for proof | User A (receives external validation) |
| User B | Reflects on User A's impact on them | User A + User B (both gain clarity) |

### UX Copy

**Request Screen:**
```
Header: "Request Proof"
Subtext: "Ask someone to share evidence of your impact"

"Who are you asking?"
"What specifically are you asking about?" (optional)
Placeholder: "I'd love to hear about a time when something I did made a difference for you"
```

**Respond Screen (User B):**
```
Header: "[Name] asked for your perspective"
Subtext: "They're looking for evidence of the impact they've had"

"Think of a specific moment when [Name] made a difference..."

Questions:
1. "What did [Name] do?"
2. "What impact did it have on you?"
3. "What does this tell you about [Name]?"
```

### Anti-Patterns (DO NOT DO)
- ❌ "Rate [Name] on a scale of 1-10"
- ❌ Generic feedback forms
- ❌ Anonymous responses (attribution matters for proof)

---

## Implementation Notes

When building these features, always include:

1. **Philosophy comment at top of component:**
```tsx
/**
 * Ask Flow - "The ask IS the gift"
 * User A invites User B to reflect on USER B's experience.
 * The invitation prompts valuable reflection — that's the gift.
 */
```

2. **Clear prop naming:**
```tsx
// Good
requesterName, responderExperience, theirReflection

// Bad  
targetUser, feedback, review
```

3. **Copy constants in separate file:**
```tsx
// src/constants/copy.ts
export const ASK_FLOW = {
  HEADER: "Invite Someone to Reflect",
  RESPOND_HEADER: (name: string) => `${name} invited you to share what matters`,
  // etc.
}
```

---

## Summary Table

| Feature | Direction | About Whose Experience? |
|---------|-----------|------------------------|
| Ask | A → B | B's own experience |
| Campfire | Share to connections | Sharer's experience |
| Send Priority | A → B | A's experience (evidence for B) |
| Proof Request | A → B | A's impact on B |

---

*This spec should be referenced when building any social/connection feature to maintain consistent philosophy.*
