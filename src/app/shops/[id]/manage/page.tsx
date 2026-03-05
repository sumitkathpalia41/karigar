"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ShopManagement({ params }: { params: { id: string } }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [shop, setShop] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddingProduct, setIsAddingProduct] = useState(false);

    // Form states
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        price: "",
        quality: "Premium",
        videoUrl: "",
        brand: "",
        categoryName: "",
        subCategoryName: ""
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchShopData();
        }
    }, [status, params.id]);

    const fetchShopData = async () => {
        try {
            // We can reuse the existing shop details API or dashboard API
            const shopRes = await fetch(`/api/user/dashboard`);
            const userData = await shopRes.json();

            if (userData.shop?.id !== params.id) {
                router.push("/dashboard");
                return;
            }

            setShop(userData.shop);

            const productsRes = await fetch(`/api/shops/${params.id}/products`);
            if (productsRes.ok) {
                const productsData = await productsRes.json();
                setProducts(productsData);
            }

            const catRes = await fetch("/api/categories");
            if (catRes.ok) {
                const catData = await catRes.json();
                setCategories(catData);
            }
        } catch (err) {
            console.error("Error fetching shop data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // First, ensure the category exists and get its ID
            let categoryId = undefined;
            let subCategoryId = undefined;

            if (newProduct.categoryName) {
                const catRes = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: newProduct.categoryName, subCategoryName: newProduct.subCategoryName })
                });

                if (catRes.ok) {
                    const catData = await catRes.json();
                    categoryId = catData.id;
                    if (newProduct.subCategoryName) {
                        const matchingSub = catData.subCategories?.find((sub: any) => sub.name === newProduct.subCategoryName);
                        if (matchingSub) subCategoryId = matchingSub.id;
                    }
                }
            }

            const res = await fetch(`/api/shops/${params.id}/products`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newProduct,
                    categoryId,
                    subCategoryId
                }),
            });

            if (res.ok) {
                setIsAddingProduct(false);
                setNewProduct({ name: "", description: "", price: "", quality: "Premium", videoUrl: "", brand: "", categoryName: "", subCategoryName: "" });
                fetchShopData();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to add product");
            }
        } catch (err) {
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const res = await fetch(`/api/shops/${params.id}/products/${productId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchShopData();
            }
        } catch (err) {
            alert("Failed to delete product");
        }
    };

    if (loading || status === "loading") return <div className="container py-10">Loading management dashboard...</div>;
    if (!shop) return <div className="container py-10">Shop not found or access denied.</div>;

    return (
        <div className="container py-10">
            <header className="page-header flex-header" style={{ marginBottom: '3rem' }}>
                <div>
                    <h1>Manage Your Shop</h1>
                    <p>{shop.name} Dashboard</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href={`/shops/${shop.id}`} className="btn btn-outline">View Public Shop</Link>
                    <button className="btn btn-primary" onClick={() => setIsAddingProduct(true)}>Add New Product</button>
                </div>
            </header>

            <div className="management-content">
                <section className="dashboard-section">
                    <h2 style={{ marginBottom: '1.5rem' }}>Your Products</h2>
                    {products.length === 0 ? (
                        <div className="empty-state glass-card">
                            <p>You haven't added any products yet.</p>
                            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setIsAddingProduct(true)}>
                                Add Your First Product
                            </button>
                        </div>
                    ) : (
                        <div className="product-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                            {products.map((product) => (
                                <div key={product.id} className="glass-card product-item" style={{ padding: '2rem' }}>
                                    <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{product.name}</h3>
                                    <p className="price" style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>₹{product.price}</p>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{product.description}</p>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button className="btn btn-sm btn-outline" style={{ flex: 1 }} onClick={() => alert("Edit product feature coming soon!")}>Edit</button>
                                        <button className="btn btn-sm btn-danger" style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Add Product Modal */}
            {isAddingProduct && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '1rem'
                }}>
                    <div className="glass-card animate-fade-in" style={{ maxWidth: '600px', width: '100%', padding: '3rem' }}>
                        <h2 style={{ marginBottom: '2rem' }}>Add New Product</h2>
                        <form onSubmit={handleAddProduct}>
                            <div className="form-group">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    placeholder="e.g. 18mm Teak Plywood"
                                />
                            </div>

                            <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Category (Existing or New)</label>
                                    <input
                                        type="text"
                                        list="category-options"
                                        className="form-input"
                                        value={newProduct.categoryName}
                                        onChange={(e) => setNewProduct({ ...newProduct, categoryName: e.target.value })}
                                        placeholder="e.g. Plywood"
                                    />
                                    <datalist id="category-options">
                                        {categories.map(cat => <option key={cat.id} value={cat.name} />)}
                                    </datalist>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Brand</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newProduct.brand}
                                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                                        placeholder="e.g. Greenply"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Price (₹)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    required
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                    placeholder="95"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-input"
                                    required
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    placeholder="High quality waterproof plywood..."
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Product</button>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsAddingProduct(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
