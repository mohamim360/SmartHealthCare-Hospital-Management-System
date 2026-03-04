
import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Heart, Menu, X, LayoutDashboard, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const navLinks = [
    { title: 'Home', href: '/' },
    { title: 'Consultation', href: '/consultation' },
]

function getDashboardPath(role?: string) {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return '/dashboard/admin'
    if (role === 'DOCTOR') return '/dashboard/doctor'
    return '/dashboard/patient'
}

export function PublicNavbar() {
    const [mobileOpen, setMobileOpen] = React.useState(false)
    const { user, loading, logout } = useAuth()
    const isLoggedIn = !loading && !!user

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
                {/* Brand */}
                <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Heart className="h-4 w-4" />
                    </div>
                    <span className="hidden sm:inline">Smart Health Care</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
                    {navLinks.map((link) => (
                        <Button key={link.href} variant="ghost" size="sm" asChild>
                            <Link to={link.href}>{link.title}</Link>
                        </Button>
                    ))}
                </nav>

                {/* Desktop right section */}
                <div className="hidden md:flex items-center gap-2">
                    <ThemeToggle />

                    {isLoggedIn ? (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to={getDashboardPath(user.role)}>
                                    <LayoutDashboard className="h-4 w-4 mr-1.5" />
                                    Dashboard
                                </Link>
                            </Button>
                            <div className="flex items-center gap-2 ml-1 pl-2 border-l">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <User className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-sm font-medium">{user.name}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={logout}
                                    aria-label="Log out"
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/login">Sign In</Link>
                            </Button>
                            <Button variant="default" size="sm" asChild>
                                <Link to="/register">Get Started</Link>
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile: theme toggle + hamburger */}
                <div className="flex md:hidden items-center gap-1">
                    <ThemeToggle />
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle navigation"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t bg-background animate-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col p-4 gap-1" aria-label="Mobile navigation">
                        {navLinks.map((link) => (
                            <Button
                                key={link.href}
                                variant="ghost"
                                className="justify-start"
                                asChild
                                onClick={() => setMobileOpen(false)}
                            >
                                <Link to={link.href}>{link.title}</Link>
                            </Button>
                        ))}
                        <hr className="my-2 border-border" />

                        {isLoggedIn ? (
                            <>
                                <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}>
                                    <Link to={getDashboardPath(user.role)}>
                                        <LayoutDashboard className="h-4 w-4 mr-2" />
                                        Dashboard
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="justify-start text-destructive hover:text-destructive"
                                    onClick={() => { setMobileOpen(false); logout() }}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Log Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" className="justify-start" asChild>
                                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                                        Sign In
                                    </Link>
                                </Button>
                                <Button variant="default" asChild>
                                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                                        Get Started
                                    </Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    )
}
