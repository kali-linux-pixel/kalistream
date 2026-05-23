"use client";

import { useEffect, useMemo, useState } from "react";
import { ChartNoAxesCombined, CreditCard, ShieldAlert, UsersRound, Video } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuthSession } from "@/components/layout/auth-provider";

type AdminStats = {
  totalUsers: number;
  onlineUsers: number;
  premiumActive: number;
  pendingPayments: number;
  estimatedRevenue: number;
  uploads: number;
  subscriptions: number;
  latestLogs: Array<{ id: string; action: string; actorUid: string; createdAt: string }>;
};

type AdminUser = {
  uid: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  subscriptionPlan: string;
  subscriptionExpire?: string | null;
  createdAt?: string;
  lastLogin?: string;
  ip?: string;
  country?: string;
  device?: string;
  browser?: string;
  isBanned?: boolean;
};

type AdminPayment = {
  id: string;
  uid: string;
  email: string;
  method: string;
  plan: string;
  duration: string;
  status: string;
  screenshotUrl: string;
  reviewedBy?: string;
  reviewedAt?: string;
};

type BannedIp = {
  id: string;
  ip: string;
  reason?: string;
};

async function adminFetch<T>(user: { getIdToken: () => Promise<string> } | null, url: string, init?: RequestInit) {
  if (!user) throw new Error("No session");
  const token = await user.getIdToken();
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

export function AdminDashboard() {
  const { user } = useAuthSession();
  const [tab, setTab] = useState<"overview" | "users" | "payments" | "announcements" | "security">("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [bannedIps, setBannedIps] = useState<BannedIp[]>([]);
  const [q, setQ] = useState("");
  const [announcementText, setAnnouncementText] = useState("Nuevo estreno disponible esta noche");
  const [announcementType, setAnnouncementType] = useState("banner");
  const [newIp, setNewIp] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refreshAll(search = "") {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, paymentsRes, ipsRes] = await Promise.all([
        adminFetch<AdminStats>(user, "/api/admin/stats"),
        adminFetch<{ users: AdminUser[] }>(user, `/api/admin/users?q=${encodeURIComponent(search)}`),
        adminFetch<{ payments: AdminPayment[] }>(user, "/api/admin/payments"),
        adminFetch<{ bannedIps: BannedIp[] }>(user, "/api/admin/ban-ip"),
      ]);
      setStats(statsRes);
      setUsers(usersRes.users);
      setPayments(paymentsRes.payments);
      setBannedIps(ipsRes.bannedIps);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error admin");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const chartData = useMemo(
    () => [
      { key: "Users", value: stats?.totalUsers || 0 },
      { key: "Online", value: stats?.onlineUsers || 0 },
      { key: "Premium", value: stats?.premiumActive || 0 },
      { key: "Pending", value: stats?.pendingPayments || 0 },
    ],
    [stats],
  );

  async function patchUser(uid: string, action: string, value?: string | number) {
    if (!user) return;
    const payload: Record<string, unknown> = { uid, action };
    if (action === "setRole" || action === "setPlan") payload.value = value;
    if (action === "extendPremium") payload.days = Number(value || 30);
    await adminFetch(user, "/api/admin/users", { method: "PATCH", body: JSON.stringify(payload) });
    await refreshAll(q);
  }

  async function patchPayment(paymentId: string, status: string) {
    if (!user) return;
    await adminFetch(user, "/api/admin/payments", {
      method: "PATCH",
      body: JSON.stringify({ paymentId, status }),
    });
    await refreshAll(q);
  }

  if (loading) return <div className="glass rounded-lg p-5 text-zinc-300">Cargando panel admin...</div>;
  if (error) return <div className="glass rounded-lg p-5 text-rose-300">{error}</div>;

  const metrics = [
    { label: "Total usuarios", value: String(stats?.totalUsers || 0), icon: UsersRound },
    { label: "Usuarios online", value: String(stats?.onlineUsers || 0), icon: Video },
    { label: "Pagos pendientes", value: String(stats?.pendingPayments || 0), icon: CreditCard },
    { label: "Ingresos estimados", value: `S/${stats?.estimatedRevenue || 0}`, icon: ChartNoAxesCombined },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-fuchsia-100">KaliCore Admin</h1>
        <div className="flex flex-wrap gap-2">
          {["overview", "users", "payments", "announcements", "security"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as "overview" | "users" | "payments" | "announcements" | "security")}
              className={`rounded-md px-3 py-2 text-xs uppercase ${tab === t ? "bg-cyan-500/20 text-cyan-100" : "bg-white/5 text-zinc-300"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="glass premium-card rounded-lg p-4">
                <metric.icon className="mb-2 h-5 w-5 text-cyan-300" />
                <p className="text-xs text-zinc-300">{metric.label}</p>
                <p className="text-2xl font-semibold text-white">{metric.value}</p>
              </div>
            ))}
          </div>
          <div className="glass rounded-lg p-4">
            <p className="mb-2 text-sm text-cyan-200">Estadísticas visuales</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                  <XAxis dataKey="key" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass rounded-lg p-4">
            <p className="mb-2 text-sm text-cyan-200">Últimos logs admin</p>
            <div className="space-y-1 text-xs text-zinc-300">
              {(stats?.latestLogs || []).map((log) => (
                <p key={log.id}>
                  {log.action} · {log.actorUid} · {new Date(log.createdAt).toLocaleString()}
                </p>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {tab === "users" ? (
        <div className="glass rounded-lg p-4">
          <div className="mb-3 flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por username, email, uid"
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm"
            />
            <button onClick={() => refreshAll(q)} className="rounded-md bg-cyan-500/20 px-3 py-2 text-cyan-100">Buscar</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="text-zinc-400">
                <tr>
                  <th className="px-2 py-2">User</th>
                  <th className="px-2 py-2">UID</th>
                  <th className="px-2 py-2">Role</th>
                  <th className="px-2 py-2">Plan</th>
                  <th className="px-2 py-2">Expire</th>
                  <th className="px-2 py-2">Last Login</th>
                  <th className="px-2 py-2">IP/Country</th>
                  <th className="px-2 py-2">Device</th>
                  <th className="px-2 py-2">Password</th>
                  <th className="px-2 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.uid} className="border-t border-white/10 text-zinc-200">
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u.avatar || "/next.svg"} alt={u.username} className="h-8 w-8 rounded-full border border-white/20" />
                        <div>
                          <p>{u.username}</p>
                          <p className="text-zinc-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2">{u.uid}</td>
                    <td className="px-2 py-2 uppercase">{u.role}</td>
                    <td className="px-2 py-2 uppercase">{u.subscriptionPlan}</td>
                    <td className="px-2 py-2">{u.subscriptionExpire || "-"}</td>
                    <td className="px-2 py-2">{u.lastLogin || "-"}</td>
                    <td className="px-2 py-2">{u.ip || "-"} / {u.country || "-"}</td>
                    <td className="px-2 py-2">{u.device || "-"} / {u.browser || "-"}</td>
                    <td className="px-2 py-2 text-zinc-400">Firebase Auth Managed</td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => patchUser(u.uid, u.isBanned ? "unban" : "ban")} className="rounded bg-amber-500/20 px-2 py-1">
                          {u.isBanned ? "Unban" : "Ban"}
                        </button>
                        <button onClick={() => patchUser(u.uid, "setRole", "moderator")} className="rounded bg-blue-500/20 px-2 py-1">Mod</button>
                        <button onClick={() => patchUser(u.uid, "setRole", "free")} className="rounded bg-white/10 px-2 py-1">Free</button>
                        <button onClick={() => patchUser(u.uid, "setPlan", "ultra")} className="rounded bg-violet-500/20 px-2 py-1">Ultra</button>
                        <button onClick={() => patchUser(u.uid, "extendPremium", 30)} className="rounded bg-emerald-500/20 px-2 py-1">+30d</button>
                        <button onClick={() => patchUser(u.uid, "clearWatchHistory")} className="rounded bg-white/10 px-2 py-1">Clear WH</button>
                        <button onClick={() => patchUser(u.uid, "clearFavorites")} className="rounded bg-white/10 px-2 py-1">Clear Fav</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === "payments" ? (
        <div className="glass rounded-lg p-4">
          <p className="mb-3 text-sm text-cyan-200">Gestión de pagos manuales</p>
          <div className="space-y-2 text-sm">
            {payments.map((p) => (
              <div key={p.id} className="rounded-md border border-white/10 bg-black/20 p-3 text-zinc-200">
                <p>{p.email} · {p.method} · {String(p.plan || "").toUpperCase()} · {p.duration} · {p.status}</p>
                <p className="text-zinc-400">reviewedBy: {p.reviewedBy || "-"} · reviewedAt: {p.reviewedAt || "-"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a href={p.screenshotUrl} target="_blank" rel="noreferrer" className="rounded bg-white/10 px-2 py-1 text-xs">Ver captura</a>
                  <button onClick={() => patchPayment(p.id, "approved")} className="rounded bg-emerald-500/20 px-2 py-1 text-xs">Aprobar</button>
                  <button onClick={() => patchPayment(p.id, "rejected")} className="rounded bg-rose-500/20 px-2 py-1 text-xs">Rechazar</button>
                  <button onClick={() => patchPayment(p.id, "expired")} className="rounded bg-amber-500/20 px-2 py-1 text-xs">Expirar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "announcements" ? (
        <div className="glass rounded-lg p-4">
          <p className="mb-3 text-sm text-cyan-200">Anuncios globales realtime</p>
          <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
            <input value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm" />
            <select value={announcementType} onChange={(e) => setAnnouncementType(e.target.value)} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm">
              <option value="banner">banner</option>
              <option value="toast">toast</option>
              <option value="popup">popup</option>
              <option value="maintenance">maintenance</option>
            </select>
            <button
              onClick={async () => {
                if (!user) return;
                await adminFetch(user, "/api/admin/announcements", {
                  method: "POST",
                  body: JSON.stringify({ message: announcementText, type: announcementType, active: true }),
                });
                await refreshAll(q);
              }}
              className="rounded-md bg-cyan-500/20 px-3 py-2 text-sm text-cyan-100"
            >
              Enviar
            </button>
          </div>
        </div>
      ) : null}

      {tab === "security" ? (
        <div className="glass rounded-lg p-4">
          <p className="mb-3 flex items-center gap-2 text-sm text-cyan-200"><ShieldAlert className="h-4 w-4" /> Anti multicuenta / IP bans</p>
          <div className="mb-3 flex gap-2">
            <input value={newIp} onChange={(e) => setNewIp(e.target.value)} placeholder="IP a bloquear" className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm" />
            <button
              onClick={async () => {
                if (!user) return;
                await adminFetch(user, "/api/admin/ban-ip", {
                  method: "POST",
                  body: JSON.stringify({ ip: newIp, reason: "Admin action" }),
                });
                setNewIp("");
                await refreshAll(q);
              }}
              className="rounded-md bg-rose-500/20 px-3 py-2 text-sm text-rose-100"
            >
              Bloquear IP
            </button>
          </div>
          <div className="space-y-2 text-sm text-zinc-200">
            {bannedIps.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2">
                <p>{entry.ip} · {entry.reason}</p>
                <button
                  onClick={async () => {
                    if (!user) return;
                    await adminFetch(user, "/api/admin/ban-ip", {
                      method: "DELETE",
                      body: JSON.stringify({ ip: entry.ip }),
                    });
                    await refreshAll(q);
                  }}
                  className="rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200"
                >
                  Desbloquear
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
