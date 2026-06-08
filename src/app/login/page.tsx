"use client";

import { Suspense, useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { login, signup, type AuthState } from "./actions";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-bg" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [tab, setTab] = useState<"entrar" | "crear">("entrar");
  const [googleError, setGoogleError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  async function signInWithGoogle() {
    setGoogleLoading(true);
    setGoogleError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setGoogleError("No se pudo conectar con Google. Intenta de nuevo.");
      setGoogleLoading(false);
    }
    // On success the browser redirects to Google — no further action.
  }

  const [loginState, loginAction, loginPending] = useActionState<
    AuthState,
    FormData
  >(login, {});
  const [signupState, signupAction, signupPending] = useActionState<
    AuthState,
    FormData
  >(signup, {});

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-9 text-center">
          <Link
            href="/"
            className="font-display text-4xl font-extrabold text-primary"
          >
            traelo.
          </Link>
          <p className="mt-1 text-sm text-muted">Entra o crea tu cuenta</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-md bg-surface p-1">
          <button
            type="button"
            onClick={() => setTab("entrar")}
            className={`flex-1 rounded-[8px] py-2.5 text-sm font-bold transition ${
              tab === "entrar"
                ? "bg-white text-text shadow-sm"
                : "text-muted"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setTab("crear")}
            className={`flex-1 rounded-[8px] py-2.5 text-sm font-bold transition ${
              tab === "crear" ? "bg-white text-text shadow-sm" : "text-muted"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={googleLoading}
          className="mb-5 flex w-full items-center justify-center gap-3 rounded-full border-[1.5px] border-border bg-white px-6 py-3 text-[15px] font-bold text-text transition hover:bg-surface disabled:opacity-50"
        >
          <GoogleIcon />
          {googleLoading ? "Conectando…" : "Continuar con Google"}
        </button>
        {googleError && <ErrorMsg>{googleError}</ErrorMsg>}

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-muted">o con tu correo</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {tab === "entrar" ? (
          <form action={loginAction} className="flex flex-col gap-4">
            <input type="hidden" name="next" value={next} />
            <Field label="Correo electrónico">
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                className={inputCls}
                required
              />
            </Field>
            <Field label="Contraseña">
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={inputCls}
                required
              />
            </Field>
            {loginState.error && <ErrorMsg>{loginState.error}</ErrorMsg>}
            <SubmitButton pending={loginPending}>Entrar</SubmitButton>
          </form>
        ) : (
          <form action={signupAction} className="flex flex-col gap-4">
            <Field label="Nombre">
              <input
                name="nombre"
                type="text"
                autoComplete="name"
                placeholder="Tu nombre"
                className={inputCls}
                required
              />
            </Field>
            <Field label="Correo electrónico">
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                className={inputCls}
                required
              />
            </Field>
            <Field label="Contraseña">
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                className={inputCls}
                required
              />
            </Field>
            {signupState.error && <ErrorMsg>{signupState.error}</ErrorMsg>}
            {signupState.ok && <OkMsg>{signupState.ok}</OkMsg>}
            <SubmitButton pending={signupPending}>Crear cuenta</SubmitButton>
          </form>
        )}
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded-md border-[1.5px] border-border bg-bg px-3.5 py-3 text-[15px] text-text outline-none transition focus:border-primary";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm font-medium text-error">
      {children}
    </p>
  );
}

function OkMsg({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-sm font-medium text-accent">
      {children}
    </p>
  );
}

function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Un momento…" : children}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
