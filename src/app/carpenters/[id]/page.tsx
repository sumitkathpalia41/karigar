import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function CarpenterDetails({ params }: { params: { id: string } }) {
    const profile = await prisma.carpenterProfile.findUnique({
        where: { id: params.id },
        include: {
            user: true,
            portfolio: true,
            reviews: { include: { reviewer: true } }
        }
    });

    if (!profile) notFound();

    return (
        <div className="container py-10">
            <div className="profile-hero glass-card animate-fade-in">
                <p className="breadcrumb"><Link href="/carpenters">Carpenters</Link> / {profile.user.name}</p>
                <div className="hero-content">
                    <h1>{profile.user.name}</h1>
                    <p className="exp-badge">{profile.experience || "Professional Carpenter"}</p>
                    <p className="bio-large">{profile.bio || "Specialized in custom furniture, wardrobe styling, and modular kitchen work. Committed to high-quality craftsmanship."}</p>
                    <div className="hire-actions">
                        <button className="btn btn-primary" onClick={() => alert("Hiring feature coming soon!")}>Hire Now</button>
                        <button className="btn btn-outline" onClick={() => alert("Messaging feature coming soon!")}>Message</button>
                    </div>
                </div>
            </div>

            <section className="portfolio-section">
                <h2>Past Work & Portfolio</h2>
                <div className="portfolio-grid">
                    {profile.portfolio.length === 0 ? (
                        <div className="empty-state">No portfolio items added yet.</div>
                    ) : (
                        profile.portfolio.map((item) => (
                            <div key={item.id} className="portfolio-item glass-card">
                                {item.mediaType === "IMAGE" ? (
                                    <div className="media-placeholder">📸 Photo Work</div>
                                ) : (
                                    <div className="media-placeholder video">🎥 Experience Video</div>
                                )}
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                        ))
                    )}
                </div>
            </section>

        </div>
    );
}

