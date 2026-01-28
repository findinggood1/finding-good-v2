import type { DayHistory } from '../../hooks/useWeekHistory'

interface WeekHistoryCalendarProps {
  days: DayHistory[]
  loading?: boolean
}

/**
 * Week history calendar showing check-in status for each day.
 *
 * Indicators:
 * - ✓ = Checked in (with X/Y items completed)
 * - ○ = No check-in (past day)
 * - - = Weekend (if not checked in)
 * - ● = Today (current day)
 */
export function WeekHistoryCalendar({ days, loading }: WeekHistoryCalendarProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
        <div className="flex justify-between">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-3 w-8 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-200 rounded-full" />
              <div className="h-3 w-6 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (days.length === 0) {
    return null
  }

  return (
    <div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
        This Week
      </div>
      <div className="flex justify-between">
        {days.map((day) => (
          <DayCell key={day.date.toISOString()} day={day} />
        ))}
      </div>
    </div>
  )
}

function DayCell({ day }: { day: DayHistory }) {
  const { dayLabel, checkedIn, itemsCompleted, itemsTotal, isToday, isWeekend } = day

  // Determine display state
  const isPast = day.date < new Date() && !isToday
  const showCompletion = checkedIn && itemsTotal > 0

  // Indicator logic
  let indicator: string
  let indicatorClass: string

  if (isToday) {
    indicator = checkedIn ? '✓' : '●'
    indicatorClass = checkedIn
      ? 'bg-brand-primary text-white'
      : 'bg-brand-primary/20 text-brand-primary border-2 border-brand-primary'
  } else if (checkedIn) {
    indicator = '✓'
    indicatorClass = 'bg-green-500 text-white'
  } else if (isWeekend && isPast) {
    indicator = '-'
    indicatorClass = 'bg-gray-100 text-gray-400'
  } else if (isPast) {
    indicator = '○'
    indicatorClass = 'bg-gray-100 text-gray-400'
  } else {
    // Future day
    indicator = ''
    indicatorClass = 'bg-gray-50 text-gray-300 border border-gray-200'
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-xs font-medium ${isToday ? 'text-brand-primary' : 'text-gray-500'}`}>
        {dayLabel}
      </span>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${indicatorClass}`}
      >
        {indicator}
      </div>
      <span className="text-xs text-gray-400 h-4">
        {showCompletion ? `${itemsCompleted}/${itemsTotal}` : isToday ? '(today)' : ''}
      </span>
    </div>
  )
}
