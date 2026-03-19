import * as React from 'react'

import { cn } from '@/lib/utils'

function Avatar({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="avatar"
            className={cn(
                'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
                className,
            )}
            {...props}
        />
    )
}

function AvatarImage({
    className,
    src,
    alt = '',
    ...props
}: React.ComponentProps<'img'>) {
    return (
        <img
            data-slot="avatar-image"
            src={src}
            alt={alt}
            className={cn('aspect-square h-full w-full object-cover', className)}
            {...props}
        />
    )
}

function AvatarFallback({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="avatar-fallback"
            className={cn(
                'flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground',
                className,
            )}
            {...props}
        />
    )
}

export { Avatar, AvatarImage, AvatarFallback }
