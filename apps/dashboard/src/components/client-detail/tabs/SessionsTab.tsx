import { useState } from 'react';
import { SessionTranscript, Assignment } from '@/hooks/useClientDetail';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, Plus, Check, X, CalendarIcon, AlertCircle, ClipboardList } from 'lucide-react';
import { SessionCard } from './SessionCard';
import { AddSessionModal } from './AddSessionModal';
import { TranscriptModal } from './TranscriptModal';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface SessionsTabProps {
  sessions: SessionTranscript[];
  assignments: Assignment[];
  clientEmail: string;
  engagementId?: string;
  onRefresh: () => void;
}

const PRACTICE_TYPE_GROUPS = [
  {
    phase: 'NAME Phase',
    subtitle: 'Builds Clarity',
    practices: [
      { value: 'snapshot', label: 'Take Snapshot', description: 'Complete a self-assessment snapshot' },
      { value: 'impact_self', label: 'Impact - Self', description: 'Self-verification of impact' },
      { value: 'impact_other', label: 'Impact - Other', description: 'Request feedback from others' },
    ],
  },
  {
    phase: 'VALIDATE Phase',
    subtitle: 'Builds Confidence',
    practices: [
      { value: 'validation_self', label: 'Validation - Self', description: 'Self-validation practice' },
      { value: 'validation_other', label: 'Validation - Other', description: 'Request validation from others' },
    ],
  },
  {
    phase: 'COMMUNICATE Phase',
    subtitle: 'Builds Influence',
    practices: [
      { value: 'conversation', label: 'Conversation Practice', description: 'Practice a key conversation' },
    ],
  },
];

const ALL_PRACTICE_TYPES = PRACTICE_TYPE_GROUPS.flatMap(g => g.practices);

