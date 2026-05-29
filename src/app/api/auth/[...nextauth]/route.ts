import connectToDatabase from "@/lib/mongo";
import User from "@/model/Users";
import bcrypt from 'bcryptjs';
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";


const handler = NextAuth({

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
                async authorize(credentials){
                    try{
                        await connectToDatabase();
                        const user = await User.findOne({
                            email: credentials?.email
                        });
                        if(!user){
                            throw new Error("no user found")
                        }
                        const isPasswordCorrect = await bcrypt.compare(
                            credentials?.password ?? "",
                            user.password as string
                        );
                        if(!isPasswordCorrect){
                            throw new Error("")
                        }
                        return user;
                    }
                    catch { 
                        return null
                    }
                }
        })
    ],
    callbacks: {
        async jwt({ token, user}){
            if(user){
                token.id = user.id;
                token.email = user.email;

            }
            return token;
        },
        async session({ session, token}){
            if(token){
                session.user = {
                    email: token.email,
                   name: token.name,
                //    image: token.image,
                    
                };
            };
            return session
        }
    },
    pages: {
        signIn: "/signin"
    },
    secret: process.env.NEXTAUTH_SECRET

})

export { handler as GET, handler as POST };
