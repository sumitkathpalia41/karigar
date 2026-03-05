import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const products = await prisma.product.findMany({
            where: { shopId: id },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
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
        const { name, description, price, quality, videoUrl, brand, categoryId, subCategoryId } = await req.json();

        if (!name || !price) {
            return NextResponse.json({ error: "Name and Price are required" }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                quality,
                videoUrl,
                brand,
                categoryId,
                subCategoryId,
                shopId: id
            }

        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error("Product creation error:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
