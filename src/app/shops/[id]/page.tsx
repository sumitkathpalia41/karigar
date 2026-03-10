import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";


export default async function ShopDetails({ params }: { params: { id: string } }) {
  //const session = await auth();
  //const userId = (session?.user as any)?.id;
  // Await params in Next.js 15+
  const resolvedParams = await params;
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const shop = await prisma.shop.findUnique({
    where: { id: resolvedParams.id },
    include: {
      owner: true,
      products: true,
    },
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
              <p className="owner-info">Owned by {shop.owner.name}</p>
            </div>
            {isOwner && (
              <Link href={`/shops/${shop.id}/manage`} className="btn btn-primary">Manage Shop</Link>
            )}
          </div>
        </div>

        <div className="shop-description">
          <p>{shop.description || "Welcome to our shop! We provide premium quality wood and hardware materials."}</p>
        </div>
        {shop.introVideoUrl && (
          <div className="shop-video">
            <video src={shop.introVideoUrl} controls />
          </div>
        )}
      </div>

      <section className="products-section">
        <h2>Products</h2>
        {shop.products.length === 0 ? (
          <div className="empty-state">No products added yet.</div>
        ) : (
          <div className="product-grid">
            {shop.products.map((product) => (
              <div key={product.id} className="product-card glass-card">
                <h3>{product.name}</h3>
                <p className="product-brand">{product.brand || 'Brand: N/A'}</p>
                <p className="product-price">₹{product.price.toFixed(2)}</p>
                {product.description && <p className="product-desc">{product.description}</p>}
                {product.videoUrl && (
                  <a href={product.videoUrl} target="_blank" rel="noopener noreferrer" className="video-link">View Video</a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .shop-hero { padding: 2rem; margin-bottom: 3rem; }
        .breadcrumb { color: var(--text-muted); margin-bottom: 0.5rem; }
        .owner-info { color: var(--text-muted); margin-top: 0.5rem; }
        .products-section h2 { margin-bottom: 2rem; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
        .product-card { padding: 1.5rem; }
        .product-brand { color: var(--text-muted); font-size: 0.9rem; }
        .product-price { font-size: 1.5rem; font-weight: 700; color: var(--primary); margin: 0.5rem 0; }
      `}</style>
    </div>
  );
}
