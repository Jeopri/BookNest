import connectToDatabase from "@/lib/mongo";
import User from "@/model/Users";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      email: string;
      name?: string;
      image?: string;
      role: string;
    };
  }
  interface User {
    role: string;
    image?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    image?: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        await connectToDatabase();
        const user = await User.findOne({ email: credentials?.email });
        if (!user) throw new Error("User not found");

        const isPasswordCorrect = await bcrypt.compare(
          credentials?.password ?? "",
          user.password as string
        );
        if (!isPasswordCorrect) throw new Error("Invalid password");

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstname} ${user.lastname}`,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        await connectToDatabase();
        const existing = await User.findOne({ email: profile?.email });
        const image = (profile?.picture as string) || '';
        if (!existing) {
          const nameParts = (profile?.name || 'User').split(' ');
          const firstname = nameParts[0] || 'User';
          const lastname = nameParts.slice(1).join(' ') || 'Unknown';
          await User.create({
            firstname,
            lastname,
            email: profile?.email,
            image,
            role: 'customer',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else if (image) {
          await User.updateOne({ email: profile.email }, { image });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === 'google' && user.email) {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.email = dbUser.email;
            token.name = `${dbUser.firstname} ${dbUser.lastname}`;
            token.role = dbUser.role;
            token.image = dbUser.image;
          }
        } else {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.role = user.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          email: token.email,
          name: token.name,
          role: token.role,
          image: token.image,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
