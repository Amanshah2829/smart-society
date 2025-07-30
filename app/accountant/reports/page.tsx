
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, BarChart as BarChartIcon, PieChart as PieChartIcon, LineChart as LineChartIcon, Loader2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { useToast } from "@/components/ui/use-toast"

export default function AccountantReportsPage() {
  const [reportType, setReportType] = useState("revenue_summary")
  const [timeRange, setTimeRange] = useState("monthly")
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)
  const { toast } = useToast()
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];


  const fetchReportData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/financial?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        toast({ variant: "destructive", title: "Failed to fetch report data" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error fetching report data" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [timeRange])

  const handleGenerateReport = () => {
    alert(`Generating ${timeRange} ${reportType} report... This is a placeholder for a PDF generation feature.`)
  }

  if (loading) {
    return (
      <DashboardLayout userRole="accountant" userName="Accountant">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="accountant" userName="Accountant">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Generate and view financial reports</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Generation</CardTitle>
            <CardDescription>Select the report type and time range to generate a report.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue_summary">Revenue Summary</SelectItem>
                <SelectItem value="expense_report">Expense Report</SelectItem>
                <SelectItem value="payment_status">Payment Status Report</SelectItem>
                <SelectItem value="tax_statement">Tax Statement</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerateReport}>
              <Download className="w-4 h-4 mr-2" />
              Generate & Download
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChartIcon className="w-5 h-5 mr-2" />
                Monthly Revenue
              </CardTitle>
              <CardDescription>Last 6 months revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={256}>
                <BarChart data={reportData?.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2" />
                Expense Categories
              </CardTitle>
              <CardDescription>Breakdown of expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={256}>
                <PieChart>
                  <Pie
                    data={reportData?.expenseByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="var(--color-primary)"
                    label
                  >
                     {reportData?.expenseByCategory.map((entry:any, index:number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                   <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChartIcon className="w-5 h-5 mr-2" />
              Revenue vs Expenses
            </CardTitle>
            <CardDescription>Last 6 months comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={256}>
              <LineChart data={reportData?.revenueVsExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" />
                <Line type="monotone" dataKey="expenses" stroke="var(--color-destructive)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
