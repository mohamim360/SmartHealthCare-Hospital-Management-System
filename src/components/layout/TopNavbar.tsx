

import { Menu, LogOut, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { cn } from '@/lib/utils'

interface TopNavbarProps {
    userName?: string
    userAvatar?: string
    userRole?: string
    onMenuToggle?: () => void
    onLogout?: () => void
    className?: string
}

export function TopNavbar({
    userName = 'User',
    userAvatar,
    userRole,
    onMenuToggle,
    onLogout,
    className,
}: TopNavbarProps) {
    const initials = userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <header
            data-slot="top-navbar"
            className={cn(
                'sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 lg:px-6',
                className,
            )}
        >
            <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                onClick={onMenuToggle}
                aria-label="Toggle navigation menu"
            >
                <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1" />

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Notifications placeholder */}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Notifications"
                    className="relative"
                >
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                        3
                    </span>
                </Button>

                {/* Theme toggle — uses useTheme() internally */}
                <ThemeToggle />

                {/* User section */}
                <div className="flex items-center gap-3 ml-2 pl-2 border-l">
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        {userRole && (
                            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                                {userRole.toLowerCase().replace('_', ' ')}
                            </p>
                        )}
                    </div>
                    <button
                        className="relative rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none"
                        aria-label="User menu"
                    >
                        <Avatar className="h-8 w-8">
                            {userAvatar ? (
                                <AvatarImage src={userAvatar} alt={userName} />
                            ) : null}
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </button>

                    {/* Logout */}
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onLogout}
                        aria-label="Log out"
                        className="text-muted-foreground hover:text-destructive"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
