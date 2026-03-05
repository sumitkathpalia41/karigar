import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";


export default async function ShopDetails({ params }: { params: { id: string } }) {
    const session = await auth();
    const userId = (session?.user as any)?.id;

    const shop = await prisma.shop.findUnique({
        where: { id: params.id },
        include: {
            owner: true,
            products: true,
            reviews: { include: { reviewer: true } }
        }
    });

    if (!shop) notFound();

    const isOwner = shop.ownerId === userId;

    return (
        <div className="container py-10">
            <div className="shop-hero glass-card animate-fade-in">
                <div className="shop-header-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="breadcrumb"><Link href="/shops">Shops</Link> / {shop.name}</p>
                            <h1>{shop.name}</h1>
                            <p className="owner">Owned by {shop.owner.name}</p>
                        </div>
                        {isOwner && (
                            <Link href={`/shops/${shop.id}/manage`} className="btn btn-primary">Manage Shop</Link>
                        )}
                    </div>

                    <div className="shop-description">
                        <p>{shop.description || "Welcome to our shop! We provide premium quality wood and hardware materials."}</p>
                    </div>
                    {shop.introVideoUrl && (
                        <div className="video-btn">
                            <a href={shop.introVideoUrl} target="_blank" className="btn btn-outline btn-sm">Watch Intro Video</a>
                        </div>
                    )}
                </div>
            </div>

            <section className="products-section">
                <h2>Products & Inventory</h2>
                <div className="product-grid">
                    {shop.products.length === 0 ? (
                        <div className="empty-state">No products listed yet.</div>
                    ) : (
                        shop.products.map((product) => (
                            <div key={product.id} className="product-card glass-card">
                                <div className="product-header">
                                    <h3>{product.name}</h3>
                                    <p className="price">₹{product.price}</p>
                                </div>
                                <p className="quality">Quality: {product.quality || "Standard"}</p>
                                <p className="p-desc">{product.description}</p>
                                <button className="btn btn-primary btn-sm btn-block" onClick={() => alert("Cart feature coming soon!")}>Add to Cart</button>
                            </div>
                        ))
                    )}
                </div>
            </section>

        </div>
    );
}
