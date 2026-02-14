'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Receipt, Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Define the types based on our new API response
interface User {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  payer: User;
  notes: string | null;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const response = await fetch('/api/expenses');
        if (!response.ok) {
          throw new Error('Failed to fetch expenses');
        }
        const data = await response.json();
        setExpenses(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchExpenses();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">All Expenses</h1>
              <p className="text-sm text-muted-foreground">A log of all shared expenses, split equally.</p>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90 mt-4 sm:mt-0">
              <Link href="/expenses/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <p>Loading expenses...</p>
        ) : !expenses || expenses.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No expenses yet</h3>
              <p className="text-muted-foreground mb-4">Start by adding your first shared expense</p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/expenses/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Expense
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <Card key={expense.id} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-card-foreground">{expense.title}</h3>
                        <Badge variant="secondary">{expense.category}</Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Paid by {expense.payer.name}
                        </div>
                      </div>

                      {expense.notes && (
                        <p className="text-sm text-muted-foreground italic">Notes: {expense.notes}</p>
                      )}

                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-2xl font-bold text-card-foreground">₹{expense.amount.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Split equally</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}