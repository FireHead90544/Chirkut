
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate'
import { NextResponse } from 'next/server';


const prisma = new PrismaClient().$extends(withAccelerate())

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pin = searchParams.get('pin');

    const dbResetPin = process.env.DB_RESET_PIN;

    if (!dbResetPin) {
      return NextResponse.json({ error: 'DB_RESET_PIN not configured' }, { status: 500 });
    }

    if (pin !== dbResetPin) {
      return NextResponse.json({ error: 'Unauthorized: Invalid PIN' }, { status: 401 });
    }

    await prisma.expense.deleteMany({});
    await prisma.settlement.deleteMany({});
    return NextResponse.json({ message: 'Database cleared' }, { status: 200 });
  } catch (error) {
    console.error('Error clearing database:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
