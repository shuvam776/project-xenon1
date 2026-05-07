import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { kycSchema } from '@/lib/validators/user';
import { normalizePhone } from '@/lib/otp';

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

    await dbConnect();
    const currentUser = await User.findById(payload.userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const submittedPhone =
      typeof body.phone === "string" && body.phone.trim()
        ? normalizePhone(body.phone)
        : "";
    const existingPhone = currentUser.phone ? normalizePhone(currentUser.phone) : "";
    const phone = submittedPhone || existingPhone;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required before submitting KYC details." },
        { status: 400 },
      );
    }

    const result = kycSchema.safeParse({
      ...body,
      phone,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { address, companyName, gstin, pan, aadhaar, documents } = result.data;

    // Check if phone already exists for another user
    const duplicatePhoneUser = await User.findOne({ phone, _id: { $ne: payload.userId } });
    if (duplicatePhoneUser) {
      return NextResponse.json({ error: "Phone number already in use" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(payload.userId, {
      phone,
      kycDetails: {
        phone,
        address,
        companyName,
        gstin,
        pan,
        aadhaar,
        documents: documents || []
      },
      kycStatus: 'submitted',
    }, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "KYC submitted successfully.",
      user: updatedUser,
    });
  } catch (error: unknown) {
    console.error("KYC Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
