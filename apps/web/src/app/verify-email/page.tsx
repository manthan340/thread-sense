"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

function VerifyEmailInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    token ? "loading" : "idle",
  );
  const [message, setMessage] = useState(
    token ? "Verifying…" : "Missing verification token.",
  );

  useEffect(() => {
    if (!token) return;
    api<{ message: string }>("/auth/verify-email", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ token }),
    })
      .then((data) => {
        setStatus("ok");
        setMessage(data.message);
        setTimeout(() => router.push("/login"), 1500);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      });
  }, [token, router]);

  return (
    <main className="page narrow">
      <h1>Email verification</h1>
      <p className={status === "error" ? "error" : status === "ok" ? "success" : "muted"}>
        {message}
      </p>
      <p className="links">
        <Link href="/login">Go to login</Link>
      </p>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<main className="page narrow">Verifying…</main>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
