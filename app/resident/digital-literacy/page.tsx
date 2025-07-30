
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function DigitalLiteracyPage() {
  return (
    <DashboardLayout userRole="resident" userName="John Resident">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Digital Literacy</h1>
          <p className="text-gray-600 dark:text-gray-400">Enhance your digital skills with our resources and workshops.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>This feature is under construction.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>We're building a comprehensive digital literacy program. Please check back later for updates.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
