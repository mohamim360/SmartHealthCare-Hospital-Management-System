
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = React.useState<Theme>(() => {
        if (typeof window === 'undefined') return 'system'
        return (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system'
    })

    const resolved = React.useMemo<'light' | 'dark'>(() => {
        if (theme !== 'system') return theme
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }, [theme])

    React.useEffect(() => {
        const root = document.documentElement
        root.classList.toggle('dark', resolved === 'dark')
    }, [resolved])

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
