import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — LCD Studio" },
      { name: "description", content: "Accès à l'espace d'administration LCD." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--lcd-bg)] px-5 text-[var(--lcd-fg)]">
      <div className="w-full max-w-md">
        <Link to="/" className="font-[var(--font-serif)] text-4xl">
          LCD<span className="text-[var(--lcd-accent)]">.</span>
        </Link>
        <h1 className="mt-10 font-[var(--font-display)] text-4xl tracking-tight">Connexion</h1>
        <p className="mt-2 text-sm text-[var(--lcd-dim)]">
          Espace d'administration LCD.
        </p>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-hairline text-[var(--lcd-dim)]">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-[var(--lcd-line)] bg-transparent px-4 py-3 text-[var(--lcd-fg)] outline-none focus:border-[var(--lcd-fg)]"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-hairline text-[var(--lcd-dim)]">Mot de passe</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-[var(--lcd-line)] bg-transparent px-4 py-3 text-[var(--lcd-fg)] outline-none focus:border-[var(--lcd-fg)]"
            />
          </label>
          {error ? <p className="text-sm text-[var(--lcd-accent)]">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 border border-[var(--lcd-fg)] px-6 py-3 text-hairline uppercase transition-colors hover:bg-[var(--lcd-fg)] hover:text-[var(--lcd-bg)] disabled:opacity-50"
          >
            {loading ? "…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}