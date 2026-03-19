
import * as React from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
    theme: Theme
    resolved: 'light' | 'dark'
    setTheme: (theme: Theme) => void
    toggle: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'smarthealthcare-theme'

const isServer = typeof window === 'undefined'

function getStoredTheme(): Theme {
    if (isServer) return 'system'
    return (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system'
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
    if (theme !== 'system') return theme
    if (isServer) return 'light' // SSR default — the inline script handles the real value
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = React.useState<Theme>(getStoredTheme)
    const [resolved, setResolved] = React.useState<'light' | 'dark'>(() => resolveTheme(theme))

    // Re-resolve when theme changes (client-side only)
    React.useEffect(() => {
        setResolved(resolveTheme(theme))
    }, [theme])

    // Apply dark class to <html>
    React.useEffect(() => {
        const root = document.documentElement
        root.classList.toggle('dark', resolved === 'dark')
    }, [resolved])

    // Listen for system preference changes when theme === 'system'
    React.useEffect(() => {
        if (theme !== 'system') return
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = (e: MediaQueryListEvent) => setResolved(e.matches ? 'dark' : 'light')
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [theme])

    const setTheme = React.useCallback((t: Theme) => {
        setThemeState(t)
        localStorage.setItem(STORAGE_KEY, t)
    }, [])

    const toggle = React.useCallback(() => {
        setTheme(resolved === 'dark' ? 'light' : 'dark')
    }, [resolved, setTheme])

    return (
        <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme(): ThemeContextValue {
    const ctx = React.useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
    return ctx
}
