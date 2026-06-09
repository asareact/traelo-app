import Link from "next/link";

export default function AuthCodeError() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 text-center">
      <div className="font-display text-3xl font-extrabold text-primary">
        traelo.
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-text">
        No pudimos completar el inicio de sesión
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        El enlace puede haber expirado o ya fue usado. Intenta entrar de nuevo.
      </p>
      <Link
        href="/login"
        className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
      >
        Volver a entrar
      </Link>
    </main>
  );
}
