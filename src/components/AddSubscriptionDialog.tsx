import { useState } from 'react';
import { Subscription, Category, BillingCycle, categoryLabels, billingCycleLabels } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Sparkles } from 'lucide-react';

interface AddSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
  editingSubscription?: Subscription | null;
  onUpdate?: (id: string, updates: Partial<Subscription>) => void;
}

const categories: Category[] = ['streaming', 'saas', 'domain', 'hosting', 'tools', 'ai'];
const billingCycles: BillingCycle[] = ['weekly', 'monthly', 'quarterly', 'yearly'];

export function AddSubscriptionDialog({
  open,
  onOpenChange,
  onAdd,
  editingSubscription,
  onUpdate,
}: AddSubscriptionDialogProps) {
  const isEditing = !!editingSubscription;
  
  const [name, setName] = useState(editingSubscription?.name || '');
  const [category, setCategory] = useState<Category>(editingSubscription?.category || 'saas');
  const [cost, setCost] = useState(editingSubscription?.cost?.toString() || '');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(editingSubscription?.billingCycle || 'monthly');
  const [nextRenewal, setNextRenewal] = useState(
    editingSubscription ? format(new Date(editingSubscription.nextRenewal), 'yyyy-MM-dd') : ''
  );
  const [paymentMethod, setPaymentMethod] = useState(editingSubscription?.paymentMethod || '');
  const [notes, setNotes] = useState(editingSubscription?.notes || '');

  const resetForm = () => {
    setName('');
    setCategory('saas');
    setCost('');
    setBillingCycle('monthly');
    setNextRenewal('');
    setPaymentMethod('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!name.trim()) {
      return;
    }
    if (!cost || isNaN(parseFloat(cost)) || parseFloat(cost) < 0) {
      return;
    }
    if (!nextRenewal) {
      return;
    }
    
    const subscriptionData: any = {
      name: name.trim(),
      category,
      cost: parseFloat(cost),
      billingCycle,
      nextRenewal: new Date(nextRenewal),
      status: 'active' as const,
    };
    
    // Only add optional fields if they have values (Firestore doesn't accept undefined)
    if (paymentMethod.trim()) {
      subscriptionData.paymentMethod = paymentMethod.trim();
    }
    if (notes.trim()) {
      subscriptionData.notes = notes.trim();
    }

    if (isEditing && editingSubscription && onUpdate) {
      onUpdate(editingSubscription.id, subscriptionData);
    } else {
      onAdd(subscriptionData);
    }
    
    resetForm();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    } else if (editingSubscription) {
      setName(editingSubscription.name || '');
      setCategory(editingSubscription.category || 'saas');
      setCost(editingSubscription.cost?.toString() || '');
      setBillingCycle(editingSubscription.billingCycle || 'monthly');
      setNextRenewal(editingSubscription.nextRenewal ? format(new Date(editingSubscription.nextRenewal), 'yyyy-MM-dd') : '');
      setPaymentMethod(editingSubscription.paymentMethod || '');
      setNotes(editingSubscription.notes || '');
    } else {
      // Reset form for new subscription
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">
              {isEditing ? 'Edit Subscription' : 'New Subscription'}
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {isEditing ? 'Update your subscription details' : 'Add a new subscription to track'}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">Service Name</Label>
            <Input
              id="name"
              placeholder="Netflix, ChatGPT, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="rounded-lg">
                      {categoryLabels[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cycle" className="text-sm font-semibold">Billing Cycle</Label>
              <Select value={billingCycle} onValueChange={(v) => setBillingCycle(v as BillingCycle)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {billingCycles.map((cycle) => (
                    <SelectItem key={cycle} value={cycle} className="rounded-lg">
                      {billingCycleLabels[cycle]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost" className="text-sm font-semibold">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="9.99"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="renewal" className="text-sm font-semibold">Next Renewal</Label>
              <Input
                id="renewal"
                type="date"
                value={nextRenewal}
                onChange={(e) => setNextRenewal(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment" className="text-sm font-semibold">
              Payment Method <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="payment"
              placeholder="Visa ending in 4242"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="rounded-xl resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl px-5">
              Cancel
            </Button>
            <Button type="submit" className="btn-gradient rounded-xl px-6">
              {isEditing ? 'Save Changes' : 'Add Subscription'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}