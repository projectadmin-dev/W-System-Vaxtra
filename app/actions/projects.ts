'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData) {
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

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string || 'planning'

  if (!name) {
    throw new Error('Project name is required')
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      tenant_id: profile.tenant_id,
      name,
      description,
      status,
      owner_id: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  redirect(`/projects/${data.id}`)
}

export async function updateProjectStatus(projectId: string, status: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('projects')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', projectId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  redirect('/projects')
}
