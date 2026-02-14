
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Category } from '@prisma/client';

export default function AddExpenseForm() {
  const router = useRouter();
  const { users, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => ({
    title: '',
    amount: '',
    category: '' as Category | '',
    payerId: currentUser?.id || '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  }));

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({ ...prev, payerId: currentUser.id }));
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.payerId) {
        alert('Please select who paid.');
        return;
    }
    if (!formData.category) {
        alert('Please select a category.');
        return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', response.status, response.statusText, errorData);
        // Add a more specific alert for debugging
        alert(`Failed to add expense: ${errorData.message || 'Unknown API error'}. Status: ${response.status}`);
        throw new Error(errorData.message || 'Failed to add expense');
      }

      router.push('/'); // Redirect to homepage
    } catch (error: unknown) {
      console.error('Error adding expense:', error);
      if (error instanceof Error) {
        alert(`Failed to add expense: ${error.message || 'Unknown error'}`);
      } else {
        alert('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Receipt className="h-5 w-5" />
            Expense Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-card-foreground">
              Description
            </Label>
            <Textarea
              id="title"
              placeholder="What was this expense for?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-card-foreground">
                Amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-card-foreground">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-card-foreground">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as Category })}
                required
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Category).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payerId" className="text-card-foreground">
                Paid By
              </Label>
              <Select value={formData.payerId} onValueChange={(value) => setFormData({ ...formData, payerId: value })} required>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select who paid" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
           <div className="space-y-2">
            <Label htmlFor="notes" className="text-card-foreground">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes here..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-background border-border text-foreground"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/">
            Cancel
          </Link>
        </Button>
        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
          {loading ? 'Adding...' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
}
