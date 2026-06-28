import connectToDatabase from '@/lib/mongo';
import User from '@/model/Users';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request){
    const { firstname, lastname, email, password } = await request.json();

    const isValidEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    if(!isValidEmail(email)){
        return NextResponse.json({error: "Invalid email address"}, {status: 400})
    }
    if(!firstname || !lastname || !email || !password){
        return NextResponse.json({message: "All fields are required"}, {status: 400})
    }
    if(password.length < 6){
        return NextResponse.json({message: "Password must be at least 6 characters"}, {status: 400})
    }
        try {
            await connectToDatabase();
            const existingUser = await User.findOne({email});
            if(existingUser){
                return NextResponse.json({message: "The user Already existed"}, {status: 400}) 
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.create({
                firstname,
                lastname,
                email,
                password: hashedPassword,
                role: 'customer',
                createdAt: new Date(),
                updatedAt: new Date()
            })
            await newUser.save();
            return NextResponse.json({message: "User Created Succesfully"}, {status: 201})
            
        } catch (error) {
            console.log(error)
            return NextResponse.json({message: "Something Went Wrong"},{status: 500})
        }
}