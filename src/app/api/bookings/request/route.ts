import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Hoarding from "@/models/Hoarding";
import User from "@/models/User";
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

    await dbConnect();

    const user = await User.findById(payload.userId);
    if (!user || user.role !== "buyer") {
      return NextResponse.json(
        { error: "Only buyers can send booking requests" },
        { status: 403 },
      );
    }

    // Buyer KYC check removed to facilitate easier booking process.

    const { hoardingId, startDate, endDate } = await req.json();
    if (!hoardingId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const hoarding = await Hoarding.findById(hoardingId);
    if (!hoarding) {
      return NextResponse.json({ error: "Hoarding not found" }, { status: 404 });
    }

    if (hoarding.status !== "approved") {
      return NextResponse.json(
        { error: "Hoarding is not available for booking" },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    const overlap = await Booking.findOne({
      hoarding: hoardingId,
      status: { $in: ["approved", "confirmed"] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    }).select("_id");

    if (overlap) {
      return NextResponse.json(
        { error: "Selected dates are already approved or booked." },
        { status: 400 },
      );
    }

    if (hoarding.availability?.blockedDates) {
      const isBlocked = hoarding.availability.blockedDates.some((block: any) => {
        const blockStart = new Date(block.startDate);
        const blockEnd = new Date(block.endDate);
        return blockStart <= end && blockEnd >= start;
      });
      if (isBlocked) {
        return NextResponse.json(
          { error: "Selected dates are unavailable/blocked by vendor." },
          { status: 400 },
        );
      }
    }

    const existingRequest = await Booking.findOne({
      hoarding: hoardingId,
      user: user._id,
      status: { $in: ["requested", "approved"] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    }).select("_id status");

    if (existingRequest) {
      return NextResponse.json(
        {
          error:
            existingRequest.status === "approved"
              ? "You already have an approved request for these dates."
              : "You already have a pending request for these dates.",
        },
        { status: 400 },
      );
    }

    const settings = await getPlatformPricingSettings();
    const pricing = calculateCampaignPricing(
      hoarding.pricePerMonth,
      diffDays,
      settings,
    );

    const booking = await Booking.create({
      hoarding: hoardingId,
      user: user._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalAmount: pricing.totalAmount,
      platformFee: pricing.platformFee,
      vendorAmount: pricing.vendorBaseAmount,
      status: "requested",
    });

    return NextResponse.json(
      {
        message: "Booking request sent to vendor.",
        bookingId: booking._id,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Booking request error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send booking request" },
      { status: 500 },
    );
  }
}
