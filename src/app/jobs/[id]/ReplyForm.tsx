"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReplyForm({ jobId }: { jobId: string }) {
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [quote, setQuote] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/jobs/${jobId}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message,
                    quote: quote ? parseFloat(quote) : undefined,
                }),
            });

            if (res.ok) {
                setMessage("");
                setQuote("");
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to submit reply");
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <div style={{ color: 'red' }}>{error}</div>}

            <textarea
                placeholder="Write your message, availability, or proposal..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#222', border: '1px solid #444', color: '#fff', minHeight: '100px' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontWeight: 'bold' }}>Quote ($):</label>
                <input
                    type="number"
                    placeholder="Optional estimate"
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', background: '#222', border: '1px solid #444', color: '#fff' }}
                />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                {loading ? "Submitting..." : "Send Reply"}
            </button>
        </form>
    );
}
