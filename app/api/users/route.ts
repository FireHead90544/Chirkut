import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate'
import { NextResponse } from 'next/server';


const prisma = new PrismaClient().$extends(withAccelerate())

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}
