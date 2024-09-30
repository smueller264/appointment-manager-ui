import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to Our Clinic</h1>
      <div className="space-y-4">
        <Link href="/register-patient">
          <Button size="lg" className="w-full">Register New Patient</Button>
        </Link>
        <Link href="/patients">
          <Button size="lg" variant="outline" className="w-full">View All Patients</Button>
        </Link>
        <Link href="/appointments">
          <Button size="lg" variant="outline" className="w-full">View Appointments Calendar</Button>
        </Link>
        <Link href="/create-appointment">
          <Button size="lg" variant="outline" className="w-full">Create New Appointment</Button>
        </Link>
        <Link href="/doctor-vacation">
          <Button size="lg" variant="outline" className="w-full">Book Doctor Vacation</Button>
        </Link>
      </div>
    </div>
  )
}