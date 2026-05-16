import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const seconds = Number(body.seconds);

    if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 120) {
      return NextResponse.json({ error: "Invalid time value" }, { status: 400 });
    }

    await dbConnect();

    await User.findByIdAndUpdate(payload.userId, {
      $inc: { totalTimeOnSite: Math.round(seconds) },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Track Time Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
