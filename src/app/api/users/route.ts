import { authOptions } from "@/app/api/auth/authOptions";
import connectToDatabase from "@/lib/mongo";
import User from "@/model/Users";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

async function getAdminUser(session: Awaited<ReturnType<typeof getServerSession>>) {
  if (!session?.user?.email) return null;
  await connectToDatabase();
  return User.findOne({ email: session.user.email }).select("role");
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const admin = await getAdminUser(session);
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const admin = await getAdminUser(session);
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { firstname, lastname, email, password, role } = await req.json();

    if (!firstname || !lastname || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    await connectToDatabase();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role: role || 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;
    return NextResponse.json({ message: "User created successfully", user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
