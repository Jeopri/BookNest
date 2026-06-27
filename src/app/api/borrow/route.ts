import connectToDatabase from '@/lib/mongo';
import Book from '@/model/book';
import Borrow from '@/model/borrow';
import Notification from '@/model/notification';
import { sendBorrowConfirmation } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    const records = await Borrow.find().sort({ borrowDate: -1 });
    return NextResponse.json(records);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { bookId, borrowerName, borrowerEmail, dueDate } = await req.json();

    const book = await Book.findById(bookId);
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    if (book.status !== 'Available') return NextResponse.json({ error: 'Book is not available' }, { status: 400 });

    const record = await Borrow.create({
      bookId,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCoverImage: book.coverImage,
      borrowerName,
      borrowerEmail,
      borrowDate: new Date(),
      dueDate: new Date(dueDate),
      status: 'Borrowed',
    });

    book.status = 'On Loan';
    await book.save();

    await Notification.create({
      type: 'borrow',
      message: `"${book.title}" was borrowed by ${borrowerName}`,
      bookId: book._id,
      bookTitle: book.title,
      borrowerName,
    });

    let emailSent = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendBorrowConfirmation({
          to: borrowerEmail,
          bookTitle: book.title,
          bookAuthor: book.author,
          borrowerName,
          borrowDate: record.borrowDate.toISOString(),
          dueDate,
        });
        emailSent = true;
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr);
      }
    }

    return NextResponse.json({ ...record.toObject(), emailSent }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
