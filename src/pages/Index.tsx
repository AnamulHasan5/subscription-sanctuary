import { useState } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { StatCard } from '@/components/StatCard';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { CalendarView } from '@/components/CalendarView';
import { AddSubscriptionDialog } from '@/components/AddSubscriptionDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Bell, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Subscription } from '@/types/subscription';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const Index = () => {
  const {
    subscriptions,
    isLoading,
    stats,
    upcoming7Days,
    upcoming30Days,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    updateStatus,
  } = useSubscriptions();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteSubscription(id);
    toast.success('Subscription deleted');
  };

  const handleCancel = (id: string) => {
    updateStatus(id, 'cancelled');
    toast.success('Subscription cancelled');
  };

  const handleCloseDialog = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setEditingSubscription(null);
    }
  };

  const handleAdd = (subscription: Omit<Subscription, 'id' | 'createdAt'>) => {
    addSubscription(subscription);
    toast.success('Subscription added');
  };

  const handleUpdate = (id: string, updates: Partial<Subscription>) => {
    updateSubscription(id, updates);
    toast.success('Subscription updated');
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSubscriptions = filteredSubscriptions.filter(s => s.status === 'active');
  const inactiveSubscriptions = filteredSubscriptions.filter(s => s.status !== 'active');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse-soft">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">Loading your subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-soft">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">Subscript</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Track smarter, spend wiser</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative rounded-xl">
                <Bell className="h-5 w-5" />
                {upcoming7Days.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-glow">
                    {upcoming7Days.length}
                  </span>
                )}
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="btn-gradient rounded-xl gap-1.5">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Stats Section */}
        <div className="mb-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground mt-1">Your subscription overview at a glance</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Monthly Spend"
              value={stats.monthlySpend}
              subtitle="Active subscriptions"
              icon="credit-card"
              variant="primary"
            />
            <StatCard
              title="Yearly Spend"
              value={stats.yearlySpend}
              subtitle="Projected annual"
              icon="trending-up"
            />
            <StatCard
              title="Active"
              value={stats.totalActive.toString()}
              subtitle={`${stats.totalCancelled} cancelled`}
              icon="check"
            />
            <StatCard
              title="Renewing Soon"
              value={upcoming7Days.length.toString()}
              subtitle="Next 7 days"
              icon="calendar"
              variant={upcoming7Days.length > 0 ? 'warning' : 'default'}
            />
          </div>
        </div>

        {/* Upcoming Renewals Alert */}
        {upcoming7Days.length > 0 && (
          <div className="mb-10 glass-card p-5 rounded-2xl animate-fade-in border-warning/20">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-warning/15">
                <Bell className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Upcoming Renewals</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {upcoming7Days.length} subscription{upcoming7Days.length !== 1 ? 's' : ''} renewing soon
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {upcoming7Days.map(sub => (
                    <span
                      key={sub.id}
                      className={`category-badge category-${sub.category}`}
                    >
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Subscriptions List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 rounded-xl bg-card/80 border-border/60 shadow-card focus:shadow-card-hover transition-shadow"
              />
            </div>

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6 p-1.5 h-auto rounded-xl bg-muted/50">
                <TabsTrigger value="active" className="rounded-lg py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:shadow-soft">
                  Active ({activeSubscriptions.length})
                </TabsTrigger>
                <TabsTrigger value="inactive" className="rounded-lg py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:shadow-soft">
                  Inactive ({inactiveSubscriptions.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="space-y-3 mt-0">
                {activeSubscriptions.length === 0 ? (
                  <div className="glass-card p-12 text-center rounded-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">No active subscriptions</h3>
                    <p className="text-muted-foreground text-sm mb-6">Start tracking your subscriptions to stay on top of your spending</p>
                    <Button 
                      onClick={() => setIsAddDialogOpen(true)}
                      className="btn-gradient rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add your first subscription
                    </Button>
                  </div>
                ) : (
                  activeSubscriptions.map((sub, index) => (
                    <div 
                      key={sub.id} 
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}
                    >
                      <SubscriptionCard
                        subscription={sub}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onCancel={handleCancel}
                      />
                    </div>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="inactive" className="space-y-3 mt-0">
                {inactiveSubscriptions.length === 0 ? (
                  <div className="glass-card p-12 text-center rounded-2xl">
                    <p className="text-muted-foreground">No inactive subscriptions</p>
                  </div>
                ) : (
                  inactiveSubscriptions.map((sub, index) => (
                    <div 
                      key={sub.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}
                    >
                      <SubscriptionCard
                        subscription={sub}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Calendar Sidebar */}
          <div className="lg:col-span-1">
            <CalendarView subscriptions={subscriptions} />
          </div>
        </div>
      </main>

      {/* Add/Edit Dialog */}
      <AddSubscriptionDialog
        open={isAddDialogOpen}
        onOpenChange={handleCloseDialog}
        onAdd={handleAdd}
        editingSubscription={editingSubscription}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default Index;