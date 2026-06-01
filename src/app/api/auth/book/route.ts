// app/api/books/route.ts
import connectToDatabase from '@/lib/mongo';
import Book from '@/model/book';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const newBook = await Book.create(body);
    return NextResponse.json({ success: true, book: newBook }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}