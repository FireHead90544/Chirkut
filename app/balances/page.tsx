'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

// Types
interface Balance {
  userId: string;
  name: string;
  balance: number;
}

interface Stats {
  balances: Balance[];
}

interface Debt {
  from: string;
  to: string;
  amount: number;
}

// This is the core debt simplification algorithm
function simplifyDebts(balances: Balance[]): Debt[] {
  const debtors = balances.filter(b => b.balance < 0).map(b => ({ ...b, balance: -b.balance }));
  const creditors = balances.filter(b => b.balance > 0);

  const transactions: Debt[] = [];

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.round(Math.min(debtor.balance, creditor.balance)); // Apply Math.round here

    transactions.push({ from: debtor.name, to: creditor.name, amount });

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance === 0) {
      debtorIndex++;
    }
    if (creditor.balance === 0) {
      creditorIndex++;
    }
  }

  return transactions;
}

export default function BalancesPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [debts, setDebts] = useState<Debt[]>([]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-indexed
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/stats?month=${currentMonth}&year=${currentYear}`);
        const data = await response.json();
        setStats(data);
        if (data.balances) {
          setDebts(simplifyDebts(JSON.parse(JSON.stringify(data.balances))));
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }
    if (mounted) {
      fetchData();
    }
  }, [mounted, currentMonth, currentYear]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    let newMonth = currentMonth;
    let newYear = currentYear;

    if (direction === 'prev') {
      newMonth--;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
    } else {
      newMonth++;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  if (!mounted || loading) {
    return <p className="text-center text-muted-foreground py-8">Calculating balances...</p>;
  }

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
              <h1 className="text-2xl font-bold text-foreground mb-1">Balances</h1>
              <p className="text-sm text-muted-foreground">See who owes what to whom.</p>
            </div>
            <Button asChild variant="outline" className="mt-4 sm:mt-0">
              <Link href="/settlements/add">Add Settlement</Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 gap-4">
          <Button variant="outline" size="icon" onClick={() => handleMonthChange('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-foreground text-center">
            {new Date(currentYear, currentMonth - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="icon" onClick={() => handleMonthChange('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <>
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <DollarSign className="h-5 w-5" />
                All Balances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.balances.map((balance) => (
                  <div key={balance.userId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg bg-muted/50">
                    <div className="font-semibold text-card-foreground">{balance.name}</div>
                    <div className="text-left sm:text-right">
                      <div className={`text-lg font-bold ${balance.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {balance.balance >= 0 ? "+" : ""}₹{balance.balance.toFixed(2)}
                      </div>
                      <Badge variant={balance.balance >= 0 ? "default" : "destructive"} className="text-xs">
                        {balance.balance >= 0 ? "Is Owed" : "Owes"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <TrendingUp className="h-5 w-5" />
                Suggested Settlements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {debts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-green-500 mb-2">🎉</div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">All settled up!</h3>
                  <p className="text-muted-foreground">Everyone&apos;s balances are even.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {debts.map((debt, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg bg-muted/50">
                      <div className="font-semibold text-card-foreground">
                        {debt.from} → {debt.to}
                      </div>
                      <div className="text-lg font-bold text-card-foreground">₹{debt.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      </div>
    </div>
  );
}