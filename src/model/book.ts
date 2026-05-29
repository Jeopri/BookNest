// models/Book.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  genre: string;
  publishDate: Date;
  price: number;
  status: string;
  description: string;
  coverImage: string;
}

const BookSchema: Schema<IBook> = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: {
      type: String,
      required: true,
      enum: [
        'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Romance',
        'Horror', 'Biography', 'History', 'Classic', 'Adventure', 'Coming-of-age', 'Gothic',
      ],
    },
    publishDate: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ['Available', 'On Loan', 'Reserved', 'Out of Stock'],
    },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
  },
  { timestamps: true }
);

// Prevent model overwrite on hot-reload
const Books =  mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);

export default Books;