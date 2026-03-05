import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function JobsBoard() {
    const session = await auth();
    if (!session) {
        return (
            <div className="container py-10">
                <div className="empty-state">Please <Link href="/login">login</Link> to view jobs.</div>
            </div>
        );
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // Privacy logic: 
    // - Customers only see their own jobs.
    // - Carpenters see all OPEN jobs + jobs they are assigned to.
    let whereClause: any = {};
    if (role === "CUSTOMER") {
        whereClause = { customerId: userId };
    } else if (role === "CARPENTER") {
        whereClause = {
            OR: [
                { status: "OPEN" },
                { carpenterId: userId }
            ]
        };
    }

    const jobs = await prisma.job.findMany({
        where: whereClause,
        include: {
            customer: { select: { name: true } },
            _count: { select: { replies: true } }
        },
        orderBy: { createdAt: "desc" }
    });


    return (
        <div className="container py-10">
            <header className="page-header flex-header">
                <div>
                    <h1>Project Opportunities</h1>
                    <p>Find new woodwork jobs or post your furniture requirements.</p>
                </div>
                {role === "CUSTOMER" && (
                    <Link href="/jobs/new" className="btn btn-primary">Post New Job</Link>
                )}
            </header>

            <div className="job-list">
                {jobs.length === 0 ? (
                    <div className="empty-state">No jobs found. Be the first to post a project!</div>
                ) : (
                    jobs.map((job) => (
                        <div key={job.id} className="job-card glass-card">
                            <div className="job-meta">
                                <span className="status-pill">{job.status}</span>
                                <span className="customer-name">By {job.customer.name}</span>
                                <span style={{ marginLeft: 'auto', color: '#888', fontSize: '0.9rem' }}>{job._count.replies} Replies</span>
                            </div>
                            <div className="job-main">
                                <h3>{job.title}</h3>
                                <p>{job.description}</p>
                                {job.requirements && (
                                    <div className="requirements">
                                        <strong>Requirements:</strong> {job.requirements}
                                    </div>
                                )}
                            </div>
                            <div className="job-footer">
                                {role === "CARPENTER" || role === "SHOPKEEPER" ? (
                                    <Link href={`/jobs/${job.id}`} className="btn btn-primary btn-sm">Express Interest</Link>
                                ) : (
                                    <Link href={`/jobs/${job.id}`} className="btn btn-outline btn-sm">View Details</Link>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
}

