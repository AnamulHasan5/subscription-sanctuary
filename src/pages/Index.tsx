import { useState } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { StatCard } from '@/components/StatCard';
import { SubscriptionList } from '@/components/SubscriptionList';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { CalendarView } from '@/components/CalendarView';
import { AddSubscriptionDialog } from '@/components/AddSubscriptionDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Bell, Search, Settings } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">S</span>
              </div>
              <h1 className="text-xl font-semibold text-foreground">Subscript</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {upcoming7Days.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {upcoming7Days.length}
                  </span>
                )}
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Monthly Spend"
            value={stats.monthlySpend}
            subtitle="Across all active subscriptions"
            icon="credit-card"
            variant="primary"
          />
          <StatCard
            title="Yearly Spend"
            value={stats.yearlySpend}
            subtitle="Projected annual cost"
            icon="trending-up"
          />
          <StatCard
            title="Active"
            value={stats.totalActive.toString()}
            subtitle={`${stats.totalCancelled} cancelled`}
            icon="calendar"
          />
          <StatCard
            title="Renewing Soon"
            value={upcoming7Days.length.toString()}
            subtitle="In the next 7 days"
            icon="calendar"
            variant={upcoming7Days.length > 0 ? 'warning' : 'default'}
          />
        </div>

        {/* Upcoming Renewals Alert */}
        {upcoming7Days.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl bg-warning/10 border border-warning/20 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Bell className="h-4 w-4 text-warning" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Upcoming Renewals</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  You have {upcoming7Days.length} subscription{upcoming7Days.length !== 1 ? 's' : ''} renewing in the next 7 days
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
                className="pl-11"
              />
            </div>

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="active">
                  Active ({activeSubscriptions.length})
                </TabsTrigger>
                <TabsTrigger value="inactive">
                  Inactive ({inactiveSubscriptions.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="space-y-3">
                {activeSubscriptions.length === 0 ? (
                  <div className="glass-card p-8 text-center rounded-2xl">
                    <p className="text-muted-foreground">No active subscriptions</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add your first subscription
                    </Button>
                  </div>
                ) : (
                  activeSubscriptions.map((sub, index) => (
                    <div key={sub.id} style={{ animationDelay: `${index * 50}ms` }}>
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
              
              <TabsContent value="inactive" className="space-y-3">
                {inactiveSubscriptions.length === 0 ? (
                  <div className="glass-card p-8 text-center rounded-2xl">
                    <p className="text-muted-foreground">No inactive subscriptions</p>
                  </div>
                ) : (
                  inactiveSubscriptions.map((sub, index) => (
                    <div key={sub.id} style={{ animationDelay: `${index * 50}ms` }}>
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
