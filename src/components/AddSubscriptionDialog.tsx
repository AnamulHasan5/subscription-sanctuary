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
    
    const subscriptionData = {
      name,
      category,
      cost: parseFloat(cost),
      billingCycle,
      nextRenewal: new Date(nextRenewal),
      status: 'active' as const,
      paymentMethod: paymentMethod || undefined,
      notes: notes || undefined,
    };

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
      setName(editingSubscription.name);
      setCategory(editingSubscription.category);
      setCost(editingSubscription.cost.toString());
      setBillingCycle(editingSubscription.billingCycle);
      setNextRenewal(format(new Date(editingSubscription.nextRenewal), 'yyyy-MM-dd'));
      setPaymentMethod(editingSubscription.paymentMethod || '');
      setNotes(editingSubscription.notes || '');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? 'Edit Subscription' : 'Add New Subscription'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              placeholder="Netflix, ChatGPT, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabels[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cycle">Billing Cycle</Label>
              <Select value={billingCycle} onValueChange={(v) => setBillingCycle(v as BillingCycle)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {billingCycles.map((cycle) => (
                    <SelectItem key={cycle} value={cycle}>
                      {billingCycleLabels[cycle]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="9.99"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="renewal">Next Renewal</Label>
              <Input
                id="renewal"
                type="date"
                value={nextRenewal}
                onChange={(e) => setNextRenewal(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment">Payment Method (optional)</Label>
            <Input
              id="payment"
              placeholder="Visa ending in 4242"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Save Changes' : 'Add Subscription'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
