
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function HealthcarePage() {
  return (
    <DashboardLayout userRole="resident" userName="John Resident">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Healthcare</h1>
          <p className="text-gray-600 dark:text-gray-400">Access health resources and information for our community.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>This feature is under construction.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>We are currently setting up the healthcare section. You will soon find information about health camps, emergency contacts, and wellness tips.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
