
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate'
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient().$extends(withAccelerate())

export async function POST(request: Request) {
  try {
    const { name, pin } = await request.json();

    const user = await prisma.user.findUnique({
      where: { name },
    });

    if (!user || !user.pin) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const pinMatch = await bcrypt.compare(pin, user.pin);

    if (!pinMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Return user data without the pin
    const { ...userData } = user;
    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
