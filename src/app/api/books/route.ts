import connectToDatabase from '@/lib/mongo';
import Book from '@/model/book';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    const books = await Book.find().sort({ createdAt: -1 });
    return NextResponse.json(books);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const book = await Book.create(body);
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
