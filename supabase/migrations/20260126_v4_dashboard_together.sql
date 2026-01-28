-- ============================================================================
-- FINDING GOOD: V4 MIGRATION
-- ============================================================================
-- Date: January 26, 2026
-- Purpose: Dashboard V2 + Together V2 schema additions
-- 
-- TABLES CREATED (11):
-- coaching_relationships, permissions, daily_checkins, weekly_snapshots,
-- rolling_aggregates, agreed_activities, user_circles, share_recognitions,
-- inspire_requests, chat_conversations, focus_history
--
-- COLUMNS ADDED (3):
-- predictions.what_matters_most, predictions.share_to_feed, clients.calendar_link
-- ============================================================================

-- 1. COACHING_RELATIONSHIPS
CREATE TABLE IF NOT EXISTS coaching_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES coaches(id),
    client_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_coach_invite',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    invite_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_cr_status CHECK (status IN (
        'pending_coach_invite', 'pending_client_request', 'active', 'paused', 'completed'
    ))
);
CREATE INDEX IF NOT EXISTS idx_coaching_relationships_coach ON coaching_relationships(coach_id);
CREATE INDEX IF NOT EXISTS idx_coaching_relationships_client ON coaching_relationships(client_email);

-- 2. PERMISSIONS
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_email TEXT NOT NULL,
    prediction_id UUID,
    practice TEXT,
    permission TEXT,
    focus JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_permissions_client ON permissions(client_email);

-- 3. DAILY_CHECKINS
CREATE TABLE IF NOT EXISTS daily_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_email TEXT NOT NULL,
    permission_id UUID REFERENCES permissions(id),
    check_date DATE NOT NULL DEFAULT CURRENT_DATE,
    focus_scores JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_email, check_date)
);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_client ON daily_checkins(client_email);

-- 4. WEEKLY_SNAPSHOTS
CREATE TABLE IF NOT EXISTS weekly_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_email TEXT NOT NULL,
    coach_id UUID REFERENCES coaches(id),
    week_number INTEGER,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    activity_counts JSONB,
    themes JSONB,
    language_patterns JSONB,
    fires_signals JSONB,
    exchanges JSONB,
    open_threads JSONB,
    coaching_questions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_weekly_snapshots_client ON weekly_snapshots(client_email);

-- 5. ROLLING_AGGREGATES
CREATE TABLE IF NOT EXISTS rolling_aggregates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_email TEXT NOT NULL,
    coach_id UUID REFERENCES coaches(id),
    coaching_start DATE,
    total_weeks INTEGER DEFAULT 0,
    permission_evolution JSONB,
    persistent_themes JSONB,
    fires_trajectory JSONB,
    relationship_map JSONB,
    questions_explored JSONB,
    breakthroughs JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_email, coach_id)
);
CREATE INDEX IF NOT EXISTS idx_rolling_aggregates_client ON rolling_aggregates(client_email);

-- 6. AGREED_ACTIVITIES
CREATE TABLE IF NOT EXISTS agreed_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_email TEXT NOT NULL,
    coach_id UUID REFERENCES coaches(id),
    source TEXT NOT NULL DEFAULT 'focus',
    activity_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    evidence_entries JSONB,
    coach_notes TEXT,
    visibility TEXT NOT NULL DEFAULT 'shared',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_aa_source CHECK (source IN ('focus', 'session', 'transcript')),
    CONSTRAINT valid_aa_status CHECK (status IN ('pending', 'evidence_found', 'resolved', 'deprioritized')),
    CONSTRAINT valid_aa_visibility CHECK (visibility IN ('shared', 'coach_only'))
);
CREATE INDEX IF NOT EXISTS idx_agreed_activities_client ON agreed_activities(client_email);

-- 7. USER_CIRCLES
CREATE TABLE IF NOT EXISTS user_circles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    circle_member_email TEXT NOT NULL,
    relationship_type TEXT DEFAULT 'sent_to',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_email, circle_member_email)
);
CREATE INDEX IF NOT EXISTS idx_user_circles_user ON user_circles(user_email);

-- 8. SHARE_RECOGNITIONS (NOT recognitions - that's person-to-person)
CREATE TABLE IF NOT EXISTS share_recognitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id UUID NOT NULL REFERENCES inspiration_shares(id) ON DELETE CASCADE,
    recognizer_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(share_id, recognizer_email)
);
CREATE INDEX IF NOT EXISTS idx_share_recognitions_share ON share_recognitions(share_id);

-- 9. INSPIRE_REQUESTS
CREATE TABLE IF NOT EXISTS inspire_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_email TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_ir_status CHECK (status IN ('pending', 'acknowledged'))
);
CREATE INDEX IF NOT EXISTS idx_inspire_requests_recipient ON inspire_requests(recipient_email);

-- 10. CHAT_CONVERSATIONS
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_email TEXT NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_client ON chat_conversations(client_email);

-- 11. FOCUS_HISTORY
CREATE TABLE IF NOT EXISTS focus_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_email TEXT NOT NULL,
    focus_name TEXT NOT NULL,
    started_at DATE NOT NULL DEFAULT CURRENT_DATE,
    ended_at DATE,
    evolved_into TEXT,
    reason TEXT,
    CONSTRAINT valid_fh_reason CHECK (reason IS NULL OR reason IN ('paused', 'evolved', 'completed'))
);
CREATE INDEX IF NOT EXISTS idx_focus_history_client ON focus_history(client_email);

-- COLUMN ADDITIONS
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS what_matters_most TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS share_to_feed BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS calendar_link TEXT;

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_recognition_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE inspiration_shares SET recognized_count = recognized_count + 1 WHERE id = NEW.share_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE inspiration_shares SET recognized_count = GREATEST(0, recognized_count - 1) WHERE id = OLD.share_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_recognition_count ON share_recognitions;
CREATE TRIGGER trigger_recognition_count AFTER INSERT OR DELETE ON share_recognitions
    FOR EACH ROW EXECUTE FUNCTION update_recognition_count();

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_permissions_updated ON permissions;
CREATE TRIGGER trigger_permissions_updated BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_coaching_relationships_updated ON coaching_relationships;
CREATE TRIGGER trigger_coaching_relationships_updated BEFORE UPDATE ON coaching_relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_rolling_aggregates_updated ON rolling_aggregates;
CREATE TRIGGER trigger_rolling_aggregates_updated BEFORE UPDATE ON rolling_aggregates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_agreed_activities_updated ON agreed_activities;
CREATE TRIGGER trigger_agreed_activities_updated BEFORE UPDATE ON agreed_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_chat_conversations_updated ON chat_conversations;
CREATE TRIGGER trigger_chat_conversations_updated BEFORE UPDATE ON chat_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (permissive for now)
ALTER TABLE coaching_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE rolling_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreed_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspire_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_recognitions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Allow all coaching_relationships" ON coaching_relationships FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Allow all permissions" ON permissions FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Allow all daily_checkins" ON daily_checkins FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Allow all weekly_snapshots" ON weekly_snapshots FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Allow all rolling_aggregates" ON rolling_aggregates FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Allow all agreed_activities" ON agreed_activities FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Allow all user_circles" ON user_circles FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Allow all inspire_requests" ON inspire_requests FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Allow all chat_conversations" ON chat_conversations FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Allow all focus_history" ON focus_history FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Allow all share_recognitions" ON share_recognitions FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
