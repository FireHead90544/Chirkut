
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Receipt, TrendingUp, Users, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import CategoryPieChart from "@/components/category-pie-chart";
import ExpenseTimeline from '@/components/expense-timeline';
import { StatsProvider, useStats } from "@/lib/stats-context";

// Define types for our stats API
interface Balance {
  userId: string;
  name: string;
  balance: number;
}

interface CategoryStat {
  name: string;
  value: number;
}

interface Stats {
  balances: Balance[];
  totalExpenses: number;
  sharePerUser: number;
  categoryBreakdown: CategoryStat[];
}

function HomePageContent() {
  const { users, currentUser, setCurrentUser, loading: authLoading, logout } = useAuth();
  const { refreshTrigger } = useStats();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-indexed
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    async function fetchStats() {
      if (!currentUser || !mounted) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/stats?month=${currentMonth}&year=${currentYear}`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [currentUser, mounted, currentMonth, currentYear, refreshTrigger]); // Refetch stats when user or month/year changes

  const handleUserChange = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

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

  const currentUserBalance = stats?.balances.find(b => b.userId === currentUser?.id);

  if (!mounted || authLoading || loading) {
    return <p className="text-center text-muted-foreground py-8">Loading dashboard data...</p>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back, {currentUser?.name}!</h1>
            <p className="text-sm text-muted-foreground">Here is your shared expense summary.</p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Select value={currentUser?.id} onValueChange={handleUserChange}>
              <SelectTrigger className="bg-background border-border text-foreground w-full md:w-auto">
                <SelectValue placeholder="Switch User" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={logout} className="flex items-center gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="icon" onClick={() => handleMonthChange('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-foreground">
            {new Date(currentYear, currentMonth - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="icon" onClick={() => handleMonthChange('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Expenses</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">₹{stats?.totalExpenses.toFixed(2) ?? '0.00'}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Your Share</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">₹{stats?.sharePerUser.toFixed(2) ?? '0.00'}</div>
              <p className="text-xs text-muted-foreground">Per person</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                {currentUserBalance && currentUserBalance.balance < 0 ? "You Owe" : "You're Owed"}
              </CardTitle>
              <TrendingUp
                className={`h-4 w-4 ${currentUserBalance && currentUserBalance.balance < 0 ? "text-red-500" : "text-green-500"}`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${currentUserBalance && currentUserBalance.balance < 0 ? "text-red-500" : "text-green-500"}`}>
                ₹{currentUserBalance ? Math.abs(currentUserBalance.balance).toFixed(2) : "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">Your current balance</p>
            </CardContent>
          </Card>

            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Who Owes Who</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/balances">View Details</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-4 mb-8">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/expenses/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Link>
          </Button>
           <Button asChild variant="outline">
            <Link href="/settlements/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Settlement
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/expenses">View All Expenses</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/reports">View Reports</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <CategoryPieChart data={stats?.categoryBreakdown ?? []} />
            <ExpenseTimeline />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <StatsProvider>
      <HomePageContent />
    </StatsProvider>
  );
}
