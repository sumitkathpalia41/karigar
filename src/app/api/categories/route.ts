import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                subCategories: true,
            },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, subCategoryName } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Category name is required" }, { status: 400 });
        }

        // Find or create category
        let category = await prisma.category.findUnique({
            where: { name }
        });

        if (!category) {
            category = await prisma.category.create({
                data: { name }
            });
        }

        // If subcategory is provided, create it under this category
        let subCategory = null;
        if (subCategoryName) {
            // Check if it exists
            subCategory = await prisma.subCategory.findUnique({
                where: {
                    name_categoryId: {
                        name: subCategoryName,
                        categoryId: category.id
                    }
                }
            });

            if (!subCategory) {
                subCategory = await prisma.subCategory.create({
                    data: {
                        name: subCategoryName,
                        categoryId: category.id
                    }
                });
            }
        }

        // Return the updated category with its subcategories
        const updatedCategory = await prisma.category.findUnique({
            where: { id: category.id },
            include: { subCategories: true }
        });

        return NextResponse.json(updatedCategory, { status: 201 });
    } catch (error) {
        console.error("Failed to create category:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
