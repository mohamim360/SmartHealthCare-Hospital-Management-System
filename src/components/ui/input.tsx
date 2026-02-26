import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({
    className,
    type,
    ...props
}: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors',
                'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
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

export { Input }
