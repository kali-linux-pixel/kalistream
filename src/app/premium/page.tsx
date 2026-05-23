"use client";

import { FormEvent, useState } from "react";
import { useAuthSession } from "@/components/layout/auth-provider";
import { createPayment } from "@/firebase/firestore";
import { deleteUploadedFile, uploadFileWithProgress } from "@/firebase/storage";
import { paymentMethods, planPrices } from "@/services/payments";

export default function PremiumPage() {
  const { user } = useAuthSession();
  const [method, setMethod] = useState<"Yape" | "Plin" | "PayPal">("Yape");
  const [plan, setPlan] = useState<"basic" | "plus" | "ultra">("plus");
  const [duration, setDuration] = useState("1 mes");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user || !file) {
      setStatus("Inicia sesion y sube una captura.");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const { url: screenshotUrl, path } = await uploadFileWithProgress({
        uid: user.uid,
        file,
        kind: "payment",
        onProgress: (percent) => setUploadProgress(percent),
      });
      setUploadedPath(path);
      await createPayment({
        uid: user.uid,
        email: user.email || "",
        method,
        plan,
        duration,
        screenshotUrl,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      setStatus("Pago enviado. Estado: pending.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "No se pudo enviar el pago.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-cyan-100">Planes KaliStream</h1>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["FREE", "1 video por dia + anuncios"],
          ["BASIC", "720p + continuar viendo"],
          ["PLUS", "1080p + auto next + sin anuncios"],
          ["ULTRA", "4K + descargas + estrenos"],
        ].map(([title, desc]) => (
          <article key={title} className="glass premium-card rounded-lg p-4">
            <p className="text-sm text-cyan-300">{title}</p>
            <p className="mt-2 text-sm text-zinc-200">{desc}</p>
          </article>
        ))}
      </div>
      <div className="glass rounded-lg p-5">
        <p className="mb-3 text-lg font-medium text-white">Precios</p>
        <div className="space-y-2 text-sm text-zinc-200">
          {planPrices.map((item) => (
            <p key={item.duration} className="flex justify-between">
              <span>{item.duration}</span>
              <span>{item.price}</span>
            </p>
          ))}
        </div>
      </div>
      <form onSubmit={submit} className="glass rounded-lg p-5">
        <p className="mb-3 text-cyan-300">Subir captura de pago</p>
        <div className="grid gap-2 md:grid-cols-2">
          <select value={plan} onChange={(e) => setPlan(e.target.value as "basic" | "plus" | "ultra")} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm">
            <option value="basic">BASIC</option>
            <option value="plus">PLUS</option>
            <option value="ultra">ULTRA</option>
          </select>
          <select value={method} onChange={(e) => setMethod(e.target.value as "Yape" | "Plin" | "PayPal")} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm">
            {paymentMethods.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm md:col-span-2">
            {planPrices.map((d) => (
              <option key={d.duration}>{d.duration}</option>
            ))}
          </select>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm md:col-span-2" />
          {file ? (
            <button
              type="button"
              onClick={() => setPreview(URL.createObjectURL(file))}
              className="rounded-md bg-white/10 px-3 py-2 text-xs text-zinc-200"
            >
              Preview captura
            </button>
          ) : null}
          {preview ? (
            <div className="md:col-span-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview" className="max-h-56 rounded-md border border-white/10" />
            </div>
          ) : null}
          {uploadProgress > 0 ? (
            <div className="md:col-span-2 text-xs text-zinc-300">Upload progress: {uploadProgress}%</div>
          ) : null}
          <button disabled={loading} className="rounded-md bg-cyan-500/20 px-3 py-2 text-sm text-cyan-100 md:col-span-2">
            {loading ? "Enviando..." : "Enviar captura"}
          </button>
          {uploadedPath ? (
            <button
              type="button"
              onClick={async () => {
                await deleteUploadedFile(uploadedPath);
                setUploadedPath(null);
                setStatus("Upload eliminado de Storage.");
              }}
              className="rounded-md bg-rose-500/20 px-3 py-2 text-sm text-rose-200 md:col-span-2"
            >
              Eliminar upload de Storage
            </button>
          ) : null}
        </div>
        {status ? <p className="mt-2 text-sm text-zinc-200">{status}</p> : null}
      </form>
    </div>
  );
}
