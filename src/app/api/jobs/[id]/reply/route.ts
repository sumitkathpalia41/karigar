import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        if (role !== "CARPENTER" && role !== "SHOPKEEPER") {
            return NextResponse.json({ error: "Only carpenters and shopkeepers can reply to jobs" }, { status: 403 });
        }

        const body = await req.json();
        const { message, quote } = body;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const reply = await prisma.jobReply.create({
            data: {
                message,
                quote: quote ? parseFloat(quote) : null,
                jobId: id,
                senderId: userId,
            },
        });

        return NextResponse.json(reply, { status: 201 });
    } catch (error) {
        console.error("Failed to post reply:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
