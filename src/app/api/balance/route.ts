import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getUserTotalBalance } from "@/app/(dashboard)/time-tracking/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const balance = await getUserTotalBalance(session.user.id);
  return NextResponse.json({ balance });
}
