/**
 * DeleteConfirmationDialog — Reusable modal for destructive action confirmation.
 */

import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'

interface DeleteConfirmationDialogProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    description?: string
    isLoading?: boolean
}

export function DeleteConfirmationDialog({
    open,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    description = 'This action cannot be undone. This will permanently delete the selected item.',
    isLoading = false,
}: DeleteConfirmationDialogProps) {
    if (!open) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50"
                onClick={onClose}
                aria-hidden="true"
            />
            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <div>
                                <CardTitle>{title}</CardTitle>
                                <CardDescription className="mt-1">{description}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent />
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}
