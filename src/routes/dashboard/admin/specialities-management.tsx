

import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { DeleteConfirmationDialog } from '@/components/shared/DeleteConfirmationDialog'

export const Route = createFileRoute('/dashboard/admin/specialities-management')({
  component: SpecialitiesManagementPage,
})

const mockSpecialities = [
  { id: '1', title: 'Cardiology', doctorCount: 5 },
  { id: '2', title: 'Neurology', doctorCount: 3 },
  { id: '3', title: 'Dermatology', doctorCount: 7 },
  { id: '4', title: 'Orthopedics', doctorCount: 4 },
  { id: '5', title: 'Pediatrics', doctorCount: 6 },
]

function SpecialitiesManagementPage() {
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Specialities Management</h1>
          <p className="text-muted-foreground">{mockSpecialities.length} specialities</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add Speciality
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Speciality</TableHead>
                <TableHead>Doctors</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSpecialities.map((spec, i) => (
                <TableRow key={spec.id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{spec.title}</TableCell>
                  <TableCell>{spec.doctorCount} doctors</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" aria-label="Edit speciality">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(spec.id)}
                        aria-label="Delete speciality"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => setDeleteId(null)}
        title="Delete Speciality"
        description="This will remove the speciality. Existing doctors will no longer be associated with it."
      />
    </div>
  )
}
