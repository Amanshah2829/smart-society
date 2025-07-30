
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function EconomicHubPage() {
  return (
    <DashboardLayout userRole="resident" userName="John Resident">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Economic Hub</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover local economic opportunities and services.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>This feature is under construction.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>We are developing a platform to connect local businesses and services with residents. Stay tuned!</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
