import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "../_utils";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return auth.response;

  const adminDb = auth.adminDb!;
  const [usersSnap, paymentsSnap, subscriptionsSnap, logsSnap] = await Promise.all([
    adminDb.collection("users").get(),
    adminDb.collection("payments").get(),
    adminDb.collection("subscriptions").get(),
    adminDb.collection("adminLogs").orderBy("createdAt", "desc").limit(10).get().catch(() => null),
  ]);

  const users = usersSnap.docs.map((d) => d.data());
  const payments = paymentsSnap.docs.map((d) => d.data());
  const premiumActive = users.filter((u) => ["basic", "plus", "ultra"].includes(u.subscriptionPlan)).length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const estimatedRevenue = payments.filter((p) => p.status === "approved").length * 25;
  const uploads = payments.length;
  const onlineUsers = users.filter((u) => {
    const last = new Date(u.lastLogin || 0).getTime();
    return Date.now() - last < 1000 * 60 * 15;
  }).length;

  return NextResponse.json({
    totalUsers: users.length,
    onlineUsers,
    premiumActive,
    pendingPayments,
    estimatedRevenue,
    uploads,
    subscriptions: subscriptionsSnap.size,
    latestLogs: logsSnap ? logsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) : [],
  });
}
