import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Booking from '@/models/Booking';
import Wishlist from '@/models/Wishlist';
import Hoarding from '@/models/Hoarding'; // Ensure Hoarding model is registered
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
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

        // 1. Get Buyer details
        const buyer = await User.findById(id).select('-password -refreshToken');
        if (!buyer) {
            return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
        }

        // 2. Get Buyer Wishlist
        const wishlistData = await Wishlist.findOne({ user: id }).populate({
            path: 'hoardings',
            select: 'name location pricePerMonth images status',
        });

        // 3. Get Buyer Bookings
        const bookings = await Booking.find({ user: id })
            .populate({
                path: 'hoarding',
                select: 'name location pricePerMonth images',
            })
            .sort({ createdAt: -1 });

        return NextResponse.json({
            buyer,
            wishlist: wishlistData ? wishlistData.hoardings : [],
            bookings
        }, { status: 200 });

    } catch (error: any) {
        console.error("Admin Get Buyer Details Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
