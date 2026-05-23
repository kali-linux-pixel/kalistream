import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, writeAdminLog } from "../_utils";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  const adminDb = auth.adminDb!;
  const snap = await adminDb.collection("bannedIps").orderBy("createdAt", "desc").limit(200).get();
  return NextResponse.json({ bannedIps: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  const adminDb = auth.adminDb!;
  const actorUid = auth.uid!;
  const body = (await request.json()) as { ip: string; reason?: string };
  const ip = body.ip?.trim();
  if (!ip) return NextResponse.json({ error: "IP required" }, { status: 400 });
  await adminDb.collection("bannedIps").doc(ip).set({
    ip,
    reason: body.reason || "Manual block",
    createdAt: new Date().toISOString(),
    createdBy: actorUid,
  });
  await writeAdminLog(adminDb, actorUid, "ban-ip.create", body as unknown as Record<string, unknown>);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  const adminDb = auth.adminDb!;
  const actorUid = auth.uid!;
  const body = (await request.json()) as { ip: string };
  await adminDb.collection("bannedIps").doc(body.ip).delete();
  await writeAdminLog(adminDb, actorUid, "ban-ip.delete", body as unknown as Record<string, unknown>);
  return NextResponse.json({ ok: true });
}
