import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string, productId: string }> }
) {
    const { id, productId } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;

    // Verify shop ownership
    const shop = await prisma.shop.findUnique({
        where: { id }
    });

    if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    if (shop.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const body = await req.json();
        const { name, description, price, quality, videoUrl } = body;

        const product = await prisma.product.update({
            where: { id: productId },
            data: {
                ...(name && { name }),
                ...(description && { description }),
                ...(price && { price: parseFloat(price) }),
                ...(quality && { quality }),
                ...(videoUrl && { videoUrl }),
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string, productId: string }> }
) {
    const { id, productId } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;

    // Verify shop ownership
    const shop = await prisma.shop.findUnique({
        where: { id }
    });

    if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    if (shop.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        await prisma.product.delete({
            where: { id: productId }
        });
        return NextResponse.json({ message: "Product deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
