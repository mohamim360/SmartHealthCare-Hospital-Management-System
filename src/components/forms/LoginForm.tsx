

import { Heart, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormField, FormRoot } from './form-field'
import { useZodForm } from '@/hooks/useZodForm'
import { loginSchema, type TLoginForm } from '@/lib/validators'
import { Link } from '@tanstack/react-router'

interface LoginFormProps {
    onSubmit: (data: TLoginForm) => Promise<void>
    isLoading?: boolean
    error?: string | null
}

export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
    const form = useZodForm<TLoginForm>({
        schema: loginSchema,
        defaultValues: { email: '', password: '' },
    })

    const handleSubmit = form.handleSubmit(onSubmit)

    return (
        <div className="min-h-screen flex">
            {/* Left — Branding panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 flex-col items-center justify-center p-12 text-primary-foreground">
                <div className="flex items-center gap-3 mb-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                        <Heart className="h-8 w-8" />
                    </div>
                    <span className="text-3xl font-bold">Smart Health Care</span>
                </div>
                <p className="text-xl text-center opacity-90 max-w-xs">
                    Your trusted partner for modern, accessible healthcare management.
                </p>
                <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-sm">
                    {[
                        { label: 'Doctors', value: '500+' },
                        { label: 'Patients', value: '50k+' },
                        { label: 'Appointments', value: '1M+' },
                        { label: 'Rating', value: '4.9★' },
                    ].map((s) => (
                        <div key={s.label} className="text-center bg-white/10 rounded-xl p-4">
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-sm opacity-80">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right — Form panel */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-sm space-y-6">
                    {/* Back to Home */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Home
                    </Link>

                    {/* Mobile brand */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Heart className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">Smart Health Care</span>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                        <p className="text-muted-foreground mt-1">Sign in to your account</p>
                    </div>

                    <FormRoot onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}
                        <FormField
                            form={form}
                            name="email"
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            required
                        />
                        <FormField
                            form={form}
                            name="password"
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            required
                        />

                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary hover:underline underline-offset-4"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Signing in…
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </FormRoot>

                    <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="text-primary hover:underline underline-offset-4 font-medium">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
