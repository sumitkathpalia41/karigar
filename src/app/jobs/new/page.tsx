"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewJobPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [requirements, setRequirements] = useState("");
    const [mediaUrl, setMediaUrl] = useState("");
    const [mediaType, setMediaType] = useState("IMAGE");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (status === "loading") return <div className="container py-10">Loading...</div>;
    if (status === "unauthenticated" || (session?.user as any)?.role !== "CUSTOMER") {
        router.push("/jobs");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    requirements,
                    mediaUrl: mediaUrl || undefined,
                    mediaType: mediaUrl ? mediaType : undefined,
                }),
            });

            if (res.ok) {
                router.push("/jobs");
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to post job");
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-10" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '1rem', color: '#e5a55d' }}>Post a New Job Requirement</h1>
            <p style={{ marginBottom: '2rem', color: '#aaa' }}>Describe what you need, upload pictures or videos, and get quotes from professionals.</p>

            <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
                {error && <div className="error-message" style={{ color: 'red', background: '#330000', padding: '1rem', borderRadius: '4px' }}>{error}</div>}

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Job Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#222', border: '1px solid #444', color: '#fff' }}
                        placeholder="e.g. Custom Wardrobe Needed"
                    />
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#222', border: '1px solid #444', color: '#fff', minHeight: '100px' }}
                        placeholder="Describe your furniture needs..."
                    />
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Specific Requirements</label>
                    <textarea
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#222', border: '1px solid #444', color: '#fff', minHeight: '80px' }}
                        placeholder="e.g. Must use Teak wood, dimensions: 6ft x 4ft"
                    />
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Media Upload (Image/Video URL)</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <select
                            value={mediaType}
                            onChange={(e) => setMediaType(e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '4px', background: '#222', border: '1px solid #444', color: '#fff' }}
                        >
                            <option value="IMAGE">Image</option>
                            <option value="VIDEO">Video</option>
                        </select>
                        <input
                            type="url"
                            value={mediaUrl}
                            onChange={(e) => setMediaUrl(e.target.value)}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', background: '#222', border: '1px solid #444', color: '#fff' }}
                            placeholder="https://example.com/photo.jpg"
                        />
                    </div>
                    <small style={{ color: '#888', display: 'block', marginTop: '0.5rem' }}>Provide a link to a picture or video showing what you want built.</small>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}>
                    {loading ? "Posting..." : "Post Job"}
                </button>
            </form>
        </div>
    );
}
