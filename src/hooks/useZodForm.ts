
import { useForm, type UseFormProps, type FieldValues, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodType } from 'zod'

type ZodFormOptions<T extends FieldValues> = Omit<UseFormProps<T>, 'resolver'> & {
    schema: ZodType<T>
}


export function useZodForm<T extends FieldValues>({
    schema,
    ...formOptions
}: ZodFormOptions<T>): UseFormReturn<T> {
    return useForm<T>({
        ...formOptions,

        resolver: zodResolver(schema as unknown as any),
    }) as unknown as UseFormReturn<T>
}
