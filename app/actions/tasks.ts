'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  
  // Get user to get tenant_id
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) {
    throw new Error('User has no tenant')
  }

  const projectId = formData.get('projectId') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string || 'todo'
  const priority = formData.get('priority') as string || 'medium'
  const assigneeId = formData.get('assigneeId') as string | null
  const dueDate = formData.get('dueDate') as string | null

  if (!projectId || !title) {
    throw new Error('Project ID and title are required')
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      tenant_id: profile.tenant_id,
      project_id: projectId,
      title,
      description,
      status,
      priority,
      assignee_id: assigneeId || null,
      reporter_id: user.id,
      due_date: dueDate || null,
      position: 0,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .update({ 
      status,
      completed_at: status === 'done' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId)

  if (error) {
    throw new Error(error.message)
  }

  // Get project_id for revalidation
  const { data: task } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('id', taskId)
    .single()

  if (task?.project_id) {
    revalidatePath(`/projects/${task.project_id}`)
  }
}

export async function updateTaskPosition(taskId: string, position: number) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .update({ 
      position,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function deleteTask(taskId: string, projectId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/projects/${projectId}`)
}
