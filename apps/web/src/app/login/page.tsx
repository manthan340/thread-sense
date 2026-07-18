import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="page narrow">
      <h1>Log in</h1>
      <p className="muted">Access your Thread Sense closet.</p>
      <AuthForm mode="login" />
      <p className="links">
        <Link href="/register">Create account</Link>
        {" · "}
        <Link href="/forgot-password">Forgot password</Link>
        {" · "}
        <Link href="/resend-verification">Resend verification</Link>
      </p>
    </main>
  );
}
