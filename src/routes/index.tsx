
import { createFileRoute, Link } from '@tanstack/react-router'
import { Heart, Calendar, Stethoscope, Shield, ArrowRight, Search, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { MotionSlideUp, MotionFadeIn, MotionStaggerList, staggerItem } from '@/components/ui/motion'
import { motion } from 'framer-motion'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <MotionSlideUp>
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                    <Heart className="h-4 w-4" />
                    <span>Your Health, Our Priority</span>
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                    Modern Healthcare{' '}
                    <span className="text-primary">Made Simple</span>
                  </h1>

                  <p className="max-w-lg text-lg text-muted-foreground leading-relaxed">
                    Find qualified doctors, book appointments instantly, and manage
                    your health records — all from one trusted platform.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Button size="lg" asChild>
                      <Link to="/register">
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/consultation">
                        Find a Doctor
                        <Search className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-8 pt-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">500+</p>
                      <p className="text-sm text-muted-foreground">Qualified Doctors</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">50k+</p>
                      <p className="text-sm text-muted-foreground">Happy Patients</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">4.9</p>
                      <p className="text-sm text-muted-foreground">User Rating</p>
                    </div>
                  </div>
                </div>
              </MotionSlideUp>

              {/* Hero placeholder */}
              <MotionFadeIn className="hidden lg:block">
                <div className="relative">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Stethoscope className="h-32 w-32 text-primary/30" />
                  </div>
                  {/* Floating cards */}
                  <div className="absolute -bottom-4 -left-4 rounded-xl bg-card p-4 shadow-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Appointment Booked</p>
                        <p className="text-xs text-muted-foreground">Dr. Smith • Tomorrow 10 AM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </MotionFadeIn>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Our Services</h2>
              <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                Comprehensive healthcare services designed to keep you and your family healthy.
              </p>
            </div>

            <MotionStaggerList className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Stethoscope,
                  title: 'Online Consultation',
                  description: 'Connect with doctors from the comfort of your home.',
                },
                {
                  icon: Calendar,
                  title: 'Easy Scheduling',
                  description: 'Book appointments with just a few clicks.',
                },
                {
                  icon: Shield,
                  title: 'Health Records',
                  description: 'Secure digital health records accessible anytime.',
                },
                {
                  icon: Heart,
                  title: 'Prescriptions',
                  description: 'Digital prescriptions and follow-up management.',
                },
              ].map((service) => (
                <motion.div key={service.title} variants={staggerItem}>
                  <Card className="text-center h-full transition-shadow hover:shadow-md">
                    <CardContent className="pt-6 space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <service.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold">{service.title}</h3>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </MotionStaggerList>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
              <p className="mt-2 text-muted-foreground">
                Get started in three simple steps
              </p>
            </div>

            <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
              {[
                {
                  step: '01',
                  icon: Search,
                  title: 'Search Doctor',
                  description: 'Browse our network of qualified healthcare professionals by specialty.',
                },
                {
                  step: '02',
                  icon: Clock,
                  title: 'Book Appointment',
                  description: 'Pick a convenient date and time from available slots.',
                },
                {
                  step: '03',
                  icon: CheckCircle,
                  title: 'Get Consultation',
                  description: 'Meet your doctor and receive personalized care and prescriptions.',
                },
              ].map((step) => (
                <div key={step.step} className="text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="mx-auto max-w-4xl px-4 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Join thousands of patients who trust Smart Health Care for their medical needs.
              Sign up today and book your first appointment.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/register">
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/consultation">Browse Doctors</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
