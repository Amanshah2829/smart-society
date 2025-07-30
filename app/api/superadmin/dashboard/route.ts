
import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { SiteModel } from "@/backend/models/Site";
import { UserModel } from "@/backend/models/User";
import { ComplaintModel } from "@/backend/models/Complaint";
import { MaintenanceBillModel } from "@/backend/models/MaintenanceBill";

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const sites = await SiteModel.find({}).lean();
        
        const siteStats = await Promise.all(sites.map(async (site) => {
            const totalResidents = await UserModel.countDocuments({ siteId: site._id, role: 'resident' });
            const openComplaints = await ComplaintModel.countDocuments({ siteId: site._id, status: { $in: ['open', 'in-progress'] }});
            
            const totalBills = await MaintenanceBillModel.countDocuments({ siteId: site._id });
            const paidBills = await MaintenanceBillModel.countDocuments({ siteId: site._id, status: 'paid' });
            const collectionRate = totalBills > 0 ? Math.round((paidBills / totalBills) * 100) : 100;
            
            // Dummy performance score
            const performance = Math.floor(Math.random() * (95 - 45 + 1)) + 45;

            return {
                ...site,
                totalResidents,
                openComplaints,
                collectionRate,
                performance,
            }
        }));
        
        const totalSites = sites.length;
        const totalResidents = siteStats.reduce((acc, site) => acc + site.totalResidents, 0);
        // Placeholder for revenue calculation
        const totalRevenue = sites.reduce((acc, site) => acc + (site.subscription.fee || 0), 0);
        
        return NextResponse.json({
            totalSites,
            totalResidents,
            totalRevenue,
            sites: siteStats,
        });

    } catch (error) {
        console.error("Super Admin Dashboard Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
