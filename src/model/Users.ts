import mongoose, { Document, Model, Schema } from 'mongoose';


interface IUser extends Document {
    firstname: string;
    lastname: string;
    email: string;
    password?: string;
    image?: string;
    role: 'admin' | 'customer' | 'staff';
    createdAt?: Date;
    updatedAt?: Date;
    id: string;
}

const UserSchema: Schema<IUser> = new mongoose.Schema(
    {
      firstname: {
        type: String,
        required: true,
      },
      lastname: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: false,
      },
      role: {
        type: String,
        enum: ['admin', 'customer', 'staff'],
        default: 'customer',
      },
      image: {
        type: String,
        default: '',
      },
      createdAt: { type: Date },
      updatedAt: { type: Date }
    },
    {
      timestamps: true,
    }
  );

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;