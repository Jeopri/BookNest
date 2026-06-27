import connectToDatabase from '@/lib/mongo';
import Notification from '@/model/notification';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(6);
    const unreadCount = await Notification.countDocuments({ read: false });
    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const { ids } = await req.json();
    await Notification.updateMany({ _id: { $in: ids } }, { $set: { read: true } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
