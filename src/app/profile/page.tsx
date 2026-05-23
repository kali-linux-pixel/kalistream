"use client";

import Link from "next/link";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { useAuthSession } from "@/components/layout/auth-provider";
import { db } from "@/firebase/firestore";
import { deleteUploadedFile, uploadFileWithProgress } from "@/firebase/storage";

export default function ProfilePage() {
  const { user, profile, loading } = useAuthSession();
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarProgress, setAvatarProgress] = useState(0);

  if (loading) return <div className="glass rounded-lg p-4">Cargando perfil...</div>;
  if (!user) {
    return (
      <div className="glass rounded-lg p-5 text-sm text-zinc-200">
        Necesitas iniciar sesion para ver tu perfil.{" "}
        <Link href="/login" className="text-cyan-300 underline">
          Ir a login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold text-cyan-100">Perfil</h1>
      <div className="glass rounded-lg p-5 text-sm text-zinc-200">
        {profile?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar} alt="avatar" className="mb-3 h-20 w-20 rounded-full border border-cyan-300/30 object-cover" />
        ) : null}
        <p>Usuario: {profile?.username || user.displayName || "N/A"}</p>
        <p>Email: {profile?.email || user.email}</p>
        <p>
          Rol: <span className="uppercase text-cyan-300">{profile?.role || "free"}</span>
        </p>
        <p>
          Plan: <span className="uppercase text-violet-300">{profile?.subscriptionPlan || "free"}</span>
        </p>
        <p>Expira: {profile?.subscriptionExpire || "Sin expiracion"}</p>
        <label className="mt-3 block rounded-md border border-white/10 bg-black/30 p-2 text-xs">
          Subir avatar
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="mt-2 w-full"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !user) return;
              try {
                setUploadStatus(null);
                const { url, path } = await uploadFileWithProgress({
                  uid: user.uid,
                  file,
                  kind: "avatar",
                  onProgress: (percent) => setAvatarProgress(percent),
                });
                setAvatarPath(path);
                await updateDoc(doc(db, "users", user.uid), { avatar: url });
                setUploadStatus("Avatar actualizado.");
              } catch (err) {
                setUploadStatus(err instanceof Error ? err.message : "No se pudo subir avatar.");
              }
            }}
          />
        </label>
        {avatarProgress > 0 ? <p className="mt-2 text-xs text-zinc-400">Upload: {avatarProgress}%</p> : null}
        {avatarPath ? (
          <button
            onClick={async () => {
              await deleteUploadedFile(avatarPath);
              setAvatarPath(null);
              setUploadStatus("Archivo de avatar eliminado de Storage.");
            }}
            className="mt-2 rounded bg-rose-500/20 px-2 py-1 text-xs text-rose-200"
          >
            Eliminar upload actual
          </button>
        ) : null}
        {uploadStatus ? <p className="mt-2 text-xs text-zinc-300">{uploadStatus}</p> : null}
      </div>
      <div className="glass rounded-lg p-5">
        <p className="mb-2 text-cyan-200">Favorites ({profile?.favorites?.length || 0})</p>
        <div className="flex flex-wrap gap-2 text-xs text-zinc-300">
          {(profile?.favorites || []).slice(0, 20).map((id) => (
            <Link key={id} href={`/watch/${id}?type=movie`} className="rounded bg-white/10 px-2 py-1">
              #{id}
            </Link>
          ))}
        </div>
      </div>
      <div className="glass rounded-lg p-5">
        <p className="mb-2 text-cyan-200">Continue Watching</p>
        <div className="space-y-1 text-sm text-zinc-300">
          {(profile?.continueWatching || []).slice(0, 10).map((row) => (
            <p key={`${row.id}-${row.updatedAt}`}>
              {row.type.toUpperCase()} #{row.id} · {row.progress}% · {new Date(row.updatedAt).toLocaleString()}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
