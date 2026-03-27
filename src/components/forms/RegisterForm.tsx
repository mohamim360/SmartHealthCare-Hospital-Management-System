
import * as React from 'react'
import { Heart, Loader2, ArrowLeft, Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormField, FormRoot } from './form-field'
import { useZodForm } from '@/hooks/useZodForm'
import { registerPatientSchema, type TRegisterPatientForm } from '@/lib/validators'
import { Link } from '@tanstack/react-router'

interface RegisterFormProps {
    onSubmit: (data: TRegisterPatientForm, profilePhoto?: File) => Promise<void>
    isLoading?: boolean
    error?: string | null
}

export function RegisterForm({ onSubmit, isLoading = false, error }: RegisterFormProps) {
    const [profilePhoto, setProfilePhoto] = React.useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = React.useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const form = useZodForm<TRegisterPatientForm>({
        schema: registerPatientSchema,
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            contactNumber: '',
            address: '',
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setProfilePhoto(file)
            const reader = new FileReader()
            reader.onloadend = () => setPhotoPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const removePhoto = () => {
        setProfilePhoto(null)
        setPhotoPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = form.handleSubmit((data) => onSubmit(data, profilePhoto ?? undefined))

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
            <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
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
                        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
                        <p className="text-muted-foreground mt-1">Register as a patient to get started</p>
                    </div>

                    <FormRoot onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Profile Photo Upload */}
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="h-20 w-20 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden transition-colors group-hover:border-primary/50">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Profile preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Camera className="h-6 w-6 text-muted-foreground/50 group-hover:text-primary/70 transition-colors" />
                                    )}
                                </div>
                                {photoPreview && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            removePhoto()
                                        }}
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:bg-destructive/90"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Profile photo <span className="opacity-60">(optional)</span>
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        <FormField
                            form={form}
                            name="name"
                            label="Full Name"
                            placeholder="John Doe"
                            required
                        />
                        <FormField
                            form={form}
                            name="email"
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            required
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                form={form}
                                name="password"
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                required
                            />
                            <FormField
                                form={form}
                                name="confirmPassword"
                                label="Confirm"
                                type="password"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <FormField
                            form={form}
                            name="contactNumber"
                            label="Contact Number"
                            placeholder="+880 1234-567890"
                        />
                        <FormField
                            form={form}
                            name="address"
                            label="Address"
                            placeholder="123 Main St, Dhaka"
                        />

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating Account…
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </FormRoot>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline underline-offset-4 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
