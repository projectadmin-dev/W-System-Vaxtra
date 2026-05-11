"use client"

import { useState, useEffect, useCallback } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { NavUser } from "@/components/nav-user"
import { UserTable, type User } from "@/components/user-table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { toast } from "sonner"

const profile = {
  user: {
    name: "User",
    email: "user@wit.id",
    avatar: "/avatars/user.jpg",
  },
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [filters, setFilters] = useState({
    search: "",
    role_id: "",
    is_active: undefined as boolean | undefined,
  })

  // Sync page state into URL search params
  useEffect(() => {
    const params = new URLSearchParams()
    if (pagination.pageIndex > 0) params.set('page', (pagination.pageIndex + 1).toString())
    if (pagination.pageSize !== 10) params.set('limit', pagination.pageSize.toString())
    if (filters.search) params.set('search', filters.search)
    if (filters.role_id) params.set('role_id', filters.role_id)
    if (filters.is_active !== undefined) params.set('is_active', filters.is_active.toString())

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    window.history.replaceState(null, '', newUrl)
  }, [pagination, filters])

  // Read initial state from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const page = parseInt(params.get('page') || '1', 10)
    const limit = parseInt(params.get('limit') || '10', 10)
    setPagination(prev => ({
      pageIndex: Math.max(0, page - 1),
      pageSize: limit,
    }))
    setFilters({
      search: params.get('search') || '',
      role_id: params.get('role_id') || '',
      is_active: params.has('is_active') ? params.get('is_active') === 'true' : undefined,
    })
  }, [])

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        limit: pagination.pageSize.toString(),
        offset: (pagination.pageIndex * pagination.pageSize).toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.role_id && { role_id: filters.role_id }),
        ...(filters.is_active !== undefined && { is_active: filters.is_active.toString() }),
      })

      const response = await fetch(`/api/users?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const result = await response.json()
      setUsers(result.data || [])
      setTotal(result.pagination?.total || 0)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [pagination, filters])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 w-full bg-white dark:bg-zinc-800 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 px-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>User Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            <NavUser user={profile.user} />
          </div>
        </header>

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              
              {/* User Table */}
              <UserTable 
                users={users}
                total={total}
                isLoading={isLoading}
                onRefresh={fetchUsers}
                pagination={pagination}
                onPaginationChange={setPagination}
                filters={filters}
                onFiltersChange={setFilters}
              />

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
