import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    console.log("[Admin Messages GET] Access Token:", token ? "Found" : "Missing");

    const decoded = verifyAccessToken(token as string);
    if (!decoded) {
      console.warn("[Admin Messages GET] Invalid or expired token");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    console.log("[Admin Messages GET] Decoded User:", decoded.userId, "Role:", decoded.role);
    if (decoded.role !== "admin") {
      console.warn("[Admin Messages GET] Forbidden: User is not an admin", decoded.role);
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    await dbConnect();

    // Find all admins
    const admins = await User.find({ role: "admin" }).select("_id");
    const adminIds = admins.map(a => a._id);

    // Find all messages involving ANY admin
    const messages = await Message.find({
      $or: [{ sender: { $in: adminIds } }, { receiver: { $in: adminIds } }],
    })
      .populate("sender", "name email role")
      .populate("receiver", "name email role")
      .sort({ createdAt: 1 });

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
    // For admin replying to messages
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    console.log("[Admin Messages POST] Access Token:", token ? "Found" : "Missing");

    const decoded = verifyAccessToken(token as string);
    if (!decoded) {
      console.warn("[Admin Messages POST] Invalid or expired token");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    console.log("[Admin Messages POST] Decoded User:", decoded.userId, "Role:", decoded.role);
    if (decoded.role !== "admin") {
      console.warn("[Admin Messages POST] Forbidden: User is not an admin", decoded.role);
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    await dbConnect();
    const { receiver, content, type = "chat", status = "unread" } = await req.json();

    const newMessage = await Message.create({
      sender: decoded.userId,
      receiver,
      content,
      type,
      status,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email role")
      .populate("receiver", "name email role");

    return NextResponse.json(
      { message: "Reply sent", data: populatedMessage },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const decoded = verifyAccessToken(token as string);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { threadId } = await req.json();
    if (!threadId || typeof threadId !== "string") {
      return NextResponse.json({ error: "threadId is required" }, { status: 400 });
    }

    await dbConnect();

    const query: Record<string, unknown> = {
      receiver: decoded.userId,
      status: "unread",
    };

    if (threadId.includes("@")) {
      query.email = threadId;
    } else {
      query.sender = threadId;
    }

    const result = await Message.updateMany(query, { $set: { status: "read" } });

    return NextResponse.json({
      message: "Messages marked as read",
      updatedCount: result.modifiedCount ?? 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
