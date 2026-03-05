"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ShopSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Default to 'shops' if not specified
    const currentView = searchParams.get("view") || "shops";
    const currentQuery = searchParams.get("q") || "";

    const [view, setView] = useState(currentView);
    const [query, setQuery] = useState(currentQuery);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        params.set("view", view);
        if (query) {
            params.set("q", query);
        }
        router.push(`/shops?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className="search-controls" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div className="toggle-group" style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    type="button"
                    className={`btn ${view === 'shops' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setView('shops'); document.getElementById('search-submit')?.click(); }}
                >
                    Shops
                </button>
                <button
                    type="button"
                    className={`btn ${view === 'products' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setView('products'); document.getElementById('search-submit')?.click(); }}
                >
                    Products
                </button>
            </div>

            <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    placeholder={`Search ${view}...`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: '#fff' }}
                />
                <button type="submit" id="search-submit" className="btn btn-primary">Search</button>
            </div>
        </form>
    );
}
