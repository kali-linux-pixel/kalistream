import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, writeAdminLog } from "../_utils";

type AdminUserRow = {
  id: string;
  uid: string;
  username: string;
  email: string;
};

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  const adminDb = auth.adminDb!;
  const q = request.nextUrl.searchParams.get("q")?.toLowerCase() || "";
  const snap = await adminDb.collection("users").orderBy("createdAt", "desc").limit(300).get();
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) })) as AdminUserRow[];
  const filtered = q
    ? rows.filter((u) =>
        [u.username, u.email, u.uid].some((field) => String(field || "").toLowerCase().includes(q)),
      )
    : rows;
  return NextResponse.json({ users: filtered });
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  const adminDb = auth.adminDb!;
  const actorUid = auth.uid!;
  const body = (await request.json()) as {
    uid: string;
    action:
      | "ban"
      | "unban"
      | "delete"
      | "setRole"
      | "setPlan"
      | "extendPremium"
      | "resetContinueWatching"
      | "clearWatchHistory"
      | "clearFavorites";
    value?: string;
    days?: number;
  };

  const ref = adminDb.collection("users").doc(body.uid);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const user = snap.data() || {};

  if (body.action === "delete") {
    await ref.delete();
  } else if (body.action === "ban") {
    await ref.update({ isBanned: true, bannedAt: new Date().toISOString() });
  } else if (body.action === "unban") {
    await ref.update({ isBanned: false });
  } else if (body.action === "setRole" && body.value) {
    await ref.update({ role: body.value });
  } else if (body.action === "setPlan" && body.value) {
    await ref.update({ subscriptionPlan: body.value });
  } else if (body.action === "extendPremium") {
    const current = new Date(String(user.subscriptionExpire || Date.now())).getTime();
    const days = Number(body.days || 0);
    const next = new Date(Math.max(current, Date.now()) + days * 86400000).toISOString();
    await ref.update({ subscriptionExpire: next });
  } else if (body.action === "resetContinueWatching") {
    await ref.update({ continueWatching: [] });
  } else if (body.action === "clearWatchHistory") {
    await ref.update({ watchHistory: [] });
  } else if (body.action === "clearFavorites") {
    await ref.update({ favorites: [] });
  }

  await writeAdminLog(adminDb, actorUid, "users.patch", body as unknown as Record<string, unknown>);
  return NextResponse.json({ ok: true });
}
