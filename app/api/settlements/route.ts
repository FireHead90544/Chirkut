import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate'
import { NextResponse } from 'next/server';

const prisma = new PrismaClient().$extends(withAccelerate())

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fromId, toId, amount, date } = body;

    if (!fromId || !toId || !amount || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const settlement = await prisma.settlement.create({
      data: {
        fromId,
        toId,
        amount: parseFloat(amount),
        date: new Date(date),
      },
    });

    return NextResponse.json(settlement, { status: 201 });
  } catch (error) {
    console.error('Error creating settlement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const settlements = await prisma.settlement.findMany({
      include: {
        from: true,
        to: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json(settlements);
  } catch (error) {
    console.error('Error fetching settlements:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
