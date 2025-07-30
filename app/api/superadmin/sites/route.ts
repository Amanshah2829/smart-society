
import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { SiteModel } from "@/backend/models/Site";
import { UserModel } from "@/backend/models/User";
import { hashPassword } from "@/backend/lib/auth";


export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const sites = await SiteModel.find({}).sort({ createdAt: -1 });
        return NextResponse.json(sites, { status: 200 });
    } catch (error) {
        console.error("Super Admin Sites GET Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}


export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { 
        name, address, totalBlocks, floorsPerBlock, unitsPerFloor, 
        adminName, adminEmail, subscriptionTier, subscriptionFee, subscriptionEndDate 
    } = body;

    // 1. Check if admin email already exists
    const existingUser = await UserModel.findOne({ email: adminEmail });
    if (existingUser) {
        return NextResponse.json({ message: "An admin with this email already exists." }, { status: 409 });
    }

    // 2. Create the Site
    const newSite = new SiteModel({
        name,
        address,
        totalBlocks,
        floorsPerBlock,
        unitsPerFloor,
        adminName,
        adminEmail,
        subscription: {
            tier: subscriptionTier,
            startDate: new Date(),
            endDate: new Date(subscriptionEndDate),
            fee: subscriptionFee
        }
    });
    await newSite.save();

    // 3. Create the Admin User for that site
    const hashedPassword = await hashPassword(adminEmail + '123'); // Default password
    const newAdmin = new UserModel({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        siteId: newSite._id.toString(),
        phone: '0000000000' // Placeholder phone
    });
    await newAdmin.save();


    return NextResponse.json({ message: "Site and admin created successfully", site: newSite }, { status: 201 });

  } catch (error) {
    console.error("Super Admin Site POST Error:", error);
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

