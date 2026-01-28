import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useClientDetail } from '@/hooks/useClientDetail';
import { supabase, ClientStatus } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, FileText, Calendar, MessageSquare, Map, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { ClientDetailHeader } from '@/components/client-detail/ClientDetailHeader';
import { ClientSummaryCards } from '@/components/client-detail/ClientSummaryCards';
import { GoalsChallengesSection } from '@/components/client-detail/GoalsChallengesSection';
import { InfluenceSection } from '@/components/client-detail/InfluenceSection';
import { QuickPrepSection } from '@/components/client-detail/QuickPrepSection';
import { ActivityFeed } from '@/components/client-detail/ActivityFeed';
import { PredictionsCard } from '@/components/client-detail/PredictionsCard';
import { StartEngagementWizard } from '@/components/client-detail/StartEngagementWizard';
import { DeleteClientModal } from '@/components/clients/DeleteClientModal';
import { SessionsTab } from '@/components/client-detail/tabs/SessionsTab';
import { ImpactTab } from '@/components/client-detail/tabs/ImpactTab';
import { PrioritiesTab } from '@/components/client-detail/tabs/PrioritiesTab';
import { NotesTab } from '@/components/client-detail/tabs/NotesTab';
import { NarrativeMapTab } from '@/components/client-detail/tabs/NarrativeMapTab';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// Tab type definition
type TabValue = 'sessions' | 'notes' | 'inspire' | 'improve' | 'impact' | 'narrative-map' | null;

export default function ClientDetail() {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { coachData } = useAuth();
  const { client, engagement, snapshots, impactVerifications, sessions, assessments, notes, memos, assignments, nextScheduledSession, loading, updateEngagement, refetch } = useClientDetail(email);
  const [activeTab, setActiveTab] = useState<TabValue>(null); // null = overview
  const [engagementWizardOpen, setEngagementWizardOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const latestSnapshot = snapshots[0] || null;

  // Filter for only past activities
  const lastActivity = useMemo(() => {
    const now = new Date();
    const activities = [
      ...snapshots.filter(s => new Date(s.created_at) < now).map((s) => ({ date: s.created_at, type: 'snapshot' })),
      ...impactVerifications.filter(i => new Date(i.created_at) < now).map((i) => ({ date: i.created_at, type: 'impact' })),
      ...sessions.filter(s => new Date(s.session_date) < now).map((s) => ({ date: s.session_date, type: 'session' })),
      ...notes.filter(n => new Date(n.created_at) < now).map((n) => ({ date: n.created_at, type: 'note' })),
    ];
    if (activities.length === 0) return null;
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [snapshots, impactVerifications, sessions, notes]);

  const handleStatusChange = async (status: ClientStatus) => {
    if (!client) return;

    try {
      const updateData: Record<string, unknown> = { status };
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = coachData?.id || null;
      }

      const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', client.id);

      if (error) throw error;

      toast({
        title: 'Status updated',
        description: `Client status changed to ${status}.`
      });
      refetch();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update client status.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleted = () => {
    toast({ title: 'Client deleted', description: 'The client has been removed.' });
    navigate('/clients');
  };

  const handleReturnToOverview = () => {
    setActiveTab(null);
  };

  const handleNewBelief = () => {
    window.open(
      import.meta.env.DEV ? 'http://localhost:3001' : 'https://snapshot.findinggood.com',
      '_blank'
    );
  };

  // Tab configuration - no Overview tab, main view IS the overview
  const tabs = [
    { value: 'sessions' as const, label: 'Sessions', icon: Calendar },
    { value: 'notes' as const, label: 'Notes', icon: MessageSquare },
    { value: 'inspire' as const, label: 'Inspire', icon: Sparkles },
    { value: 'improve' as const, label: 'Improve', icon: TrendingUp },
    { value: 'impact' as const, label: 'Impact', icon: Zap },
    { value: 'narrative-map' as const, label: 'Map', icon: Map },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link to="/clients">
          <Button variant="ghost" className="gap-2 -ml-2 min-h-[44px]">
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Button>
        </Link>
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">Client not found</p>
          <p className="text-sm text-muted-foreground mt-1">
            The client you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/clients">
            <Button className="mt-4">View All Clients</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'sessions':
        return (
          <SessionsTab
            sessions={sessions}
            assignments={assignments}
            clientEmail={client.email}
            engagementId={engagement?.id}
            onRefresh={refetch}
          />
        );
      case 'notes':
        return (
          <NotesTab
            notes={notes}
            memos={memos}
            sessions={sessions}
            clientEmail={client.email}
            onRefresh={refetch}
          />
        );
      case 'inspire':
        return (
          <div className="space-y-6">
            {/* Summary Cards at top of Inspire tab */}
            <ClientSummaryCards
              latestSnapshot={latestSnapshot}
              lastActivity={lastActivity}
              nextScheduledSession={nextScheduledSession}
            />
            <PredictionsCard clientEmail={client.email} />
          </div>
        );
      case 'improve':
        return <ImpactTab impacts={impactVerifications} />;
      case 'impact':
        return <PrioritiesTab impacts={impactVerifications} />;
      case 'narrative-map':
        return (
          <NarrativeMapTab
            engagement={engagement}
            clientName={client.name}
            clientEmail={client.email}
            latestSnapshot={latestSnapshot}
            refetch={refetch}
          />
        );
      default:
        return null;
    }
  };

  // Render overview (main view when no tab is selected)
  const renderOverview = () => (
    <div className="space-y-6">
      <InfluenceSection clientEmail={client.email} />
      <QuickPrepSection
        clientEmail={client.email}
        sessions={sessions}
        impactEntries={impactVerifications}
      />
      <GoalsChallengesSection engagement={engagement} onUpdate={updateEngagement} />
      <ActivityFeed clientEmail={client.email} limit={10} />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/clients">
        <Button variant="ghost" className="gap-2 -ml-2 min-h-[44px]">
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Button>
      </Link>

      <ClientDetailHeader
        client={client}
        engagement={engagement}
        latestSnapshot={latestSnapshot}
        isOnTab={activeTab !== null}
        onReturnToOverview={handleReturnToOverview}
        onStartEngagement={() => setEngagementWizardOpen(true)}
        onStatusChange={handleStatusChange}
        onDelete={() => setDeleteModalOpen(true)}
      />

      <StartEngagementWizard
        open={engagementWizardOpen}
        onOpenChange={setEngagementWizardOpen}
        clientEmail={client.email}
        onSuccess={refetch}
      />

      <DeleteClientModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        client={client}
        onDeleted={handleDeleted}
      />

      {/* Combined Navigation Bar */}
      <div className={cn(
        "flex items-center gap-1 p-1 bg-muted/50 rounded-lg overflow-x-auto",
        isMobile && "flex-nowrap"
      )}>
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "gap-1.5 flex-shrink-0",
              activeTab === tab.value && "bg-background shadow-sm"
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className={cn(isMobile && "hidden sm:inline")}>{tab.label}</span>
          </Button>
        ))}

        {/* New Belief Button - Primary Action */}
        <Button
          size="sm"
          onClick={handleNewBelief}
          className="ml-auto gap-1.5 flex-shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          <span className={cn(isMobile && "hidden sm:inline")}>New Belief</span>
        </Button>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        {activeTab === null ? renderOverview() : renderTabContent()}
      </div>
    </div>
  );
}
