import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

type ApiResponse = {
  success: boolean
  message: string
  data: unknown
  meta?: unknown
}

type ApiTestResult = {
  status: number
  response: ApiResponse | null
  error: string | null
  timestamp: string
}

function IndexPage() {
  const [activeTab, setActiveTab] = useState<
    'health' | 'create-patient' | 'login'
  >('health')

  // Health API state
  const [healthLoading, setHealthLoading] = useState(false)
  const [healthResult, setHealthResult] = useState<ApiTestResult | null>(null)

  // Create Patient API state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [address, setAddress] = useState('')
  const [createPatientLoading, setCreatePatientLoading] = useState(false)
  const [createPatientResult, setCreatePatientResult] =
    useState<ApiTestResult | null>(null)

  // Login API state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginResult, setLoginResult] = useState<ApiTestResult | null>(null)

  const testHealthApi = async () => {
    setHealthLoading(true)
    setHealthResult(null)

    try {
      const res = await fetch('/api/health', {
        method: 'GET',
      })

      const data = await res.json().catch(() => null)

      setHealthResult({
        status: res.status,
        response: data,
        error: !res.ok
          ? data?.message || `Request failed with status ${res.status}`
          : null,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      setHealthResult({
        status: 0,
        response: null,
        error: err instanceof Error ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setHealthLoading(false)
    }
  }

  const testCreatePatientApi = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatePatientLoading(true)
    setCreatePatientResult(null)

    try {
      const res = await fetch('/api/user/create-patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          address: address || undefined,
        }),
      })

      const data = await res.json().catch(() => null)

      setCreatePatientResult({
        status: res.status,
        response: data,
        error: !res.ok
          ? data?.message || `Request failed with status ${res.status}`
          : null,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      setCreatePatientResult({
        status: 0,
        response: null,
        error: err instanceof Error ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setCreatePatientLoading(false)
    }
  }

  const testLoginApi = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginResult(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
        credentials: 'include',
      })

      const data = await res.json().catch(() => null)

      setLoginResult({
        status: res.status,
        response: data,
        error: !res.ok
          ? data?.message || `Request failed with status ${res.status}`
          : null,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      setLoginResult({
        status: 0,
        response: null,
        error: err instanceof Error ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoginLoading(false)
    }
  }

  const formatJSON = (obj: unknown): string => {
    try {
      return JSON.stringify(obj, null, 2)
    } catch {
      return String(obj)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Smart Health Care API</h1>
          <p className="text-gray-600">
            Comprehensive API testing interface for all available endpoints
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('health')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'health'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900',
            )}
          >
            Health Check
          </button>
          <button
            onClick={() => setActiveTab('create-patient')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'create-patient'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900',
            )}
          >
            Create Patient
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'login'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900',
            )}
          >
            Login
          </button>
        </div>

        {/* Health API Tab */}
        {activeTab === 'health' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  GET /api/health
                  <Badge variant="outline" className="text-xs">
                    GET
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Check server health and status information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Request</h3>
                    <div className="bg-slate-50 rounded-md p-3 text-xs font-mono">
                      <div className="text-slate-600">Method: GET</div>
                      <div className="text-slate-600">Endpoint: /api/health</div>
                      <div className="text-slate-600">Headers: None</div>
                      <div className="text-slate-600">Body: None</div>
                    </div>
                  </div>
                  <button
                    onClick={testHealthApi}
                    disabled={healthLoading}
                    className="w-full inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {healthLoading ? 'Testing...' : 'Test API'}
                  </button>
                </div>
              </CardContent>
              {healthResult && (
                <CardFooter className="flex-col items-start gap-2">
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-medium">Response</h3>
                      <Badge
                        variant={
                          healthResult.status >= 200 && healthResult.status < 300
                            ? 'default'
                            : 'destructive'
                        }
                        className="text-xs"
                      >
                        {healthResult.status}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(healthResult.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {healthResult.error ? (
                      <div className="bg-rose-50 border border-rose-200 rounded-md p-3 text-sm text-rose-800">
                        <strong>Error:</strong> {healthResult.error}
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-md p-3 text-xs font-mono overflow-x-auto">
                        <pre className="whitespace-pre-wrap">
                          {formatJSON(healthResult.response)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardFooter>
              )}
            </Card>

            {/* Response Preview */}
            {healthResult && !healthResult.error && (
              <Card>
                <CardHeader>
                  <CardTitle>Response Preview</CardTitle>
                  <CardDescription>
                    Formatted response data visualization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {healthResult.response && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Status: {healthResult.status}
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                          {healthResult.response.success && (
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                              <span>Success: {String(healthResult.response.success)}</span>
                            </div>
                          )}
                          {healthResult.response.message && (
                            <div>
                              <strong>Message:</strong>{' '}
                              {healthResult.response.message}
                            </div>
                          )}
                          {healthResult.response.data != null && (
                            <div className="mt-2">
                              <strong>Data:</strong>
                              <div className="bg-slate-50 rounded p-2 mt-1 text-xs font-mono">
                                <pre className="whitespace-pre-wrap">
                                  {formatJSON(healthResult.response.data)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Create Patient API Tab */}
        {activeTab === 'create-patient' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  POST /api/user/create-patient
                  <Badge variant="outline" className="text-xs">
                    POST
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Create a new patient account in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={testCreatePatientApi}>
                  <div className="space-y-1">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Address <span className="text-slate-400 text-xs">(optional)</span>
                    </label>
                    <input
                      id="address"
                      type="text"
                      className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main St, City, State"
                    />
                  </div>

                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">Request Body</h3>
                    <div className="bg-slate-50 rounded-md p-3 text-xs font-mono">
                      <pre className="whitespace-pre-wrap">
                        {formatJSON({
                          name: name || '...',
                          email: email || '...',
                          password: password ? '••••••••' : '...',
                          ...(address && { address }),
                        })}
                      </pre>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={createPatientLoading}
                    className="w-full inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {createPatientLoading ? 'Creating...' : 'Create Patient'}
                  </button>
                </form>
              </CardContent>
              {createPatientResult && (
                <CardFooter className="flex-col items-start gap-2">
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-medium">Response</h3>
                      <Badge
                        variant={
                          createPatientResult.status >= 200 &&
                          createPatientResult.status < 300
                            ? 'default'
                            : 'destructive'
                        }
                        className="text-xs"
                      >
                        {createPatientResult.status}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(
                          createPatientResult.timestamp,
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                    {createPatientResult.error ? (
                      <div className="bg-rose-50 border border-rose-200 rounded-md p-3 text-sm text-rose-800">
                        <strong>Error:</strong> {createPatientResult.error}
                        {createPatientResult.response && (
                          <div className="mt-2 text-xs font-mono bg-rose-100 p-2 rounded">
                            <pre className="whitespace-pre-wrap">
                              {formatJSON(createPatientResult.response)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-md p-3 text-xs font-mono overflow-x-auto">
                        <pre className="whitespace-pre-wrap">
                          {formatJSON(createPatientResult.response)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardFooter>
              )}
            </Card>

            {/* Response Preview */}
            {createPatientResult && !createPatientResult.error && (
              <Card>
                <CardHeader>
                  <CardTitle>Response Preview</CardTitle>
                  <CardDescription>
                    Formatted response data visualization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {createPatientResult.response && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Status: {createPatientResult.status}
                        </div>
                        <div className="text-sm text-slate-600 space-y-2">
                          {createPatientResult.response.success && (
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                              <span>Success: {String(createPatientResult.response.success)}</span>
                            </div>
                          )}
                          {createPatientResult.response.message && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
                              <strong>Message:</strong>{' '}
                              {createPatientResult.response.message}
                            </div>
                          )}
                          {createPatientResult.response.data != null && (
                            <div className="mt-2">
                              <strong>Created Patient Data:</strong>
                              <div className="bg-slate-50 rounded p-2 mt-1 text-xs font-mono">
                                <pre className="whitespace-pre-wrap">
                                  {formatJSON(createPatientResult.response.data)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Login API Tab */}
        {activeTab === 'login' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  POST /api/auth/login
                  <Badge variant="outline" className="text-xs">
                    POST
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Sign in with email and password. Sets accessToken and
                  refreshToken cookies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={testLoginApi}>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">Request Body</h3>
                    <div className="bg-slate-50 rounded-md p-3 text-xs font-mono">
                      <pre className="whitespace-pre-wrap">
                        {formatJSON({
                          email: loginEmail || '...',
                          password: loginPassword ? '••••••••' : '...',
                        })}
                      </pre>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loginLoading ? 'Signing in...' : 'Login'}
                  </button>
                </form>
              </CardContent>
              {loginResult && (
                <CardFooter className="flex-col items-start gap-2">
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-medium">Response</h3>
                      <Badge
                        variant={
                          loginResult.status >= 200 && loginResult.status < 300
                            ? 'default'
                            : 'destructive'
                        }
                        className="text-xs"
                      >
                        {loginResult.status}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(
                          loginResult.timestamp,
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                    {loginResult.error ? (
                      <div className="bg-rose-50 border border-rose-200 rounded-md p-3 text-sm text-rose-800">
                        <strong>Error:</strong> {loginResult.error}
                        {loginResult.response && (
                          <div className="mt-2 text-xs font-mono bg-rose-100 p-2 rounded">
                            <pre className="whitespace-pre-wrap">
                              {formatJSON(loginResult.response)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-md p-3 text-xs font-mono overflow-x-auto">
                        <pre className="whitespace-pre-wrap">
                          {formatJSON(loginResult.response)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardFooter>
              )}
            </Card>

            {loginResult && !loginResult.error && (
              <Card>
                <CardHeader>
                  <CardTitle>Response Preview</CardTitle>
                  <CardDescription>
                    Login success. Cookies (accessToken, refreshToken) are set
                    by the server.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loginResult.response?.data != null && (
                    <div className="text-sm text-slate-600 space-y-2">
                      <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
                        <strong>Message:</strong>{' '}
                        {String(loginResult.response.message)}
                      </div>
                      <div>
                        <strong>Data:</strong>
                        <div className="bg-slate-50 rounded p-2 mt-1 text-xs font-mono">
                          <pre className="whitespace-pre-wrap">
                            {formatJSON(loginResult.response.data)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
