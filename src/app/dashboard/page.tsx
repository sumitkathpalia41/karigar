"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";



export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetch("/api/user/dashboard")
                .then(res => res.json())
                .then(data => {
                    setUserData(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [status, router]);

    if (status === "loading" || loading) {
        return <div className="container py-10">Loading dashboard...</div>;
    }

    if (!session) return null;

    const role = (session.user as any).role;

    return (
        <div className="dashboard container">
            <header className="dash-header">
                <div>
                    <h1>Welcome, {session.user?.name || "User"}</h1>
                    <p className="role-badge">{role}</p>
                </div>
                <div className="dash-actions">
                    <Link href="/api/auth/signout" className="btn btn-outline">Sign Out</Link>
                </div>
            </header>

            <div className="dash-content">
                {role === "CUSTOMER" && (
                    <div className="role-dash animate-fade-in">
                        <div className="dash-grid">
                            <Link href="/shops" className="dash-card glass-card">
                                <h3>Buy Plywood & Hardware</h3>
                                <p>Browse local shops and check prices.</p>
                            </Link>
                            <Link href="/carpenters" className="dash-card glass-card">
                                <h3>Hire a Carpenter</h3>
                                <p>Find experienced professionals for your project.</p>
                            </Link>
                            <Link href="/jobs" className="dash-card glass-card">
                                <h3>Post a Job</h3>
                                <p>Describe your furniture needs and get quotes.</p>
                            </Link>
                        </div>

                        <section className="recent-activity">
                            <h2>Your Recent Jobs</h2>
                            <div className="empty-state">No jobs posted yet. <Link href="/jobs">Post one now!</Link></div>
                        </section>
                    </div>
                )}

                {role === "SHOPKEEPER" && (
                    <div className="role-dash animate-fade-in">
                        <div className="dash-grid">
                            <Link href={`/shops/${userData?.shop?.id}/manage`} className="dash-card glass-card">
                                <h3>Manage Products</h3>
                                <p>Add new plywood, hardware, and pricing.</p>
                            </Link>
                            <Link href="/jobs" className="dash-card glass-card">
                                <h3>Browse Job Requests</h3>
                                <p>See what customers are looking to build.</p>
                            </Link>
                            <Link href={`/shops/${userData?.shop?.id}`} className="dash-card glass-card">
                                <h3>View Public Shop</h3>
                                <p>See how customers see your store.</p>
                            </Link>
                        </div>
                    </div>
                )}

                {role === "CARPENTER" && (
                    <div className="role-dash animate-fade-in">
                        <div className="dash-grid">
                            <Link href="/jobs" className="dash-card glass-card">
                                <h3>Find Work</h3>
                                <p>Browse open job postings from customers.</p>
                            </Link>
                            <Link href="/carpenters/profile/edit" className="dash-card glass-card">
                                <h3>Edit Portfolio</h3>
                                <p>Update your photos and experience videos.</p>
                            </Link href="/carpenters/reviews className="dash-card glass-card">
                            
                                <h3>Reviews</h3>
                                <p>See what customers are saying about you.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .dashboard { padding-top: 3rem; padding-bottom: 5rem; }
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 3rem;
        }
        .role-badge {
          display: inline-block;
          background: rgba(245, 158, 11, 0.1);
          color: var(--primary);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-top: 0.5rem;
        }
        .dash-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }
        .dash-card {
          padding: 2.5rem;
          text-align: center;
          transition: var(--transition);
        }
        .dash-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
        }
        .dash-card h3 { margin-bottom: 1rem; color: var(--primary); }
        .dash-card p { color: var(--text-muted); }
        .recent-activity h2 { margin-bottom: 1.5rem; }
        .empty-state {
          padding: 3rem;
          text-align: center;
          border: 1px dashed var(--glass-border);
          border-radius: var(--radius);
          color: var(--text-muted);
        }
        .btn-outline {
          background: transparent;
          border: 1px solid var(--glass-border);
          color: var(--text-light);
        }
      `}</style>
        </div>
    );
}
