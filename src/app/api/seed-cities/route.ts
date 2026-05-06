import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Hoarding from "@/models/Hoarding";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();
    
    // Check if they already exist to avoid duplicates
    const existing = await Hoarding.findOne({ "location.city": "Bhubaneswar", "name": "Premium Hoarding - Master Plan Area" });
    if (existing) {
       return NextResponse.json({ message: "Already seeded" });
    }

    const dummyUserId = new mongoose.Types.ObjectId();

    const mockHoardings = [
      {
        name: "Premium Hoarding - Master Plan Area",
        location: {
          address: "Master Plan Road, Near City Center",
          city: "Bhubaneswar",

          state: "Odisha",
        },
        dimensions: { width: 40, height: 20 },
        type: "Hoarding",
        lightingType: "Front Lit",
        pricePerMonth: 45000,
        minimumBookingAmount: 15000,
        images: ["https://questionofcities.org/wp-content/uploads/2023/01/How-Bhubaneswars-master-plan-was-overtaken-by-unsustainable-development-.png"],
        owner: dummyUserId,
        status: "approved",
        uniqueReach: 120500,
      },
      {
        name: "Central Gantry - Cuttack High Court Road",
        location: {
          address: "High Court Road, Collectorate Area",
          city: "Cuttack",

          state: "Odisha",
        },
        dimensions: { width: 60, height: 20 },
        type: "Gantry",
        lightingType: "Lit",
        pricePerMonth: 38000,
        minimumBookingAmount: 10000,
        images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTC8J2uvU4Nk1BnKOIAkDLvM0YJylnsCsaKvA&s"],
        owner: dummyUserId,
        status: "approved",
        uniqueReach: 85000,
      },
      {
        name: "Smart Unipole - Rourkela Steel City Square",
        location: {
          address: "Steel City Square, NIT Road",
          city: "Rourkela",

          state: "Odisha",
        },
        dimensions: { width: 20, height: 20 },
        type: "Unipole",
        lightingType: "Lit",
        pricePerMonth: 25000,
        minimumBookingAmount: 8000,
        images: ["https://assets.indiaonline.in/cg/Rourkela/City-Guide/rocker.jpg"],
        owner: dummyUserId,
        status: "approved",
        uniqueReach: 62000,
      }
    ];

    await Hoarding.insertMany(mockHoardings);
    return NextResponse.json({ message: "Seeded successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
