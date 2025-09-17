import { NextResponse } from 'next/server';

// Dummy counter value, replace with DB or persistent storage as needed
let counter = 42;

export async function GET() {
  return NextResponse.json({ count: counter });
}

export async function POST() {
  counter++;
  return NextResponse.json({ count: counter });
}
