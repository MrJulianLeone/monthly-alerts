import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowLeft, FileText, Trash2 } from "lucide-react"
import Link from "next/link"
import UploadSampleReportForm from "./upload-sample-report-form"
import { getCurrentSampleReport, deleteSampleReport } from "@/app/actions/sample-report"

const sql = neon(process.env.DATABASE_URL!)

async function isAdmin(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM admin_users WHERE user_id = ${userId}::uuid
  `
  return result.length > 0
}

export default async function UploadSampleReportPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const adminCheck = await isAdmin(session.user_id)
  if (!adminCheck) redirect("/dashboard")

  // Fetch current sample report
  const sampleReport = await getCurrentSampleReport()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">MonthlyAlerts.com</span>
          </Link>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Upload Sample MonthlyAlert</h1>
            <p className="text-muted-foreground">
              Upload a PDF sample report that will be shown on the homepage. This will replace any existing sample report.
            </p>
          </div>

          {/* Current Sample Report Display */}
          {sampleReport && (
            <Card className="p-6 mb-6 bg-accent/5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1">Current Sample MonthlyAlert</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Uploaded {new Date(sampleReport.uploaded_at).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href={sampleReport.file_path} target="_blank">
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View PDF
                      </Button>
                    </Link>
                    <form action={async () => {
                      "use server"
                      await deleteSampleReport(sampleReport.id)
                      redirect("/admin/upload-sample-report")
                    }}>
                      <Button size="sm" variant="destructive" type="submit">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Report
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <UploadSampleReportForm />
          </Card>
        </div>
      </div>
    </div>
  )
}

