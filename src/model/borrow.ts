import mongoose, { Document, Schema } from 'mongoose';

export interface IBorrow extends Document {
  bookId: mongoose.Types.ObjectId;
  bookTitle: string;
  bookAuthor: string;
  bookCoverImage: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  status: 'Borrowed' | 'Returned' | 'Overdue';
}

const BorrowSchema: Schema<IBorrow> = new Schema(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    bookTitle: { type: String, required: true },
    bookAuthor: { type: String, required: true },
    bookCoverImage: { type: String, default: '' },
    borrowerName: { type: String, required: true },
    borrowerEmail: { type: String, required: true },
    borrowDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ['Borrowed', 'Returned', 'Overdue'],
      default: 'Borrowed',
    },
  },
  { timestamps: true }
);

const Borrow = mongoose.models.Borrow || mongoose.model<IBorrow>('Borrow', BorrowSchema);
export default Borrow;
