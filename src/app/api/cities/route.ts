import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Hoarding from "@/models/Hoarding";

export async function GET() {
  try {
    await dbConnect();
    
    // Get unique cities from approved hoardings
    const cities = await Hoarding.distinct("location.city", { status: "approved" });
    
    // We also want to get state for better display, but distinct only returns one field.
    // Let's get unique city/state combinations.
    const cityData = await Hoarding.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: {
            city: "$location.city",
            state: "$location.state"
          }
        }
      },
      {
        $project: {
          _id: 0,
          city: "$_id.city",
          state: "$_id.state",
          display: { $concat: ["$_id.city", ", ", "$_id.state"] }
        }
      },
      { $sort: { city: 1 } }
    ]);

    return NextResponse.json(cityData);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
  }
}
