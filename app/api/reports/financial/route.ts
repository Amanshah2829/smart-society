
import { NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import { MaintenanceBillModel } from "@/backend/models/MaintenanceBill";
import { LedgerEntryModel } from "@/backend/models/LedgerEntry";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "monthly"; // For now, we'll just use a fixed range

    // --- Revenue Chart ---
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const result = await MaintenanceBillModel.aggregate([
        {
          $match: {
            status: "paid",
            paymentDate: { $gte: start, $lte: end },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      monthlyRevenue.push({
        name: format(date, "MMM"),
        revenue: result.length > 0 ? result[0].total : 0,
      });
    }
    
    // --- Expense Chart ---
    const expenseByCategory = await LedgerEntryModel.aggregate([
        { $match: { type: 'debit' } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    // --- Revenue vs Expenses ---
     const revenueVsExpenses = [];
     for (let i = 5; i >= 0; i--) {
       const date = subMonths(new Date(), i);
       const start = startOfMonth(date);
       const end = endOfMonth(date);

       const revenueResult = await MaintenanceBillModel.aggregate([
         { $match: { status: "paid", paymentDate: { $gte: start, $lte: end } } },
         { $group: { _id: null, total: { $sum: "$amount" } } },
       ]);
       const expenseResult = await LedgerEntryModel.aggregate([
            { $match: { type: 'debit', date: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
       ])

       revenueVsExpenses.push({
         name: format(date, "MMM"),
         revenue: revenueResult.length > 0 ? revenueResult[0].total : 0,
         expenses: expenseResult.length > 0 ? expenseResult[0].total : 0,
       });
     }


    return NextResponse.json({
      monthlyRevenue,
      expenseByCategory: expenseByCategory.map(e => ({ name: e._id, value: e.total })),
      revenueVsExpenses,
    });
  } catch (error) {
    console.error("Financial report error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
