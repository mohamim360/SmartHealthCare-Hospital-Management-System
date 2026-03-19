import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&>svg]:pointer-events-none [&>svg:not([class*='size-'])]:size-4 [&>svg]:shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none cursor-pointer",
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/80',
                destructive:
                    'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-destructive/50',
                outline:
                    'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
                secondary:
                    'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70',
                ghost:
                    'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
                link: 'text-primary underline-offset-4 hover:underline',
                accent:
                    'bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 active:bg-accent/80',
                success:
                    'bg-success text-success-foreground shadow-sm hover:bg-success/90 active:bg-success/80',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-8 rounded-md px-3 text-xs',
                lg: 'h-12 rounded-lg px-6 text-base',
                xl: 'h-14 rounded-xl px-8 text-lg',
                icon: 'h-10 w-10',
                'icon-sm': 'h-8 w-8',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
)

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean
    }) {
    const Comp = asChild ? Slot : 'button'

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    )
}

export { Button, buttonVariants }
