import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ShopSearch from "./ShopSearch";

export default async function ShopsPage({
    searchParams,
}: {
    searchParams: { view?: string; q?: string };
}) {
    const view = searchParams.view || "shops";
    const query = searchParams.q || "";

    let shops: any[] = [];
    let products: any[] = [];

    if (view === "shops") {
        shops = await prisma.shop.findMany({
            where: {
                name: { contains: query },
            },
            include: { owner: { select: { name: true } } }
        });
    } else {
        products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { brand: { contains: query } },
                    { description: { contains: query } }
                ]
            },
            include: { shop: { select: { name: true } } }
        });
    }

    return (
        <div className="container py-10">
            <header className="page-header">
                <h1>Marketplace Discovery</h1>
                <p>Find the best materials and trusted sellers.</p>
            </header>

            <ShopSearch />

            <div className="shop-grid">
                {view === "shops" ? (
                    shops.length === 0 ? (
                        <div className="empty-state">No shops found matching "{query}".</div>
                    ) : (
                        shops.map((shop) => (
                            <Link href={`/shops/${shop.id}`} key={shop.id} className="shop-card glass-card">
                                <div className="shop-info">
                                    <h3>{shop.name}</h3>
                                    <p className="owner">By {shop.owner?.name}</p>
                                    <p className="description">{shop.description || "No description available."}</p>
                                </div>
                                <div className="shop-footer">
                                    <span className="btn btn-primary btn-sm">Visit Shop</span>
                                </div>
                            </Link>
                        ))
                    )
                ) : (
                    products.length === 0 ? (
                        <div className="empty-state">No products found matching "{query}".</div>
                    ) : (
                        products.map((product) => (
                            <div key={product.id} className="shop-card glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="shop-info" style={{ flex: 1 }}>
                                    <h3>{product.name}</h3>
                                    <p className="owner">Brand: {product.brand || 'Unbranded'}</p>
                                    <p className="description">{product.description || "No description available."}</p>
                                    <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>${product.price}</p>
                                </div>
                                <div className="shop-footer">
                                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>Sold by: {product.shop?.name}</span>
                                    <Link href={`/shops/${product.shopId}`} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>View Shop</Link>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
}
