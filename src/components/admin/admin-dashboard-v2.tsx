"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ChartNoAxesCombined,
  CreditCard,
  ShieldAlert,
  UsersRound,
  Video,
  Activity,
  AlertTriangle,
  Globe,
  Moon,
  Sun,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuthSession } from "@/components/layout/auth-provider";
import { UserBadge } from "@/components/ui/UserBadge";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { LoadingSkeleton, TableRowSkeleton } from "@/components/ui/LoadingSkeleton";
import { IPMask } from "@/components/ui/IPMask";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { PaymentRequestsDashboard } from "@/components/admin/PaymentRequestsDashboard";
import { formatDate, formatRelativeTime, getRoleBadgeColor } from "@/lib/formatting";
import { debounce } from "@/lib/anti-spam";
import { approvePayment, rejectPayment } from "@/firebase/firestore";
import { motion } from "motion/react";

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
  lastActivity?: string;
  lastIP?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
  osVersion?: string;
  isVPN?: boolean;
  onlineStatus?: "online" | "offline" | "suspicious";
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

async function adminFetch<T>(
  user: { getIdToken: () => Promise<string> } | null,
  url: string,
  init?: RequestInit
) {
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
  const [tab, setTab] = useState<"overview" | "users" | "payments" | "announcements" | "security">(
    "overview"
  );
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [bannedIps, setBannedIps] = useState<BannedIp[]>([]);
  const [q, setQ] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVPN, setFilterVPN] = useState("all");
  const [announcementText, setAnnouncementText] = useState("Nuevo estreno disponible esta noche");
  const [announcementType, setAnnouncementType] = useState("banner");
  const [newIp, setNewIp] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  async function refreshAll(search = "", role = "all", status = "all", vpn = "all") {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        q: search,
        role: role !== "all" ? role : "",
        status: status !== "all" ? status : "",
        vpn: vpn !== "all" ? vpn : "",
      });

      const [statsRes, usersRes, paymentsRes, ipsRes] = await Promise.all([
        adminFetch<AdminStats>(user, "/api/admin/stats"),
        adminFetch<{ users: AdminUser[] }>(user, `/api/admin/users?${params.toString()}`),
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

  const debouncedSearch = useCallback(
    debounce((search: string, role: string, status: string, vpn: string) => {
      refreshAll(search, role, status, vpn);
    }, 300),
    []
  );

  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => refreshAll(q, filterRole, filterStatus, filterVPN), 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSearch = (value: string) => {
    setQ(value);
    debouncedSearch(value, filterRole, filterStatus, filterVPN);
  };

  const chartData = useMemo(
    () => [
      { key: "Users", value: stats?.totalUsers || 0 },
      { key: "Online", value: stats?.onlineUsers || 0 },
      { key: "Premium", value: stats?.premiumActive || 0 },
      { key: "Pending", value: stats?.pendingPayments || 0 },
    ],
    [stats]
  );

  async function patchUser(uid: string, action: string, value?: string | number) {
    if (!user) return;
    const payload: Record<string, unknown> = { uid, action };
    if (action === "setRole" || action === "setPlan") payload.value = value;
    if (action === "extendPremium") payload.days = Number(value || 30);
    await adminFetch(user, "/api/admin/users", { method: "PATCH", body: JSON.stringify(payload) });
    await refreshAll(q, filterRole, filterStatus, filterVPN);
  }

  async function patchPayment(paymentId: string, status: string) {
    if (!user) return;
    await adminFetch(user, "/api/admin/payments", {
      method: "PATCH",
      body: JSON.stringify({ paymentId, status }),
    });
    await refreshAll(q, filterRole, filterStatus, filterVPN);
  }

  if (loading)
    return (
      <div className="space-y-4">
        <LoadingSkeleton count={3} />
      </div>
    );
  if (error)
    return (
      <div className="glass rounded-lg p-5 text-rose-300 border border-rose-500/30">
        {error}
      </div>
    );

  const metrics = [
    { label: "Total usuarios", value: String(stats?.totalUsers || 0), icon: UsersRound, trend: { value: 5, isPositive: true } },
    { label: "Usuarios online", value: String(stats?.onlineUsers || 0), icon: Activity, trend: { value: 12, isPositive: true } },
    { label: "Premium activos", value: String(stats?.premiumActive || 0), icon: Video, trend: { value: 3, isPositive: true } },
    { label: "Ingresos estimados", value: `S/${stats?.estimatedRevenue || 0}`, icon: ChartNoAxesCombined, trend: { value: 8, isPositive: true } },
  ];

  return (
    <ErrorBoundary>
      <div className={`space-y-6 transition-colors ${darkMode ? "bg-gradient-to-br from-black via-black to-black/80" : "bg-white"}`}>
        {/* Header + Dark Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            KaliCore Admin Pro
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
            </button>
            <div className="flex flex-wrap gap-2">
              {["overview", "users", "payments", "announcements", "security"].map((t) => (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTab(t as any)}
                  className={`rounded-lg px-3 py-2 text-xs uppercase font-semibold transition-all ${
                    tab === t
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg"
                      : "bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  {t}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {tab === "overview" ? (
          <>
            {/* Analytics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                <AnalyticsCard
                  key={metric.label}
                  title={metric.label}
                  value={metric.value}
                  trend={metric.trend}
                  icon={<metric.icon className="h-6 w-6" />}
                />
              ))}
            </div>

            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-lg p-4"
            >
              <p className="mb-4 text-sm text-cyan-200 font-semibold">Estadísticas visuales</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                    <XAxis dataKey="key" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)" }} />
                    <Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Recent Logs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-lg p-4"
            >
              <p className="mb-3 text-sm text-cyan-200 font-semibold">Últimos logs admin</p>
              <div className="space-y-2 text-xs text-zinc-300 max-h-64 overflow-y-auto">
                {(stats?.latestLogs || []).length > 0 ? (
                  stats?.latestLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors">
                      <span>{log.action}</span>
                      <span className="text-zinc-500">{formatRelativeTime(log.createdAt)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500">No hay logs recientes</p>
                )}
              </div>
            </motion.div>
          </>
        ) : null}

        {/* Users Tab - MEJORADO */}
        {tab === "users" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-lg p-4"
          >
            {/* Filters */}
            <div className="mb-4 space-y-3">
              <div className="grid gap-2 md:grid-cols-4">
                <input
                  value={q}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar usuario..."
                  className="col-span-2 md:col-span-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <select
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    debouncedSearch(q, e.target.value, filterStatus, filterVPN);
                  }}
                  className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="ultra">Ultra</option>
                  <option value="basic">Basic</option>
                  <option value="free">Free</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    debouncedSearch(q, filterRole, e.target.value, filterVPN);
                  }}
                  className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">Todos los status</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="suspicious">Suspicious</option>
                </select>
                <select
                  value={filterVPN}
                  onChange={(e) => {
                    setFilterVPN(e.target.value);
                    debouncedSearch(q, filterRole, filterStatus, e.target.value);
                  }}
                  className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">VPN: Todos</option>
                  <option value="vpn">Solo VPN</option>
                  <option value="novpn">Sin VPN</option>
                </select>
              </div>
              <p className="text-xs text-zinc-400">
                Mostrando {users.length} usuarios · Auto-refresh cada 30s
              </p>
            </div>

            {/* Users Table */}
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="text-zinc-400 border-b border-white/10">
                    <tr>
                      <th className="px-2 py-3 font-semibold">Usuario</th>
                      <th className="px-2 py-3 font-semibold">Rol/Plan</th>
                      <th className="px-2 py-3 font-semibold">Ubicación</th>
                      <th className="px-2 py-3 font-semibold">Dispositivo</th>
                      <th className="px-2 py-3 font-semibold">IP</th>
                      <th className="px-2 py-3 font-semibold">Último Login</th>
                      <th className="px-2 py-3 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <motion.tr
                        key={u.uid}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-t border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={u.avatar || "/next.svg"}
                              alt={u.username}
                              className="h-8 w-8 rounded-full border border-white/20"
                            />
                            <div>
                              <p className="font-medium text-white">{u.username}</p>
                              <p className="text-zinc-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            <UserBadge role={u.role} size="sm" />
                            <span className="text-zinc-400">{u.subscriptionPlan}</span>
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          {u.countryCode ? (
                            <CountryFlag countryCode={u.countryCode} showName={false} size="sm" />
                          ) : (
                            "-"
                          )}
                          {u.city && <p className="text-zinc-500 text-xs">{u.city}</p>}
                        </td>
                        <td className="px-2 py-3">
                          <div className="text-xs text-zinc-400">
                            {u.os && <p>{u.os}</p>}
                            {u.browser && <p className="text-zinc-500">{u.browser}</p>}
                            {u.isVPN && <p className="text-amber-400">🔒 VPN</p>}
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          {u.lastIP ? <IPMask ip={u.lastIP} /> : "-"}
                        </td>
                        <td className="px-2 py-3">
                          <div>
                            <p className="text-zinc-300">{formatDate(u.lastLogin, true)}</p>
                            {u.onlineStatus && (
                              <StatusIndicator status={u.onlineStatus as any} showLabel={true} size="sm" />
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex flex-wrap gap-1">
                            <button
                              onClick={() => patchUser(u.uid, u.isBanned ? "unban" : "ban")}
                              className="rounded px-2 py-1 text-xs bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 transition-colors"
                            >
                              {u.isBanned ? "Unban" : "Ban"}
                            </button>
                            <button
                              onClick={() => patchUser(u.uid, "setPlan", "ultra")}
                              className="rounded px-2 py-1 text-xs bg-violet-500/20 text-violet-100 hover:bg-violet-500/30 transition-colors"
                            >
                              Ultra
                            </button>
                            <button
                              onClick={() => patchUser(u.uid, "extendPremium", 30)}
                              className="rounded px-2 py-1 text-xs bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 transition-colors"
                            >
                              +30d
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No hay usuarios" description="No se encontraron usuarios con los filtros aplicados" />
            )}
          </motion.div>
        ) : null}

        {/* Payments Tab */}
        {tab === "payments" ? (
          <PaymentRequestsDashboard
            userRole={profile.role}
            onApprove={async (id) => {
              try {
                await approvePayment(id, profile.uid);
                // Refresh payments after approval
                fetchPayments();
              } catch (error) {
                console.error("Error approving payment:", error);
              }
            }}
            onReject={async (id, reason) => {
              try {
                await rejectPayment(id, profile.uid, reason);
                // Refresh payments after rejection
                fetchPayments();
              } catch (error) {
                console.error("Error rejecting payment:", error);
              }
            }}
            loading={loading}
          />
        ) : null}

        {/* Announcements Tab */}
        {tab === "announcements" ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-lg p-4">
            <p className="mb-4 text-sm text-cyan-200 font-semibold">Anuncios globales realtime</p>
            <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
              <input
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <select
                value={announcementType}
                onChange={(e) => setAnnouncementType(e.target.value)}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="banner">banner</option>
                <option value="toast">toast</option>
                <option value="popup">popup</option>
                <option value="maintenance">maintenance</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  if (!user) return;
                  await adminFetch(user, "/api/admin/announcements", {
                    method: "POST",
                    body: JSON.stringify({ message: announcementText, type: announcementType, active: true }),
                  });
                  await refreshAll(q, filterRole, filterStatus, filterVPN);
                }}
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-3 py-2 text-sm text-white font-semibold hover:shadow-lg transition-shadow"
              >
                Enviar
              </motion.button>
            </div>
          </motion.div>
        ) : null}

        {/* Security Tab */}
        {tab === "security" ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-lg p-4">
            <p className="mb-4 flex items-center gap-2 text-sm text-cyan-200 font-semibold">
              <ShieldAlert className="h-4 w-4" /> Anti multicuenta / IP bans
            </p>
            <div className="mb-4 flex gap-2">
              <input
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                placeholder="IP a bloquear"
                className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  if (!user) return;
                  await adminFetch(user, "/api/admin/ban-ip", {
                    method: "POST",
                    body: JSON.stringify({ ip: newIp, reason: "Admin action" }),
                  });
                  setNewIp("");
                  await refreshAll(q, filterRole, filterStatus, filterVPN);
                }}
                className="rounded-lg bg-rose-500/20 px-3 py-2 text-sm text-rose-100 font-semibold hover:bg-rose-500/30 transition-colors"
              >
                Bloquear
              </motion.button>
            </div>
            <div className="space-y-2 text-sm text-zinc-200">
              {bannedIps.length > 0 ? (
                bannedIps.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2 hover:bg-black/40 transition-colors">
                    <div>
                      <p className="font-mono text-xs">{entry.ip}</p>
                      {entry.reason && <p className="text-zinc-500 text-xs">{entry.reason}</p>}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        if (!user) return;
                        await adminFetch(user, "/api/admin/ban-ip", {
                          method: "DELETE",
                          body: JSON.stringify({ ip: entry.ip }),
                        });
                        await refreshAll(q, filterRole, filterStatus, filterVPN);
                      }}
                      className="rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-500/30 transition-colors"
                    >
                      Desbloquear
                    </motion.button>
                  </div>
                ))
              ) : (
                <EmptyState title="No hay IPs bloqueadas" description="No hay restricciones de IP activas" />
              )}
            </div>
          </motion.div>
        ) : null}
      </div>
    </ErrorBoundary>
  );
}
