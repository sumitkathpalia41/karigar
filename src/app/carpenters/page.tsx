import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CarpentersPage() {
    const carpenters = await prisma.carpenterProfile.findMany({
        include: {
            user: { select: { name: true } },
            portfolio: { take: 3 }
        }
    });

    return (
        <div className="container py-10">
            <header className="page-header">
                <h1>Skilled Carpenters</h1>
                <p>Hire professionals for your furniture and home improvement projects.</p>
            </header>

            <div className="carpenter-grid">
                {carpenters.length === 0 ? (
                    <div className="empty-state">No carpenters found.</div>
                ) : (
                    carpenters.map((profile) => (
                        <Link href={`/carpenters/${profile.id}`} key={profile.id} className="carpenter-card glass-card">
                            <div className="carp-header">
                                <h3>{profile.user.name}</h3>
                                <p className="exp">{profile.experience || "Experience not listed"}</p>
                            </div>
                            <p className="bio">{profile.bio || "Available for custom furniture work and home repairs."}</p>
                            <div className="portfolio-preview">
                                {profile.portfolio.length > 0 ? (
                                    <span className="p-text">Has {profile.portfolio.length} portfolio items</span>
                                ) : (
                                    <span className="p-text text-muted">New professional</span>
                                )}
                            </div>
                            <div className="carp-footer">
                                <span className="btn btn-primary btn-sm">View Portfolio</span>
                            </div>
                        </Link>
                    ))
                )}
            </div>

        </div>
    );
}

