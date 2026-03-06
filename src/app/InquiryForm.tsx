"use client";

import { useState } from "react";

export function InquiryForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    const res = await fetch("/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      e.currentTarget.reset();
    } else {
      setError("Failed to submit. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Your name" required />
      <input name="phone" placeholder="Phone number" required />
      <input name="email" placeholder="Email (optional)" />
      <textarea name="message" placeholder="Your requirement" required />
      <button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Get Quote"}
      </button>
      {success && <p>Thank you! We will contact you soon.</p>}
      {error && <p>{error}</p>}
    </form>
  );
}
