"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail, registerWithEmail, signInWithGoogle } from "@/firebase/auth";
import { useAuthSession } from "@/components/layout/auth-provider";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuthSession();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
  if (user) {router.replace("/profile");}}, [user, router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) await registerWithEmail(email, password, username || email.split("@")[0]);
      else await loginWithEmail(email, password);
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold text-cyan-100">Acceso KaliStream</h1>
      <div className="glass rounded-lg p-5 space-y-3">
        <button
          onClick={async () => {
            await signInWithGoogle();
            router.push("/profile");
          }}
          className="w-full rounded-md bg-white/10 px-3 py-2 text-left"
        >
          Continuar con Google
        </button>
        <form onSubmit={submit} className="space-y-2">
          {isRegister ? (
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm" />
          ) : null}
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Email" className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Password" className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm" />
          <button disabled={loading} className="w-full rounded-md bg-cyan-500/20 px-3 py-2 text-cyan-100">
            {loading ? "Procesando..." : isRegister ? "Crear cuenta" : "Ingresar con Email"}
          </button>
        </form>
        <button onClick={() => setIsRegister((v) => !v)} className="text-xs text-zinc-300 underline underline-offset-2">
          {isRegister ? "Ya tengo cuenta" : "No tengo cuenta, registrarme"}
        </button>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </div>
    </div>
  );
}
