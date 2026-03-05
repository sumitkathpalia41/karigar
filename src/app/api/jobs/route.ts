import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        if (role !== "CUSTOMER") {
            return NextResponse.json({ error: "Only customers can post jobs" }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, requirements, mediaUrl, mediaType } = body;

        if (!title || !description) {
            return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
        }

        const job = await prisma.job.create({
            data: {
                title,
                description,
                requirements,
                mediaUrl,
                mediaType,
                customerId: userId,
            },
        });

        return NextResponse.json(job, { status: 201 });
    } catch (error) {
        console.error("Failed to post job:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
