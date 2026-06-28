import { authOptions } from "@/app/api/auth/authOptions";
import connectToDatabase from "@/lib/mongo";
import User from "@/model/Users";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function getAdminUser(session: Awaited<ReturnType<typeof getServerSession>>) {
  if (!session?.user?.email) return null;
  await connectToDatabase();
  return User.findOne({ email: session.user.email }).select("role");
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const admin = await getAdminUser(session);
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const user = await User.findByIdAndUpdate(id, body, { new: true, runValidators: true }).select("-password");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const admin = await getAdminUser(session);
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
