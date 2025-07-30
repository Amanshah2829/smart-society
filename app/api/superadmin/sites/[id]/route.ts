
import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { SiteModel } from "@/backend/models/Site";

// GET a single site
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const site = await SiteModel.findById(params.id);
        if (!site) {
            return NextResponse.json({ message: "Site not found" }, { status: 404 });
        }
        return NextResponse.json(site, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}


// UPDATE a site
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const body = await request.json();
        
        const { 
            name, address, totalBlocks, floorsPerBlock, unitsPerFloor, 
            adminName, subscriptionTier, subscriptionFee, subscriptionEndDate 
        } = body;

        const updateData = {
            name,
            address,
            totalBlocks,
            floorsPerBlock,
            unitsPerFloor,
            adminName,
            "subscription.tier": subscriptionTier,
            "subscription.fee": subscriptionFee,
            "subscription.endDate": new Date(subscriptionEndDate),
            updatedAt: new Date(),
        };

        const updatedSite = await SiteModel.findByIdAndUpdate(params.id, updateData, { new: true });
        
        if (!updatedSite) {
            return NextResponse.json({ message: "Site not found" }, { status: 404 });
        }
        return NextResponse.json(updatedSite, { status: 200 });
    } catch (error) {
        console.error("Super Admin Site PUT Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}


// DELETE a site
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const deletedSite = await SiteModel.findByIdAndDelete(params.id);
        if (!deletedSite) {
            return NextResponse.json({ message: "Site not found" }, { status: 404 });
        }
        // Note: In a real-world scenario, you would also need to handle deleting associated users, bills, etc.
        return NextResponse.json({ message: "Site deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Super Admin Site DELETE Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

