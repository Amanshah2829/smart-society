
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function EnvironmentPage() {
  return (
    <DashboardLayout userRole="resident" userName="John Resident">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Environment Initiatives</h1>
          <p className="text-gray-600 dark:text-gray-400">Participate in and track our society's green initiatives.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>This feature is under construction.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Information about waste management, recycling programs, and tree plantation drives will be available here soon.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
