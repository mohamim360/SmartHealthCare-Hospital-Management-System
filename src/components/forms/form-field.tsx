
import * as React from 'react'
import {
    type FieldValues,
    type Path,
    type UseFormReturn,
    Controller,
} from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'


// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FormFieldProps<T extends FieldValues, TContext = any, TTransformedValues extends FieldValues = T> {
    form: UseFormReturn<T, TContext, TTransformedValues>
    name: Path<T>
    label?: string
    description?: string
    required?: boolean
    className?: string
    type?: React.InputHTMLAttributes<HTMLInputElement>['type']
    placeholder?: string
    disabled?: boolean
}

export function FormField<T extends FieldValues>({
    form,
    name,
    label,
    description,
    required,
    className,
    type = 'text',
    placeholder,
    disabled,
}: FormFieldProps<T>) {
    const id = React.useId()
    const descId = description ? `${id}-desc` : undefined
    const errId = `${id}-err`

    return (
        <Controller
            control={form.control}
            name={name}
            render={({ field, fieldState }) => (
                <div className={cn('flex flex-col gap-1.5', className)}>
                    {label && (
                        <Label htmlFor={id}>
                            {label}
                            {required && <span className="text-destructive ml-0.5">*</span>}
                        </Label>
                    )}
                    {description && (
                        <p id={descId} className="text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                    <Input
                        id={id}
                        type={type}
                        placeholder={placeholder}
                        disabled={disabled}
                        aria-describedby={
                            [descId, fieldState.error ? errId : undefined]
                                .filter(Boolean)
                                .join(' ') || undefined
                        }
                        aria-invalid={!!fieldState.error}
                        {...field}
                        value={field.value ?? ''}
                    />
                    {fieldState.error && (
                        <p id={errId} className="text-xs text-destructive flex items-center gap-1" role="alert">
                            {fieldState.error.message}
                        </p>
                    )}
                </div>
            )}
        />
    )
}

//TextareaField

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TextareaFieldProps<T extends FieldValues, TContext = any, TTransformedValues extends FieldValues = T> {
    form: UseFormReturn<T, TContext, TTransformedValues>
    name: Path<T>
    label?: string
    description?: string
    required?: boolean
    className?: string
    placeholder?: string
    rows?: number
    disabled?: boolean
}

export function TextareaField<T extends FieldValues>({
    form,
    name,
    label,
    description,
    required,
    className,
    placeholder,
    rows = 3,
    disabled,
}: TextareaFieldProps<T>) {
    const id = React.useId()
    const descId = description ? `${id}-desc` : undefined
    const errId = `${id}-err`

    return (
        <Controller
            control={form.control}
            name={name}
            render={({ field, fieldState }) => (
                <div className={cn('flex flex-col gap-1.5', className)}>
                    {label && (
                        <Label htmlFor={id}>
                            {label}
                            {required && <span className="text-destructive ml-0.5">*</span>}
                        </Label>
                    )}
                    {description && (
                        <p id={descId} className="text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                    <Textarea
                        id={id}
                        placeholder={placeholder}
                        rows={rows}
                        disabled={disabled}
                        aria-describedby={
                            [descId, fieldState.error ? errId : undefined]
                                .filter(Boolean)
                                .join(' ') || undefined
                        }
                        aria-invalid={!!fieldState.error}
                        {...field}
                        value={field.value ?? ''}
                    />
                    {fieldState.error && (
                        <p id={errId} className="text-xs text-destructive" role="alert">
                            {fieldState.error.message}
                        </p>
                    )}
                </div>
            )}
        />
    )
}

//   FormRoot — wraps <form> with RHF submit handler 

interface FormRootProps {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    className?: string
    children: React.ReactNode
}

export function FormRoot({ onSubmit, className, children }: FormRootProps) {
    return (
        <form
            onSubmit={onSubmit}
            noValidate
            className={cn('space-y-4', className)}
        >
            {children}
        </form>
    )
}
