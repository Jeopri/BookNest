import { authOptions } from "@/app/api/auth/authOptions";
import connectToDatabase from "@/lib/mongo";
import User from "@/model/Users";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    await connectToDatabase();
    const user = await User.findOne({
      email: session.user.email,
    }).select("-password");
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    // Count all users
    const totalUsers = await User.countDocuments();
    return NextResponse.json({
      user,
      totalUsers,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}