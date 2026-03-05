import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const { rating, comment, carpenterId, shopId, jobId } = await req.json();

    if (!rating || (!carpenterId && !shopId)) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verification Logic: Only allow reviews if a COMPLETED job exists
    if (jobId) {
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: { review: true }
        });

        if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
        if (job.status !== "COMPLETED") {
            return NextResponse.json({ error: "You can only review after the service is COMPLETED" }, { status: 400 });
        }
        if (job.review) {
            return NextResponse.json({ error: "Review already submitted for this job" }, { status: 400 });
        }
        if (job.customerId !== userId) {
            return NextResponse.json({ error: "Only the customer who posted the job can review it" }, { status: 403 });
        }
    } else {
        // Fallback for general reviews (if any) or if jobId is missing but carpenterId is provided
        // We could search for ANY completed job between them
        if (carpenterId) {
            const completedJob = await prisma.job.findFirst({
                where: {
                    customerId: userId,
                    carpenterId: carpenterId,
                    status: "COMPLETED"
                }
            });
            if (!completedJob) {
                return NextResponse.json({ error: "You can only review a carpenter after they have completed a job for you" }, { status: 400 });
            }
        }
        // Shop review verification could follow similar logic if we had orders
    }

    const review = await prisma.review.create({
        data: {
            rating: Number(rating),
            comment,
            reviewerId: userId,
            carpenterId,
            shopId,
            jobId,
        },
    });

    return NextResponse.json(review, { status: 201 });
}
