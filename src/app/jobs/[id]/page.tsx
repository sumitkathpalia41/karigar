import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReplyForm from "./ReplyForm";

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session || !session.user) {
        redirect("/login");
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const job = await prisma.job.findUnique({
        where: { id: params.id },
        include: {
            customer: { select: { name: true } },
            replies: {
                include: {
                    sender: { select: { name: true, role: true } }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!job) {
        return <div className="container py-10">Job not found.</div>;
    }

    if (role === "CUSTOMER" && job.customerId !== userId) {
        return <div className="container py-10">You do not have permission to view this job.</div>;
    }

    return (
        <div className="container py-10" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h1 style={{ color: '#e5a55d', margin: 0 }}>{job.title}</h1>
                    <span className="status-pill">{job.status}</span>
                </div>
                <p style={{ color: '#aaa', marginBottom: '1rem' }}>Posted by {job.customer.name}</p>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Description</h3>
                    <p>{job.description}</p>
                </div>

                {job.requirements && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>Requirements</h3>
                        <p>{job.requirements}</p>
                    </div>
                )}

                {job.mediaUrl && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>Attached Media</h3>
                        {job.mediaType === "IMAGE" ? (
                            <img src={job.mediaUrl} alt="Job reference" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '400px', objectFit: 'cover' }} />
                        ) : (
                            <a href={job.mediaUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">View Attached Video</a>
                        )}
                    </div>
                )}
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>Replies & Quotes ({job.replies.length})</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {job.replies.length === 0 ? (
                        <p style={{ color: '#aaa' }}>No replies yet.</p>
                    ) : (
                        job.replies.map((reply: any) => (
                            <div key={reply.id} style={{ background: '#222', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong>{reply.sender.name} <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: '0.5rem' }}>({reply.sender.role})</span></strong>
                                    <span style={{ color: '#aaa', fontSize: '0.9rem' }}>{new Date(reply.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p style={{ marginBottom: '0.5rem', whiteSpace: 'pre-wrap' }}>{reply.message}</p>
                                {reply.quote && (
                                    <div style={{ color: '#e5a55d', fontWeight: 'bold' }}>Estimated Quote: ${reply.quote}</div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {(role === "CARPENTER" || role === "SHOPKEEPER") && job.status === "OPEN" && (
                    <div style={{ marginTop: '2rem', borderTop: '1px solid #444', paddingTop: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Submit a Reply / Quote</h3>
                        <ReplyForm jobId={job.id} />
                    </div>
                )}
            </div>
        </div>
    );
}
