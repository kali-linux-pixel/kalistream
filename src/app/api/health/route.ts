import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "KaliStream API",
    status: "ok",
    collections: [
      "users",
      "payments",
      "subscriptions",
      "announcements",
      "favorites",
      "watchHistory",
      "settings",
      "reports",
    ],
  });
}
