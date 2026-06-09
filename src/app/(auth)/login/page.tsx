import { Suspense } from "react";
import { AuthForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-bg" />}>
      <AuthForm />
    </Suspense>
  );
}
