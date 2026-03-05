import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        const { email, password, name, role } = await req.json();

        if (!email || !password || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email already taken" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role as any,
            },
        });

        // Create associations based on role
        if (role === "SHOPKEEPER") {
            await prisma.shop.create({
                data: {
                    name: `${name}'s Shop`,
                    ownerId: user.id,
                },
            });
        } else if (role === "CARPENTER") {
            await prisma.carpenterProfile.create({
                data: {
                    userId: user.id,
                },
            });
        }

        return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
    } catch (error: any) {
        console.error("Registration error full stack:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
