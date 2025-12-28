import { Subscription } from '@/types/subscription';
import { getDaysUntilRenewal, formatCurrency } from '@/lib/subscriptions';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface CalendarViewProps {
  subscriptions: Subscription[];
}

export function CalendarView({ subscriptions }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

  const getSubscriptionsForDay = (day: Date) => {
    return activeSubscriptions.filter(sub => 
      isSameDay(new Date(sub.nextRenewal), day)
    );
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startDayOfWeek = monthStart.getDay();

  return (
    <div className="glass-card p-6 rounded-2xl animate-slide-up" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Renewal Calendar</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
        
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {days.map(day => {
          const daySubs = getSubscriptionsForDay(day);
          const hasRenewals = daySubs.length > 0;
          
          return (
            <div
              key={day.toISOString()}
              className={`
                aspect-square p-1 rounded-lg text-center relative
                ${isToday(day) ? 'bg-primary/10 ring-1 ring-primary/30' : ''}
                ${hasRenewals ? 'bg-accent' : ''}
              `}
            >
              <span className={`
                text-sm
                ${isToday(day) ? 'font-semibold text-primary' : 'text-foreground'}
              `}>
                {format(day, 'd')}
              </span>
              
              {hasRenewals && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-0.5">
                    {daySubs.slice(0, 3).map((sub, i) => (
                      <div
                        key={sub.id}
                        className={`w-1.5 h-1.5 rounded-full bg-category-${sub.category}`}
                        style={{ backgroundColor: `hsl(var(--category-${sub.category}))` }}
                        title={`${sub.name} - ${formatCurrency(sub.cost)}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--category-streaming))' }} />
            <span className="text-muted-foreground">Streaming</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--category-saas))' }} />
            <span className="text-muted-foreground">SaaS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--category-ai))' }} />
            <span className="text-muted-foreground">AI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--category-hosting))' }} />
            <span className="text-muted-foreground">Hosting</span>
          </div>
        </div>
      </div>
    </div>
  );
}