export function SessionsTab({ sessions, assignments, clientEmail, engagementId, onRefresh }: SessionsTabProps) {
  const { toast } = useToast();
  const [addSessionModalOpen, setAddSessionModalOpen] = useState(false);
  const [addAssignmentModalOpen, setAddAssignmentModalOpen] = useState(false);
  const [transcriptSession, setTranscriptSession] = useState<SessionTranscript | null>(null);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Assignment form state
  const [practiceType, setPracticeType] = useState('snapshot');
  const [coachNote, setCoachNote] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const nextSessionNumber = sessions.length > 0
    ? Math.max(...sessions.map(s => s.session_number || 0)) + 1
    : 1;

  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const pastAssignments = assignments.filter(a => ['completed', 'cancelled', 'expired'].includes(a.status));

  const resetAssignmentForm = () => {
    setPracticeType('snapshot');
    setCoachNote('');
    setDueDate(undefined);
  };

  const handleAssign = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('assignments')
        .insert({
          client_email: clientEmail,
          engagement_id: engagementId || null,
          practice_type: practiceType,
          coach_note: coachNote.trim() || null,
          due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
          status: 'pending',
        });

      if (error) throw error;

      toast({ title: 'Practice assigned', description: 'The assignment has been created.' });
      setAddAssignmentModalOpen(false);
      resetAssignmentForm();
      onRefresh();
    } catch (err) {
      console.error('Error assigning practice:', err);
      toast({ title: 'Failed to assign practice', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'completed' | 'cancelled') => {
    setUpdatingId(id);
    try {
      const updates: Record<string, any> = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({ title: newStatus === 'completed' ? 'Marked as complete' : 'Assignment cancelled' });
      onRefresh();
    } catch (err) {
      console.error('Error updating assignment:', err);
      toast({ title: 'Failed to update assignment', variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const getPracticeLabel = (type: string) => {
    return ALL_PRACTICE_TYPES.find(p => p.value === type)?.label || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isOverdue = (dueDateStr: string | null) => {
    if (!dueDateStr) return false;
    const due = new Date(dueDateStr);
    return isPast(due) && !isToday(due);
  };

  const renderAssignmentCard = (assignment: Assignment, showActions: boolean) => (
    <Card key={assignment.id} className="bg-card/50">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {getPracticeLabel(assignment.practice_type)}
              </Badge>
              {!showActions && getStatusBadge(assignment.status)}
              {assignment.due_date && (
                <span className={cn(
                  "text-xs flex items-center gap-1",
                  showActions && isOverdue(assignment.due_date) && "text-destructive font-medium"
                )}>
                  {showActions && isOverdue(assignment.due_date) && <AlertCircle className="h-3 w-3" />}
                  Due: {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                </span>
              )}
            </div>
            {assignment.coach_note && (
              <p className="text-sm text-muted-foreground">{assignment.coach_note}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Assigned: {format(new Date(assignment.created_at), 'MMM d, yyyy')}
              {assignment.status === 'completed' && assignment.completed_at && (
                <> • Completed: {format(new Date(assignment.completed_at), 'MMM d, yyyy')}</>
              )}
            </p>
          </div>
          {showActions && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 hover:text-green-500 hover:bg-green-500/10"
                onClick={() => handleStatusChange(assignment.id, 'completed')}
                disabled={updatingId === assignment.id}
              >
                <Check className="h-4 w-4 mr-1" />
                Complete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => handleStatusChange(assignment.id, 'cancelled')}
                disabled={updatingId === assignment.id}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Sessions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-serif font-medium flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Sessions
          </h3>
          <Button onClick={() => setAddSessionModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Session
          </Button>
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <FileText className="h-10 w-10 mb-3 opacity-50" />
            <p className="font-medium">No sessions recorded yet</p>
            <p className="text-sm mt-1">Add your first session transcript or notes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onViewTranscript={setTranscriptSession}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        )}
      </div>

      {/* Assignments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-serif font-medium flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Assignments
          </h3>
          <Button variant="outline" onClick={() => setAddAssignmentModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Practice
          </Button>
        </div>

        {/* Pending Assignments */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Pending</h4>
          {pendingAssignments.length === 0 ? (
            <Card className="bg-card/30 border-dashed">
              <CardContent className="py-6 text-center text-muted-foreground">
                <p className="text-sm">No pending assignments</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingAssignments.map(a => renderAssignmentCard(a, true))}
            </div>
          )}
        </div>

        {/* Past Assignments */}
        {pastAssignments.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Past</h4>
            <div className="space-y-3">
              {pastAssignments.map(a => renderAssignmentCard(a, false))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddSessionModal
        open={addSessionModalOpen}
        onOpenChange={setAddSessionModalOpen}
        clientEmail={clientEmail}
        engagementId={engagementId}
        nextSessionNumber={nextSessionNumber}
        onSuccess={onRefresh}
      />

      <TranscriptModal
        open={!!transcriptSession}
        onOpenChange={(open) => !open && setTranscriptSession(null)}
        session={transcriptSession}
      />

      {/* Assign Practice Modal */}
      <Dialog open={addAssignmentModalOpen} onOpenChange={setAddAssignmentModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Practice</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Practice Type</Label>
              <RadioGroup value={practiceType} onValueChange={setPracticeType} className="space-y-4">
                {PRACTICE_TYPE_GROUPS.map(group => (
                  <div key={group.phase} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary">{group.phase}</span>
                      <span className="text-xs text-muted-foreground">({group.subtitle})</span>
                    </div>
                    <div className="space-y-2 pl-2 border-l-2 border-primary/20">
                      {group.practices.map(type => (
                        <div key={type.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                          <RadioGroupItem value={type.value} id={type.value} className="mt-0.5" />
                          <label htmlFor={type.value} className="flex-1 cursor-pointer">
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coach-note">Coach Note (optional)</Label>
              <Textarea
                id="coach-note"
                value={coachNote}
                onChange={(e) => setCoachNote(e.target.value)}
                placeholder="Add context or instructions for this assignment..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Due Date (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
              {dueDate && (
                <Button variant="ghost" size="sm" onClick={() => setDueDate(undefined)}>
                  Clear date
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAssignmentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={saving}>
              {saving ? 'Assigning...' : 'Assign Practice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
