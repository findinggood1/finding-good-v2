import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { SessionTranscript, ImpactVerification } from '@/hooks/useClientDetail';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FocusScore {
  completed: boolean;
  engagement: number;
  focus_name: string;
}

interface DailyCheckin {
  id: string;
  client_email: string;
  check_date: string;
  focus_scores: FocusScore[] | null;
}

interface Validation {
  id: string;
  client_email: string;
  fires_extracted: Record<string, { present: boolean; signal?: string }> | null;
  proof_line: string | null;
  created_at: string;
}

interface FiresCount {
  feelings: number;
  influence: number;
  resilience: number;
  ethics: number;
  strengths: number;
}

interface QuickPrepSectionProps {
  clientEmail: string;
  sessions: SessionTranscript[];
  impactEntries: ImpactVerification[];
}

const FIRES_COLORS: Record<string, string> = {
  feelings: 'bg-pink-500/20 text-pink-700 dark:text-pink-400',
  influence: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  resilience: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
  ethics: 'bg-green-500/20 text-green-700 dark:text-green-400',
  strengths: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
};

export function QuickPrepSection({ clientEmail, sessions, impactEntries }: QuickPrepSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Find last session date
  const lastSession = useMemo(() => {
    const pastSessions = sessions.filter(s => new Date(s.session_date) < new Date());
    return pastSessions[0] || null;
  }, [sessions]);

  const lastSessionDate = lastSession ? new Date(lastSession.session_date) : null;

  // Query validations (Improve entries) since last session
  const { data: validations, isLoading: validationsLoading } = useQuery({
    queryKey: ['validations', clientEmail, lastSessionDate?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from('validations')
        .select('id, client_email, fires_extracted, proof_line, created_at')
        .eq('client_email', clientEmail)
        .order('created_at', { ascending: false });

      if (lastSessionDate) {
        query = query.gte('created_at', lastSessionDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Validation[];
    },
    enabled: !!clientEmail,
  });

  // Query daily check-ins since last session
  const { data: checkins, isLoading: checkinsLoading } = useQuery({
    queryKey: ['daily_checkins', clientEmail, lastSessionDate?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from('daily_checkins')
        .select('id, client_email, check_date, focus_scores')
        .eq('client_email', clientEmail)
        .order('check_date', { ascending: false });

      if (lastSessionDate) {
        query = query.gte('check_date', format(lastSessionDate, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DailyCheckin[];
    },
    enabled: !!clientEmail,
  });

  // Filter impact entries since last session
  const recentImpactEntries = useMemo(() => {
    if (!lastSessionDate) return impactEntries;
    return impactEntries.filter(entry => new Date(entry.created_at) >= lastSessionDate);
  }, [impactEntries, lastSessionDate]);

  // Calculate focus completion rate
  const focusStats = useMemo(() => {
    if (!checkins || checkins.length === 0) return null;

    let totalItems = 0;
    let completedItems = 0;

    checkins.forEach(checkin => {
      if (checkin.focus_scores && Array.isArray(checkin.focus_scores)) {
        checkin.focus_scores.forEach(score => {
          totalItems++;
          if (score.completed) completedItems++;
        });
      }
    });

    return {
      completed: completedItems,
      total: totalItems,
      rate: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      checkinsCount: checkins.length,
    };
  }, [checkins]);

  // Aggregate FIRES patterns from impact entries and validations
  const firesPatterns = useMemo(() => {
    const counts: FiresCount = {
      feelings: 0,
      influence: 0,
      resilience: 0,
      ethics: 0,
      strengths: 0,
    };

    // Count from impact entries (priorities table)
    recentImpactEntries.forEach(entry => {
      const responses = entry.responses as Record<string, any>;
      if (responses?.fires_focus && Array.isArray(responses.fires_focus)) {
        responses.fires_focus.forEach((element: string) => {
          const key = element.toLowerCase() as keyof FiresCount;
          if (key in counts) counts[key]++;
        });
      }
    });

    // Count from validations
    validations?.forEach(validation => {
      if (validation.fires_extracted) {
        Object.entries(validation.fires_extracted).forEach(([key, value]) => {
          if (value?.present && key in counts) {
            counts[key as keyof FiresCount]++;
          }
        });
      }
    });

    // Sort by count descending
    const sorted = Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    return {
      counts,
      sorted,
      strongest: sorted[0] || null,
      weakest: Object.entries(counts)
        .filter(([_, count]) => count === 0)
        .map(([key]) => key),
    };
  }, [recentImpactEntries, validations]);

  const isLoading = validationsLoading || checkinsLoading;

  if (isLoading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Quick Prep
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasActivity = recentImpactEntries.length > 0 || (validations && validations.length > 0) || (checkins && checkins.length > 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="shadow-soft">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Quick Prep
              </CardTitle>
              <div className="flex items-center gap-2">
                {lastSession && (
                  <Badge variant="outline" className="text-xs font-normal">
                    Since {format(new Date(lastSession.session_date), 'MMM d')}
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {!hasActivity ? (
              <p className="text-sm text-muted-foreground italic text-center py-4">
                No activity recorded {lastSession ? `since ${format(new Date(lastSession.session_date), 'MMM d')}` : 'yet'}.
              </p>
            ) : (
              <div className="space-y-6">
                {/* Activity Since Last Session */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <span>Activity Since Last Session</span>
                    {lastSession && (
                      <span className="text-xs text-muted-foreground font-normal">
                        ({formatDistanceToNow(new Date(lastSession.session_date), { addSuffix: true })})
                      </span>
                    )}
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {/* Impact Entries */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{recentImpactEntries.length}</p>
                        <p className="text-xs text-muted-foreground">Impact entries</p>
                      </div>
                    </div>

                    {/* Improve Entries */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="p-2 rounded-full bg-emerald-500/10">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{validations?.length || 0}</p>
                        <p className="text-xs text-muted-foreground">Improve entries</p>
                      </div>
                    </div>

                    {/* Focus Completion */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="p-2 rounded-full bg-amber-500/10">
                        <CheckCircle className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        {focusStats ? (
                          <>
                            <p className="text-2xl font-bold">
                              {focusStats.completed}/{focusStats.total}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Focus items ({focusStats.rate}%)
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-muted-foreground">—</p>
                            <p className="text-xs text-muted-foreground">No check-ins</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* FIRES Patterns */}
                {firesPatterns.sorted.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      Patterns to Notice
                    </h4>
                    <div className="space-y-2">
                      {/* Strong elements */}
                      {firesPatterns.sorted.slice(0, 3).map(([element, count]) => (
                        <div key={element} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn('capitalize text-xs', FIRES_COLORS[element])}
                            >
                              {element}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {count} {count === 1 ? 'mention' : 'mentions'}
                            </span>
                          </div>
                          {firesPatterns.strongest?.[0] === element && (
                            <Badge variant="secondary" className="text-xs">Strongest</Badge>
                          )}
                        </div>
                      ))}

                      {/* Limited/absent elements */}
                      {firesPatterns.weakest.length > 0 && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Limited signals:{' '}
                            {firesPatterns.weakest.map((el, idx) => (
                              <span key={el} className="capitalize">
                                {el}{idx < firesPatterns.weakest.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Next Session Focus (if available from last session) */}
                {lastSession?.next_session_focus && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="text-sm font-medium mb-1">From Last Session</h4>
                    <p className="text-sm text-muted-foreground italic">
                      "{lastSession.next_session_focus}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
