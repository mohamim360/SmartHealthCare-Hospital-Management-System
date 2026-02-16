import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { HealthCheck } from '@/components/landing/health-check'
import { CreatePatient } from '@/components/landing/create-patient'
import { CreateAdmin } from '@/components/landing/create-admin'
import { CreateDoctor } from '@/components/landing/create-doctor'
import { Login } from '@/components/landing/login'
import { Schedule } from '@/components/landing/schedule'
import { DoctorSchedule } from '@/components/landing/doctor-schedule'
import { Patients } from '@/components/landing/patients'
import { Admins } from '@/components/landing/admins'
import { DoctorManagement } from '@/components/landing/doctor-management'

export const Route = createFileRoute('/dev/')({
  component: IndexPage,
})

type TabId =
  | 'health'
  | 'create-patient'
  | 'create-admin'
  | 'create-doctor'
  | 'login'
  | 'schedule'
  | 'doctor-schedule'
  | 'patients'
  | 'admins'
  | 'doctor-management'

function IndexPage() {
  const [activeTab, setActiveTab] = useState<TabId>('health')

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
          <button
            onClick={() => setActiveTab('schedule')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'schedule'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900',
            )}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('doctor-schedule')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'doctor-schedule'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900',
            )}
          >
            Doctor Schedule
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'patients'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900',
            )}
          >
            Patients
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'admins'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900',
            )}
          >
            Admins
          </button>
          <button
            onClick={() => setActiveTab('doctor-management')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'doctor-management'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900',
            )}
          >
            Doctor Mgmt
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'health' && <HealthCheck />}
        {activeTab === 'create-patient' && <CreatePatient />}
        {activeTab === 'create-admin' && <CreateAdmin />}
        {activeTab === 'create-doctor' && <CreateDoctor />}
        {activeTab === 'login' && <Login />}
        {activeTab === 'schedule' && <Schedule />}
        {activeTab === 'doctor-schedule' && <DoctorSchedule />}
        {activeTab === 'patients' && <Patients />}
        {activeTab === 'admins' && <Admins />}
        {activeTab === 'doctor-management' && <DoctorManagement />}
      </div>
    </div >
  )
}
