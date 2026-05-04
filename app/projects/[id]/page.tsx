import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import KanbanBoard from './kanban-board'
import { createTask } from '@/app/actions/tasks'

const statusColors: Record<string, string> = {
  planning: 'bg-gray-500',
  active: 'bg-blue-500',
  on_hold: 'bg-yellow-500',
  done: 'bg-green-500',
  archived: 'bg-gray-400',
}

export default async function ProjectDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id: projectId } = await params
  const supabase = await createClient()
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get project
  const { data: project } = await supabase
    .from('projects')
    .select('*, owner:users(full_name)')
    .eq('id', projectId)
    .single()

  if (!project) {
    redirect('/projects')
  }

  // Get tasks for this project
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  // Get team members
  const { data: teamMembers } = await supabase
    .from('users')
    .select('id, full_name, email')
    .eq('tenant_id', project.tenant_id)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" size="sm">← Back</Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <Badge className={statusColors[project.status] || 'bg-gray-500'}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Owner: {project.owner?.full_name || 'Unknown'}
              </p>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button>Create Task</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form action={createTask}>
                <input type="hidden" name="projectId" value={projectId} />
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task to this project.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input id="title" name="title" placeholder="Task title" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      placeholder="Describe the task..." 
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="priority">Priority</Label>
                      <select 
                        id="priority" 
                        name="priority" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        defaultValue="medium"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <select 
                        id="status" 
                        name="status" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        defaultValue="todo"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="assigneeId">Assignee (Optional)</Label>
                    <select 
                      id="assigneeId" 
                      name="assigneeId" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers?.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.full_name || member.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Due Date (Optional)</Label>
                    <Input id="dueDate" name="dueDate" type="date" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Task</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="container mx-auto px-4 py-8">
        {project.description && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
        )}
        
        <div className="h-[calc(100vh-280px)]">
          <KanbanBoard tasks={tasks || []} />
        </div>
      </main>
    </div>
  )
}
