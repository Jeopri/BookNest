import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  type: 'borrow' | 'return' | 'overdue';
  message: string;
  bookId?: mongoose.Types.ObjectId;
  bookTitle?: string;
  borrowerName?: string;
  read: boolean;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    type: { type: String, enum: ['borrow', 'return', 'overdue'], required: true },
    message: { type: String, required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book' },
    bookTitle: { type: String },
    borrowerName: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
