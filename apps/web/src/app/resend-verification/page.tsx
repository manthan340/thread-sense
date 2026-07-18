"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const data = await api<{ message: string }>("/auth/resend-verification", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email }),
      });
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page narrow">
      <h1>Resend verification</h1>
      <p className="muted">Check Mailpit for the new verification email.</p>
      <form onSubmit={onSubmit} className="auth-form">
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Sending…" : "Resend email"}
        </button>
      </form>
      <p className="links">
        <Link href="/login">Back to login</Link>
      </p>
    </main>
  );
}
