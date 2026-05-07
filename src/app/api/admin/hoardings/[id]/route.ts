import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import Hoarding from '@/models/Hoarding';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

// PATCH - Update hoarding status or details (admin only)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const body = await req.json();
        const { status, uniqueReach } = body;

        const updateData: any = {};
        if (status) updateData.status = status;
        if (uniqueReach !== undefined) {
            const parsedUniqueReach = Number(uniqueReach);
            if (!Number.isFinite(parsedUniqueReach) || parsedUniqueReach < 0) {
                return NextResponse.json(
                    { error: "uniqueReach must be a non-negative number" },
                    { status: 400 }
                );
            }
            updateData.uniqueReach = Math.round(parsedUniqueReach);
        }

        const hoarding = await Hoarding.findByIdAndUpdate(id, updateData, { new: true })
            .populate('owner', 'name email');

        if (!hoarding) {
            return NextResponse.json({ error: "Hoarding not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Hoarding updated successfully", hoarding }, { status: 200 });

    } catch (error: any) {
        console.error("Admin Update Hoarding Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

// DELETE - Delete hoarding (admin only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const hoarding = await Hoarding.findByIdAndDelete(id);

        if (!hoarding) {
            return NextResponse.json({ error: "Hoarding not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Hoarding deleted successfully" }, { status: 200 });

    } catch (error: any) {
        console.error("Admin Delete Hoarding Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
