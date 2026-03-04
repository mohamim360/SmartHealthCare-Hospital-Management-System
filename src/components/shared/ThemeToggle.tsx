import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme'

interface ThemeToggleProps {
    className?: string
    /** Render as icon-only (default) or with label */
    showLabel?: boolean
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
    const { resolved, toggle } = useTheme()

    return (
        <Button
            variant="ghost"
            size={showLabel ? 'sm' : 'icon-sm'}
            onClick={toggle}
            className={className}
            aria-label={`Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode`}
        >
            {resolved === 'dark' ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
            {showLabel && (
                <span className="ml-2">{resolved === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            )}
        </Button>
    )
}
