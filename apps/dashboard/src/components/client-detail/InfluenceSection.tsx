import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Home, Quote, CheckCircle } from 'lucide-react';

interface FocusItem {
  name: string;
  order: number;
}

interface Permission {
  id: string;
  client_email: string;
  permission: string | null;
  practice: string | null;
  focus: FocusItem[] | null;
  created_at: string;
  updated_at: string;
}

interface InfluenceSectionProps {
  clientEmail: string;
}

export function InfluenceSection({ clientEmail }: InfluenceSectionProps) {
  const { data: permission, isLoading, error } = useQuery({
    queryKey: ['permission', clientEmail],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('client_email', clientEmail)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Permission | null;
    },
    enabled: !!clientEmail,
  });

  if (isLoading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Your Influence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Your Influence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load influence data</p>
        </CardContent>
      </Card>
    );
  }

  // Check if client has set any influence data
  const hasInfluence = permission && (permission.permission || permission.practice || (permission.focus && permission.focus.length > 0));

  if (!hasInfluence) {
    return (
      <Card className="shadow-soft border-dashed">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Home className="h-5 w-5 text-muted-foreground" />
            Your Influence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic text-center py-4">
            Client hasn't defined their influence yet.
            <br />
            <span className="text-xs">Permission, Practice, and Focus will appear here once set in the Together app.</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  const focusItems = permission.focus?.sort((a, b) => a.order - b.order) || [];

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          Your Influence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Permission */}
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
                PERMISSION
              </Badge>
            </div>
            {permission.permission ? (
              <div className="flex items-start gap-2">
                <Quote className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm italic leading-relaxed">"{permission.permission}"</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not set</p>
            )}
          </div>

          {/* Practice */}
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-xs font-medium dark:text-amber-400">
                PRACTICE
              </Badge>
            </div>
            {permission.practice ? (
              <div className="flex items-start gap-2">
                <Quote className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm italic leading-relaxed">"{permission.practice}"</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not set</p>
            )}
          </div>

          {/* Focus */}
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-xs font-medium dark:text-emerald-400">
                FOCUS
              </Badge>
            </div>
            {focusItems.length > 0 ? (
              <ul className="space-y-1.5">
                {focusItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No focus items</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
