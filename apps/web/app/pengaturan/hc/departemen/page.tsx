'use client'

import { useState, useEffect } from 'react'
import { SidebarProvider, SidebarInset } from '@workspace/ui/components/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { Badge } from '@workspace/ui/components/badge'
import { Switch } from '@workspace/ui/components/switch'
import { Building2, Plus, Pencil, Trash2, Search } from 'lucide-react'

interface Department {
  id: string
  tenant_id: string
  entity_id: string
  branch_id: string | null
  parent_id: string | null
  name: string
  code: string
  description: string | null
  head_user_id: string | null
  is_active: boolean
  level: number
  created_at: string
  updated_at: string
}

export default function DepartemenPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Department | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    parent_id: '',
    level: 1,
    is_active: true,
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  async function fetchDepartments() {
    try {
      const res = await fetch('/api/hc/departemen')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setDepartments(data)
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingItem(null)
    setFormData({
      name: '',
      code: '',
      description: '',
      parent_id: '',
      level: 1,
      is_active: true,
    })
    setDialogOpen(true)
  }

  function openEditDialog(department: Department) {
    setEditingItem(department)
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || '',
      parent_id: department.parent_id || '',
      level: department.level,
      is_active: department.is_active,
    })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    try {
      const url = editingItem ? `/api/hc/departemen?id=${editingItem.id}` : '/api/hc/departemen'
      const method = editingItem ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          level: parseInt(formData.level.toString()),
        }),
      })
      
      if (!res.ok) throw new Error('Failed to save')
      
      await fetchDepartments()
      setDialogOpen(false)
    } catch (error) {
      console.error('Error saving department:', error)
      alert('Gagal menyimpan departemen')
    }
  }

  async function handleDelete(department: Department) {
    if (!confirm(`Hapus departemen "${department.name}"?`)) return
    
    try {
      const res = await fetch(`/api/hc/departemen?id=${department.id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Failed to delete')
      
      await fetchDepartments()
    } catch (error) {
      console.error('Error deleting department:', error)
      alert('Gagal menghapus departemen')
    }
  }

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <div className="flex items-center justify-end">
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Departemen
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari departemen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Departemen</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-mono text-sm">{dept.code}</TableCell>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Level {dept.level}</Badge>
                      </TableCell>
                      <TableCell>
                        {dept.is_active ? (
                          <Badge variant="default">Aktif</Badge>
                        ) : (
                          <Badge variant="secondary">Nonaktif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(dept)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(dept)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredDepartments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Belum ada departemen</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Departemen' : 'Tambah Departemen'}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Update informasi departemen'
                : 'Tambah departemen baru ke organisasi'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Kode Departemen</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Contoh: DEPT-IT"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nama Departemen</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Teknologi Informasi"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi departemen"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="parent_id">Departemen Induk</Label>
                <Input
                  id="parent_id"
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  placeholder="Optional"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  type="number"
                  min="1"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Aktif</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              {editingItem ? 'Update' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
