
import * as React from 'react'
import { cn } from '@/lib/utils'
import { DashboardSidebar } from './DashboardSidebar'
import { TopNavbar } from './TopNavbar'

interface AppShellProps {
    children: React.ReactNode
    role?: string
    userName?: string
    userAvatar?: string
    onLogout?: () => void
}

export function AppShell({
    children,
    role = 'ADMIN',
    userName,
    userAvatar,
    onLogout,
}: AppShellProps) {
    const [sidebarOpen, setSidebarOpen] = React.useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0 border-r">
                <DashboardSidebar role={role} className="w-64" />
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                    {/* Sidebar panel */}
                    <div
                        className={cn(
                            'fixed inset-y-0 left-0 z-50 w-64 lg:hidden',
                            'animate-in slide-in-from-left duration-300',
                        )}
                    >
                        <DashboardSidebar
                            role={role}
                            className="h-full shadow-xl"
                            onNavigate={() => setSidebarOpen(false)}
                        />
                    </div>
                </>
            )}

            {/* Main content area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <TopNavbar
                    userName={userName}
                    userAvatar={userAvatar}
                    userRole={role}
                    onLogout={onLogout}
                    onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                />

                <main
                    className="flex-1 overflow-y-auto p-4 lg:p-6"
                    id="main-content"
                >
                    {children}
                </main>
            </div>
        </div>
    )
}
