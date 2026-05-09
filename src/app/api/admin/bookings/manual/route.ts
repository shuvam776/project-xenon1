import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Booking from '@/models/Booking';
import Hoarding from '@/models/Hoarding';
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

        await dbConnect();
        const admin = await User.findById(payload.userId);

        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ error: "Access denied. Admin only." }, { status: 403 });
        }

        const body = await req.json();
        const { buyerId, hoardingId, startDate, endDate, totalAmount } = body;

        if (!buyerId || !hoardingId || !startDate || !endDate || !totalAmount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify buyer exists
        const buyer = await User.findById(buyerId);
        if (!buyer || buyer.role !== 'buyer') {
            return NextResponse.json({ error: "Valid buyer not found" }, { status: 404 });
        }

        // Verify hoarding exists
        const hoarding = await Hoarding.findById(hoardingId);
        if (!hoarding) {
            return NextResponse.json({ error: "Hoarding not found" }, { status: 404 });
        }

        // Create a confirmed booking
        const newBooking = new Booking({
            user: buyerId,
            hoarding: hoardingId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            totalAmount,
            status: 'confirmed',
            paymentId: `ADMIN_MANUAL_${Date.now()}`,
            orderId: `ADMIN_ORDER_${Date.now()}`,
            paidAt: new Date(),
        });

        await newBooking.save();

        return NextResponse.json({ message: "Manual booking created successfully", booking: newBooking }, { status: 201 });

    } catch (error: any) {
        console.error("Admin Manual Booking Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
