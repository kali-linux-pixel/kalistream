import { NextRequest, NextResponse } from "next/server";
import { getAdminServices } from "@/firebase/admin";

const ADMIN_ROLES = new Set(["admin", "owner", "moderator"]);

export async function verifyAdminRequest(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const roleCookie = request.cookies.get("kalistream_role")?.value;
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "Missing token" }, { status: 401 }) };
  }

  try {
    const { adminAuth, adminDb } = getAdminServices();
    const decoded = await adminAuth.verifyIdToken(token);
    const snap = await adminDb.collection("users").doc(decoded.uid).get();
    const role = (snap.data()?.role || roleCookie || "free") as string;
    if (!ADMIN_ROLES.has(role)) {
      return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { ok: true, uid: decoded.uid, role, adminDb };
  } catch (error) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: error instanceof Error ? error.message : "Unauthorized admin access" },
        { status: 401 },
      ),
    };
  }
}

export async function writeAdminLog(
  adminDb: FirebaseFirestore.Firestore,
  actorUid: string,
  action: string,
  payload: Record<string, unknown>,
) {
  await adminDb.collection("adminLogs").add({
    actorUid,
    action,
    payload,
    createdAt: new Date().toISOString(),
  });
}
