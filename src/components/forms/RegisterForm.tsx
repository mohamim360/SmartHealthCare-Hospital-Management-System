
import * as React from 'react'
import { Heart, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormField, FormRoot } from './form-field'
import { useZodForm } from '@/hooks/useZodForm'
import { registerPatientSchema, type TRegisterPatientForm } from '@/lib/validators'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

type Step = 'account' | 'profile' | 'confirm'
const STEPS: Step[] = ['account', 'profile', 'confirm']
const STEP_LABELS: Record<Step, string> = {
    account: 'Account',
    profile: 'Profile',
    confirm: 'Confirm',
}

interface RegisterFormProps {
    onSubmit: (data: TRegisterPatientForm) => Promise<void>
    isLoading?: boolean
}

export function RegisterForm({ onSubmit, isLoading = false }: RegisterFormProps) {
    const [step, setStep] = React.useState<Step>('account')
    const stepIndex = STEPS.indexOf(step)

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
        mode: 'onBlur',
    })

    const handleSubmit = form.handleSubmit(onSubmit)

    const nextStep = async () => {
        const accountFields: Array<keyof TRegisterPatientForm> = ['name', 'email', 'password', 'confirmPassword']
        const profileFields: Array<keyof TRegisterPatientForm> = ['contactNumber', 'address']

        const fieldsToValidate = step === 'account' ? accountFields : profileFields
        const valid = await form.trigger(fieldsToValidate)
        if (valid && stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1])
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-start bg-muted/20 py-12 px-4">
            <div className="w-full max-w-lg">
                {/* Brand */}
                <div className="flex items-center gap-2 mb-8 justify-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <Heart className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold">Smart Health Care</span>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s}>
                            <div className="flex flex-col items-center gap-1">
                                <div
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                                        i < stepIndex
                                            ? 'bg-primary text-primary-foreground'
                                            : i === stepIndex
                                                ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                                                : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {i < stepIndex ? <CheckCircle className="h-4 w-4" /> : i + 1}
                                </div>
                                <span className="text-xs text-muted-foreground">{STEP_LABELS[s]}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div
                                    className={cn(
                                        'flex-1 h-0.5 mt-[-14px] transition-colors max-w-12',
                                        i < stepIndex ? 'bg-primary' : 'bg-border',
                                    )}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-card rounded-2xl border shadow-sm p-8 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
                        <p className="text-muted-foreground mt-1">
                            {step === 'account' && 'Set up your login credentials.'}
                            {step === 'profile' && 'Add your contact details.'}
                            {step === 'confirm' && 'Review and submit your registration.'}
                        </p>
                    </div>

                    <FormRoot onSubmit={handleSubmit}>
                        {step === 'account' && (
                            <div className="space-y-4">
                                <FormField form={form} name="name" label="Full Name" placeholder="Dr. Jane Smith" required />
                                <FormField form={form} name="email" label="Email" type="email" placeholder="jane@example.com" required />
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField form={form} name="password" label="Password" type="password" placeholder="••••••••" required />
                                    <FormField form={form} name="confirmPassword" label="Confirm Password" type="password" placeholder="••••••••" required />
                                </div>
                            </div>
                        )}
                        {step === 'profile' && (
                            <div className="space-y-4">
                                <FormField form={form} name="contactNumber" label="Contact Number" placeholder="+880 1234-567890" required />
                                <FormField form={form} name="address" label="Address" placeholder="123 Main St, Dhaka" />
                            </div>
                        )}

                        {step === 'confirm' && (
                            <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                                <p><span className="font-medium">Name:</span> {form.getValues('name')}</p>
                                <p><span className="font-medium">Email:</span> {form.getValues('email')}</p>
                                <p><span className="font-medium">Phone:</span> {form.getValues('contactNumber')}</p>
                                <p><span className="font-medium">Address:</span> {form.getValues('address') || 'Not provided'}</p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            {stepIndex > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setStep(STEPS[stepIndex - 1])}
                                >
                                    Back
                                </Button>
                            )}
                            {step !== 'confirm' ? (
                                <Button type="button" className="flex-1" onClick={nextStep}>
                                    Continue
                                </Button>
                            ) : (
                                <Button type="submit" className="flex-1" disabled={isLoading}>
                                    {isLoading ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Creating Account…</>
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>
                            )}
                        </div>
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
