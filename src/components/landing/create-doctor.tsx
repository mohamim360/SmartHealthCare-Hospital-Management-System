import { useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    ApiTestResult,
    ApiResponsePreview,
} from '@/components/shared/api-response-preview'

export function CreateDoctor() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        contactNumber: '',
        address: '',
        registrationNumber: '',
        experience: 0,
        gender: 'MALE' as 'MALE' | 'FEMALE',
        appointmentFee: 0,
        qualification: '',
        currentWorkingPlace: '',
        designation: '',
    })
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<ApiTestResult | null>(null)

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
        }))
    }

    const testCreateDoctorApi = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        const token = sessionStorage.getItem('accessToken')

        try {
            const res = await fetch('/api/user/create-doctor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                credentials: 'include', // Still send cookies for cross-verification
                body: JSON.stringify(formData),
            })

            const data = await res.json().catch(() => null)

            setResult({
                status: res.status,
                response: data,
                error: !res.ok
                    ? data?.message || `Request failed with status ${res.status}`
                    : null,
                timestamp: new Date().toISOString(),
            })
        } catch (err) {
            setResult({
                status: 0,
                response: null,
                error: err instanceof Error ? err.message : 'Something went wrong',
                timestamp: new Date().toISOString(),
            })
        } finally {
            setLoading(false)
        }
    }

    const formatJSON = (obj: unknown): string => {
        try {
            return JSON.stringify(obj, null, 2)
        } catch {
            return String(obj)
        }
    }

    const inputFields = [
        { name: 'name', label: 'Name', type: 'text', placeholder: 'Dr. Jane Smith', required: true },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'jane.smith@example.com', required: true },
        { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
        { name: 'contactNumber', label: 'Contact Number', type: 'text', placeholder: '01XXXXXXXXX', required: true },
        { name: 'address', label: 'Address', type: 'text', placeholder: '123 Medical Rd, City', required: true },
        { name: 'registrationNumber', label: 'Registration Number', type: 'text', placeholder: 'REG-12345', required: true },
        { name: 'experience', label: 'Experience (Years)', type: 'number', placeholder: '5', required: false },
        { name: 'appointmentFee', label: 'Appointment Fee', type: 'number', placeholder: '500', required: true },
        { name: 'qualification', label: 'Qualification', type: 'text', placeholder: 'MBBS, FCPS', required: true },
        { name: 'currentWorkingPlace', label: 'Current Working Place', type: 'text', placeholder: 'Central Hospital', required: true },
        { name: 'designation', label: 'Designation', type: 'text', placeholder: 'Senior Consultant', required: true },
    ]

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        POST /api/user/create-doctor
                        <Badge variant="outline" className="text-xs">
                            POST
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Create a new doctor account in the system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={testCreateDoctorApi}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {inputFields.map((field) => (
                                <div key={field.name} className="space-y-1">
                                    <label
                                        htmlFor={field.name}
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                                    </label>
                                    <input
                                        id={field.name}
                                        name={field.name}
                                        type={field.type}
                                        className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                        value={formData[field.name as keyof typeof formData]}
                                        onChange={handleChange}
                                        required={field.required}
                                        placeholder={field.placeholder}
                                    />
                                </div>
                            ))}
                            <div className="space-y-1">
                                <label
                                    htmlFor="gender"
                                    className="block text-sm font-medium text-slate-700"
                                >
                                    Gender <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="MALE">MALE</option>
                                    <option value="FEMALE">FEMALE</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <h3 className="text-sm font-medium mb-2">Request Body Preview</h3>
                            <div className="bg-slate-50 rounded-md p-3 text-xs font-mono max-h-40 overflow-auto">
                                <pre className="whitespace-pre-wrap">
                                    {formatJSON({
                                        ...formData,
                                        password: formData.password ? '••••••••' : '...',
                                    })}
                                </pre>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Doctor'}
                        </button>
                    </form>
                </CardContent>
            </Card>

            <ApiResponsePreview result={result} formatJSON={formatJSON} />
        </div>
    )
}
