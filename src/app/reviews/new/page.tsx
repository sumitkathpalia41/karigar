"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

function ReviewForm() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const jobId = searchParams.get("jobId");

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [jobData, setJobData] = useState<any>(null);

    useEffect(() => {
        if (jobId) {
            fetch(`/api/jobs/${jobId}/status`) // I need to implement a GET for job status or just use the job details API if I had one. 
            // For now, I'll just rely on the API POST verification.
        }
    }, [jobId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating,
                    comment,
                    jobId,
                    // We'll get carpenterId from the job on the server
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to submit review");
            } else {
                router.push(`/jobs/${jobId}`);
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-10" style={{ maxWidth: '600px' }}>
            <div className="glass-card animate-fade-in" style={{ padding: '3rem' }}>
                <h1 style={{ marginBottom: '1rem' }}>Submit Review</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Share your experience with the service provider.</p>

                {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label>Rating (1-5)</label>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setRating(num)}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--glass-border)',
                                        background: rating >= num ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                        color: rating >= num ? 'var(--bg-darker)' : 'white',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'var(--transition)'
                                    }}
                                >
                                    {num} ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label>Your Comment</label>
                        <textarea
                            className="form-input"
                            rows={5}
                            required
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us what you liked or what could be improved..."
                            style={{ height: 'auto', resize: 'vertical' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? "Submitting..." : "Post Review"}
                    </button>

                    <Link href={`/jobs/${jobId}`} className="btn btn-block" style={{ marginTop: '1rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                        Cancel
                    </Link>
                </form>
            </div>
        </div>
    );
}

export default function NewReviewPage() {
    return (
        <Suspense fallback={<div className="container py-10">Loading...</div>}>
            <ReviewForm />
        </Suspense>
    );
}
