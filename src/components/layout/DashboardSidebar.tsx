import { Link, useRouterState } from '@tanstack/react-router'
import {
    LayoutDashboard,
    Users,
    UserCheck,
    Stethoscope,
    Calendar,
    ClipboardList,
    FileText,
    Star,
    Settings,
    Heart,
    Home,
    CreditCard,
    type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SidebarItem {
    title: string
    href: string
    icon: LucideIcon
}

const adminNavItems: SidebarItem[] = [
    { title: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { title: 'Doctors', href: '/dashboard/admin/doctors-management', icon: Stethoscope },
    { title: 'Patients', href: '/dashboard/admin/patients-management', icon: Users },
    { title: 'Admins', href: '/dashboard/admin/admins-management', icon: UserCheck },
    { title: 'Appointments', href: '/dashboard/admin/appointments-management', icon: Calendar },
    { title: 'Schedules', href: '/dashboard/admin/schedules-management', icon: ClipboardList },
    { title: 'Payments', href: '/dashboard/admin/payments', icon: CreditCard },
]


const doctorNavItems: SidebarItem[] = [
    { title: 'Dashboard', href: '/dashboard/doctor', icon: LayoutDashboard },
    { title: 'Appointments', href: '/dashboard/doctor/appointments', icon: Calendar },
    { title: 'My Schedules', href: '/dashboard/doctor/my-schedules', icon: ClipboardList },
    { title: 'Prescriptions', href: '/dashboard/doctor/prescriptions', icon: FileText },
]

const patientNavItems: SidebarItem[] = [
    { title: 'Dashboard', href: '/dashboard/patient', icon: LayoutDashboard },
    { title: 'Book Appointment', href: '/dashboard/patient/book-appointment', icon: Calendar },
    { title: 'My Appointments', href: '/dashboard/patient/my-appointments', icon: ClipboardList },
    { title: 'Payment History', href: '/dashboard/patient/payment-history', icon: CreditCard },
    { title: 'My Prescriptions', href: '/dashboard/patient/my-prescriptions', icon: FileText },
    { title: 'Health Records', href: '/dashboard/patient/health-records', icon: Heart },
    { title: 'Reviews', href: '/dashboard/patient/reviews', icon: Star },
]

function getNavItems(role: string): SidebarItem[] {
    switch (role) {
        case 'SUPER_ADMIN':
        case 'ADMIN':
            return adminNavItems
        case 'DOCTOR':
            return doctorNavItems
        case 'PATIENT':
            return patientNavItems
        default:
            return []
    }
}

interface DashboardSidebarProps {
    role?: string
    className?: string
    onNavigate?: () => void
}

export function DashboardSidebar({ role = 'ADMIN', className, onNavigate }: DashboardSidebarProps) {
    const routerState = useRouterState()
    const currentPath = routerState.location.pathname
    const navItems = getNavItems(role)

    return (
        <aside
            data-slot="dashboard-sidebar"
            className={cn(
                'flex flex-col h-full bg-sidebar text-sidebar-foreground',
                className,
            )}
        >
            {/* Logo / Brand */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Heart className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-semibold tracking-tight">Smart Health</h2>
                    <p className="text-xs text-muted-foreground">Healthcare Portal</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Dashboard navigation">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/')
                        const Icon = item.icon
                        return (
                            <li key={item.href}>
                                <Button
                                    variant={isActive ? 'default' : 'ghost'}
                                    size="default"
                                    asChild
                                    className={cn(
                                        'w-full justify-start gap-3 font-medium',
                                        isActive
                                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                    )}
                                >
                                    <Link to={item.href} onClick={onNavigate}>
                                        <Icon className="w-4 h-4 shrink-0" />
                                        <span>{item.title}</span>
                                    </Link>
                                </Button>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="border-t border-sidebar-border px-3 py-4 space-y-1.5">
                <Button
                    variant="ghost"
                    size="default"
                    asChild
                    className={cn(
                        'w-full justify-start gap-3 font-medium transition-all duration-200',
                        currentPath === '/dashboard/settings'
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    )}
                >
                    <Link to="/dashboard/settings" onClick={onNavigate}>
                        <Settings className="w-4 h-4 shrink-0" />
                        <span>Settings</span>
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    size="default"
                    asChild
                    className="w-full justify-start gap-3 font-medium text-primary hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                    <Link to="/" onClick={onNavigate}>
                        <Home className="w-4 h-4 shrink-0" />
                        <span>Back to Home</span>
                    </Link>
                </Button>
            </div>
        </aside>
    )
}
