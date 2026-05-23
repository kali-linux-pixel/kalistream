"use client";

import { useAuthSession } from "@/components/layout/auth-provider";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import Link from "next/link";

export default function KaliCoreAdminPage() {
  const { loading, profile } = useAuthSession();
  if (loading) return <div className="glass rounded-lg p-4">Verificando acceso...</div>;
  if (!profile || !["owner", "admin", "moderator"].includes(profile.role)) {
    return (
      <div className="glass rounded-lg p-5 text-sm text-zinc-200">
        Acceso denegado. Esta ruta es solo admin. <Link href="/login" className="text-cyan-300 underline">Ir a login</Link>
      </div>
    );
  }
  return <AdminDashboard />;
}
