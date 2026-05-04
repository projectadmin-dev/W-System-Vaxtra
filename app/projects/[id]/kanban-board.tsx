'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { updateTaskStatus } from '@/app/actions/tasks'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  assignee_id: string | null
  created_at: string
  due_date: string | null
}

interface ColumnProps {
  title: string
  status: string
  tasks: Task[]
  color: string
}

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

function Column({ title, status, tasks, color }: ColumnProps) {
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null)

  const handleMove = async (taskId: string, newStatus: string) => {
    setMovingTaskId(taskId)
    try {
      await updateTaskStatus(taskId, newStatus)
    } catch (error) {
      console.error('Failed to move task:', error)
    } finally {
      setMovingTaskId(null)
    }
  }

  const getNextStatus = (currentStatus: string): string | null => {
    const flow = ['todo', 'in_progress', 'review', 'done']
    const idx = flow.indexOf(currentStatus)
    return idx < flow.length - 1 ? flow[idx + 1] : null
  }

  const getPrevStatus = (currentStatus: string): string | null => {
    const flow = ['todo', 'in_progress', 'review', 'done']
    const idx = flow.indexOf(currentStatus)
    return idx > 0 ? flow[idx - 1] : null
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Badge variant="outline" className={color}>
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2">
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {tasks.map((task) => {
              const nextStatus = getNextStatus(task.status)
              const prevStatus = getPrevStatus(task.status)
              const isMoving = movingTaskId === task.id

              return (
                <Card key={task.id} className={isMoving ? 'opacity-50' : ''}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium leading-none">{task.title}</h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${priorityColors[task.priority] || 'bg-gray-100'}`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {task.due_date && (
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}

                    <div className="flex gap-1 pt-2">
                      {prevStatus && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2"
                          onClick={() => handleMove(task.id, prevStatus)}
                          disabled={isMoving}
                        >
                          ← Back
                        </Button>
                      )}
                      {nextStatus && (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-6 text-xs px-2"
                          onClick={() => handleMove(task.id, nextStatus)}
                          disabled={isMoving}
                        >
                          Next →
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default function KanbanBoard({ tasks }: { tasks: Task[] }) {
  const columns = [
    { 
      title: '📋 To Do', 
      status: 'todo', 
      tasks: tasks.filter(t => t.status === 'todo'),
      color: 'bg-gray-100 text-gray-800'
    },
    { 
      title: '🔄 In Progress', 
      status: 'in_progress', 
      tasks: tasks.filter(t => t.status === 'in_progress'),
      color: 'bg-blue-100 text-blue-800'
    },
    { 
      title: '👀 Review', 
      status: 'review', 
      tasks: tasks.filter(t => t.status === 'review'),
      color: 'bg-yellow-100 text-yellow-800'
    },
    { 
      title: '✅ Done', 
      status: 'done', 
      tasks: tasks.filter(t => t.status === 'done'),
      color: 'bg-green-100 text-green-800'
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
      {columns.map((col) => (
        <Column key={col.status} {...col} />
      ))}
    </div>
  )
}
