import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">W System v2</h1>
          <p className="text-muted-foreground text-lg">
            Multi-tenant project management powered by Supabase
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="default" className="bg-blue-500">✅</Badge>
                Supabase Connected
              </CardTitle>
              <CardDescription>Database & Authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <strong>Project:</strong> raelymffiajrtgbcxqse
              </p>
              <p className="text-sm">
                <strong>Region:</strong> Singapore (ap-southeast-1)
              </p>
              <p className="text-sm">
                <strong>Tables:</strong> tenants, users, projects, tasks, comments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-500 text-white">✅</Badge>
                Database Ready
              </CardTitle>
              <CardDescription>Schema & Security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <strong>RLS:</strong> Tenant isolation + role-based access
              </p>
              <p className="text-sm">
                <strong>Triggers:</strong> Auto-update timestamps + auto-create users
              </p>
              <p className="text-sm">
                <strong>Types:</strong> 433 lines (auto-generated)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="border-purple-500 text-purple-500">✅</Badge>
                Next.js 16
              </CardTitle>
              <CardDescription>Frontend Stack</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <strong>Framework:</strong> Next.js 16.0.0 (Turbopack)
              </p>
              <p className="text-sm">
                <strong>React:</strong> 19.2.5
              </p>
              <p className="text-sm">
                <strong>UI:</strong> shadcn/ui (14 components)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="border-orange-500 text-orange-500">✅</Badge>
                GitHub Synced
              </CardTitle>
              <CardDescription>Version Control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <strong>Repo:</strong> projectadmin-dev/W-System-Vaxtra
              </p>
              <p className="text-sm">
                <strong>Branch:</strong> main
              </p>
              <p className="text-sm">
                <strong>Commits:</strong> 7 commits
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 justify-center">
          <Button size="lg">Get Started</Button>
          <Button variant="outline" size="lg">View Documentation</Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Next steps: Authentication → Kanban Board → Deploy</p>
        </div>
      </div>
    </div>
  )
}
