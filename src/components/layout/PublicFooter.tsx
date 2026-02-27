

import { Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'

const footerLinks = {
    platform: [
        { title: 'Find Doctors', href: '/consultation' },
        { title: 'Book Appointment', href: '/register' },
        { title: 'Health Plans', href: '/health-plans' },
        { title: 'Diagnostics', href: '/diagnostics' },
    ],
    company: [
        { title: 'About Us', href: '/about' },
        { title: 'Contact', href: '/contact' },
        { title: 'Careers', href: '/careers' },
        { title: 'Blog', href: '/blog' },
    ],
    legal: [
        { title: 'Privacy Policy', href: '/privacy' },
        { title: 'Terms of Service', href: '/terms' },
        { title: 'Cookie Policy', href: '/cookies' },
    ],
}

export function PublicFooter() {
    return (
        <footer className="border-t bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                {/* Links grid */}
                <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 font-semibold text-lg mb-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Heart className="h-4 w-4" />
                            </div>
                            <span>Smart Health Care</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your trusted partner for modern healthcare solutions.
                            Find doctors, book appointments, and manage your health — all in one place.
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Platform</h3>
                        <ul className="space-y-2">
                            {footerLinks.platform.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Company</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Legal</h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t py-6 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Smart Health Care. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
