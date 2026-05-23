import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, writeAdminLog } from "../_utils";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  const adminDb = auth.adminDb!;
  const snap = await adminDb.collection("announcements").orderBy("createdAt", "desc").limit(100).get();
  return NextResponse.json({ announcements: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as {
    message: string;
    type: "toast" | "popup" | "banner" | "maintenance";
    active?: boolean;
  };
  const adminDb = auth.adminDb!;
  const actorUid = auth.uid!;
  const ref = await adminDb.collection("announcements").add({
    message: body.message,
    type: body.type,
    active: body.active ?? true,
    createdAt: new Date().toISOString(),
    createdBy: actorUid,
  });
  await writeAdminLog(adminDb, actorUid, "announcements.create", { ...body, id: ref.id });
  return NextResponse.json({ ok: true, id: ref.id });
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  const adminDb = auth.adminDb!;
  const actorUid = auth.uid!;
  const body = (await request.json()) as { id: string; active?: boolean; message?: string };
  await adminDb.collection("announcements").doc(body.id).update({
    ...(body.active !== undefined ? { active: body.active } : {}),
    ...(body.message ? { message: body.message } : {}),
    updatedAt: new Date().toISOString(),
    updatedBy: actorUid,
  });
  await writeAdminLog(adminDb, actorUid, "announcements.patch", body as unknown as Record<string, unknown>);
  return NextResponse.json({ ok: true });
}
