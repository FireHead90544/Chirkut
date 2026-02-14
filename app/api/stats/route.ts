import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate'
import { NextResponse } from 'next/server';

interface DateFilter {
  gte: Date;
  lte: Date;
}

interface WhereClause {
  date?: DateFilter;
}

const prisma = new PrismaClient().$extends(withAccelerate())

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let whereClause: WhereClause = {};

    if (month && year) {
      const m = parseInt(month) - 1; // Month is 0-indexed in Date object
      const y = parseInt(year);
      const startDate = new Date(Date.UTC(y, m, 1));
      const endDate = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999)); // Last millisecond of the last day of the month
      whereClause = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const users = await prisma.user.findMany();
    const expenses = await prisma.expense.findMany({ where: whereClause });
    const settlements = await prisma.settlement.findMany({ where: whereClause });

    const numUsers = users.length;
    if (numUsers === 0) {
      return NextResponse.json({ balances: [], totalExpenses: 0, categoryBreakdown: [] });
    }

    const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    const sharePerUser = totalExpenses / numUsers;

    const userBalances: { [key: string]: number } = {};
    users.forEach(user => {
      userBalances[user.id] = 0;
    });

    // Calculate what each person has paid
    expenses.forEach(expense => {
      if (userBalances[expense.payerId] !== undefined) {
        userBalances[expense.payerId] += expense.amount;
      }
    });

    // Factor in settlements
    settlements.forEach(settlement => {
      if (userBalances[settlement.fromId] !== undefined) {
        userBalances[settlement.fromId] += settlement.amount;
      }
      if (userBalances[settlement.toId] !== undefined) {
        userBalances[settlement.toId] -= settlement.amount;
      }
    });

    // Calculate final balances (Paid - Share)
    const finalBalances = users.map(user => {
      const balance = Math.round(userBalances[user.id] - sharePerUser); // Apply Math.round here
      return {
        userId: user.id,
        name: user.name,
        balance: balance,
      };
    });

    // Calculate category breakdown
    const categoryBreakdown: { [key: string]: number } = {};
    expenses.forEach(expense => {
      if (categoryBreakdown[expense.category] === undefined) {
        categoryBreakdown[expense.category] = 0;
      }
      categoryBreakdown[expense.category] += expense.amount;
    });

    const categoryArray = Object.keys(categoryBreakdown).map(key => ({
      name: key,
      value: categoryBreakdown[key],
    }));

    return NextResponse.json({
      balances: finalBalances,
      totalExpenses,
      sharePerUser,
      categoryBreakdown: categoryArray,
    });

  } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
