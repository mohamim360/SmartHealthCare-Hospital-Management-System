import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({
    className,
    ...props
}: React.ComponentProps<'textarea'>) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors',
                'placeholder:text-muted-foreground',
                'hover:border-ring/50',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
                className,
            )}
            {...props}
        />
    )
}

export { Textarea }
