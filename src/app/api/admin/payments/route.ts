import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, writeAdminLog } from "../_utils";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  const adminDb = auth.adminDb!;
  const snap = await adminDb.collection("payments").orderBy("createdAt", "desc").limit(300).get();
  return NextResponse.json({ payments: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return auth.response;
  const adminDb = auth.adminDb!;
  const actorUid = auth.uid!;
  const body = (await request.json()) as {
    paymentId: string;
    status: "pending" | "approved" | "rejected" | "expired";
    durationDays?: number;
    expireAt?: string;
  };
  const paymentRef = adminDb.collection("payments").doc(body.paymentId);
  const paymentSnap = await paymentRef.get();
  if (!paymentSnap.exists) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  const payment = paymentSnap.data()!;

  await paymentRef.update({
    status: body.status,
    reviewedBy: actorUid,
    reviewedAt: new Date().toISOString(),
  });

  if (body.status === "approved") {
    const days = Number(body.durationDays || 30);
    const userRef = adminDb.collection("users").doc(String(payment.uid));
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      const current = new Date(String(userSnap.data()?.subscriptionExpire || Date.now())).getTime();
      const next = body.expireAt
        ? new Date(body.expireAt).toISOString()
        : new Date(Math.max(current, Date.now()) + days * 86400000).toISOString();
      await userRef.update({
        subscriptionPlan: payment.plan || "plus",
        role: payment.plan || "plus",
        subscriptionExpire: next,
      });
      await adminDb.collection("subscriptions").add({
        uid: payment.uid,
        plan: payment.plan,
        status: "approved",
        expiresAt: next,
        createdAt: new Date().toISOString(),
        paymentId: body.paymentId,
      });
    }
  }

  await writeAdminLog(adminDb, actorUid, "payments.patch", body as unknown as Record<string, unknown>);
  return NextResponse.json({ ok: true });
}
