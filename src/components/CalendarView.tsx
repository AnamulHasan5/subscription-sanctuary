import { Subscription } from '@/types/subscription';
import { formatCurrency } from '@/lib/subscriptions';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
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

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const startDayOfWeek = monthStart.getDay();

  return (
    <div className="glass-card p-6 rounded-2xl animate-slide-up sticky top-24" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <CalendarDays className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-foreground">Renewal Calendar</h2>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center text-[11px] font-semibold text-muted-foreground py-2 uppercase tracking-wider">
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
                aspect-square flex flex-col items-center justify-center rounded-lg relative cursor-default transition-all duration-200
                ${isToday(day) ? 'bg-primary text-primary-foreground font-bold shadow-glow' : 'hover:bg-muted/80'}
                ${hasRenewals && !isToday(day) ? 'bg-accent ring-1 ring-primary/20' : ''}
              `}
              title={hasRenewals ? daySubs.map(s => `${s.name} - ${formatCurrency(s.cost)}`).join('\n') : undefined}
            >
              <span className={`text-sm ${isToday(day) ? '' : 'text-foreground'}`}>
                {format(day, 'd')}
              </span>
              
              {hasRenewals && !isToday(day) && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-0.5">
                    {daySubs.slice(0, 3).map((sub) => (
                      <div
                        key={sub.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: `hsl(var(--category-${sub.category}))` }}
                      />
                    ))}
                    {daySubs.length > 3 && (
                      <span className="text-[8px] text-muted-foreground">+{daySubs.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-5 border-t border-border/60">
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Categories</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'streaming', label: 'Streaming' },
            { key: 'saas', label: 'SaaS' },
            { key: 'ai', label: 'AI' },
            { key: 'hosting', label: 'Hosting' },
          ].map(cat => (
            <div key={cat.key} className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: `hsl(var(--category-${cat.key}))` }} 
              />
              <span className="text-xs text-muted-foreground">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}