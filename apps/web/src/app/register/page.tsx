import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <main className="page narrow">
      <h1>Create account</h1>
      <p className="muted">
        After registering, open Mailpit to verify your email, then log in.
      </p>
      <AuthForm mode="register" />
      <p className="links">
        <Link href="/login">Already have an account?</Link>
      </p>
    </main>
  );
}
