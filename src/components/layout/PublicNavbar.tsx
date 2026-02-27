
import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Heart, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
    { title: 'Home', href: '/' },
    { title: 'Consultation', href: '/consultation' },
    { title: 'Services', href: '/services' },
    { title: 'About', href: '/about' },
]

export function PublicNavbar() {
    const [mobileOpen, setMobileOpen] = React.useState(false)

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

                {/* Desktop auth buttons */}
                <div className="hidden md:flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/login">Sign In</Link>
                    </Button>
                    <Button variant="default" size="sm" asChild>
                        <Link to="/register">Get Started</Link>
                    </Button>
                </div>

                {/* Mobile hamburger */}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="md:hidden"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle navigation"
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
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
                    </nav>
                </div>
            )}
        </header>
    )
}
