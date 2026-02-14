
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, PieChart, BarChart3, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import CategoryPieChart from "@/components/category-pie-chart";
import BalanceBarChart from "@/components/balance-bar-chart";
import ExpenseTimeline from "@/components/expense-timeline";

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

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-indexed
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    async function fetchStats() {
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
  }, [currentMonth, currentYear]);

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

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Loading reports data...</p>;
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
          <h1 className="text-2xl font-bold text-foreground mb-1">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Visual insights into your shared expenses</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Expenses</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">₹{stats?.totalExpenses.toFixed(2) ?? '0.00'}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Share Per Person</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">₹{stats?.sharePerUser.toFixed(2) ?? '0.00'}</div>
              <p className="text-xs text-muted-foreground">Equal share</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Categories</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stats?.categoryBreakdown.length ?? 0}</div>
              <p className="text-xs text-muted-foreground">Active categories</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CategoryPieChart data={stats?.categoryBreakdown ?? []} />
          <BalanceBarChart balances={stats?.balances ?? []} />
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <BarChart3 className="h-5 w-5" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseTimeline />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
