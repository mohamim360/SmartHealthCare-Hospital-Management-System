import { Toaster as SonnerToaster } from 'sonner'
import { useTheme } from '@/lib/theme'

export function Toaster() {
    let resolved: 'light' | 'dark' = 'light'
    try {
        const theme = useTheme()
        resolved = theme.resolved
    } catch {
        // During SSR or outside ThemeProvider, default to light
    }

    return (
        <SonnerToaster
            theme={resolved}
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    fontFamily: 'var(--font-body)',
                },
                classNames: {
                    toast: 'group border-border bg-card text-card-foreground shadow-lg',
                    title: 'text-card-foreground font-semibold',
                    description: 'text-muted-foreground',
                    actionButton: 'bg-primary text-primary-foreground',
                    cancelButton: 'bg-muted text-muted-foreground',
                    error: 'border-destructive/30 bg-destructive/10 text-destructive',
                    success: 'border-success/30 bg-success/10 text-success',
                    warning: 'border-warning/30 bg-warning/10 text-warning-foreground',
                    info: 'border-info/30 bg-info/10 text-info',
                },
            }}
            richColors
            closeButton
        />
    )
}
