import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Hoarding from "@/models/Hoarding";

export async function GET() {
  try {
    await dbConnect();
    
    await Hoarding.updateOne(
      { "location.city": "Bhubaneswar", name: "Premium Hoarding - Master Plan Area" },
      { $set: { images: ["/bbsr.png"] } }
    );

    await Hoarding.updateOne(
      { "location.city": "Cuttack", name: "Central Gantry - Cuttack High Court Road" },
      { $set: { images: ["/cuttack.jpg"] } }
    );

    await Hoarding.updateOne(
      { "location.city": "Rourkela", name: "Smart Unipole - Rourkela Steel City Square" },
      { $set: { images: ["/rkl.jpg"] } }
    );

    return NextResponse.json({ message: "Images updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
