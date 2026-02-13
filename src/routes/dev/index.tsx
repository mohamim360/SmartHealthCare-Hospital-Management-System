import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { HealthCheck } from '@/components/landing/health-check'
import { CreatePatient } from '@/components/landing/create-patient'
import { CreateAdmin } from '@/components/landing/create-admin'
import { CreateDoctor } from '@/components/landing/create-doctor'
import { Login } from '@/components/landing/login'

export const Route = createFileRoute('/dev/')({
  component: IndexPage,
})

function IndexPage() {
  const [activeTab, setActiveTab] = useState<
    'health' | 'create-patient' | 'create-admin' | 'create-doctor' | 'login'
  >('health')

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
            onClick={() => setActiveTab('create-admin')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'create-admin'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900',
            )}
          >
            Create Admin
          </button>
          <button
            onClick={() => setActiveTab('create-doctor')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'create-doctor'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900',
            )}
          >
            Create Doctor
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

        {/* Tab Content */}
        {activeTab === 'health' && <HealthCheck />}
        {activeTab === 'create-patient' && <CreatePatient />}
        {activeTab === 'create-admin' && <CreateAdmin />}
        {activeTab === 'create-doctor' && <CreateDoctor />}
        {activeTab === 'login' && <Login />}
      </div>
    </div >
  )
}
