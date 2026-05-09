import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Hoarding from "@/models/Hoarding";
import User from "@/models/User";
import { razorpay } from "@/lib/razorpay";
import { verifyAccessToken } from "@/lib/jwt";
import {
  calculateCampaignPricing,
  getPlatformPricingSettings,
} from "@/lib/platformPricing";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Approved booking request is required for payment." },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await User.findById(payload.userId).select("role kycStatus");
    if (!user || user.role !== "buyer") {
      return NextResponse.json(
        { error: "Only buyers can make booking payments." },
        { status: 403 },
      );
    }

    // Buyer KYC check removed to facilitate easier booking process.

    const booking = await Booking.findOne({
      _id: bookingId,
      user: payload.userId,
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "approved") {
      return NextResponse.json(
        { error: "This request is not approved for payment yet." },
        { status: 400 },
      );
    }

    const hoarding = await Hoarding.findById(booking.hoarding);
    if (!hoarding) {
      return NextResponse.json({ error: "Hoarding not found" }, { status: 404 });
    }

    const settings = await getPlatformPricingSettings();
    const diffTime = Math.abs(
      new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime(),
    );
    const diffDays = Math.max(
      1,
      Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
    );
    const pricing = calculateCampaignPricing(
      hoarding.pricePerMonth,
      diffDays,
      settings,
    );
    const amount = booking.totalAmount || pricing.totalAmount;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    booking.orderId = order.id;
    await booking.save();

    return NextResponse.json({
      orderId: order.id,
      bookingId: booking._id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Payment Init Error:", error);
    return NextResponse.json(
      { error: error.message || "Payment initiation failed" },
      { status: 500 },
    );
  }
}
