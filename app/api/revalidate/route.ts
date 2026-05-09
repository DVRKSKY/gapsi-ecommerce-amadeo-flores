import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ revalidated: false }, { status: 501 });
}
