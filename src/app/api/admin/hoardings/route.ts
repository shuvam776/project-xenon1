import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import Hoarding from '@/models/Hoarding';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

// GET all hoardings (admin view)
export async function GET(req: Request) {
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
        const user = await User.findById(payload.userId);

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: "Access denied. Admin only." }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const city = searchParams.get('city');
        const owner = searchParams.get('owner');

        const query: any = {};
        if (status) query.status = status;
        if (city) query['location.city'] = { $regex: new RegExp(city, 'i') };
        if (owner) query.owner = owner;

        const hoardings = await Hoarding.find(query)
            .populate('owner', 'name email phone role')
            .sort({ createdAt: -1 });

        return NextResponse.json({ hoardings }, { status: 200 });

    } catch (error: any) {
        console.error("Admin Hoardings Fetch Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

// DELETE multiple hoardings (admin only)
export async function DELETE(req: Request) {
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

        const body = await req.json().catch(() => null);
        const hoardingIds = Array.isArray(body?.hoardingIds)
            ? body.hoardingIds.filter((id: unknown) => typeof id === 'string' && id.trim().length > 0)
            : [];

        if (hoardingIds.length === 0) {
            return NextResponse.json(
                { error: "hoardingIds must be a non-empty array of IDs" },
                { status: 400 }
            );
        }

        const result = await Hoarding.deleteMany({ _id: { $in: hoardingIds } });

        return NextResponse.json(
            {
                message: "Bulk delete completed",
                deletedCount: result.deletedCount ?? 0,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Admin Bulk Delete Hoardings Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
