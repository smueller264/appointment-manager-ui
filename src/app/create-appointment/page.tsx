'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
//import { toast } from "@/components/ui/use-toast"
import Link from 'next/link'
import { toast } from '@/hooks/use-toast'

type AppointmentType = 'quick' | 'extensive' | 'operation'

interface FormData {
  doctor: string
  patient: string
  appType: AppointmentType
  appStart: string
}

export default function CreateAppointment() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    doctor: '',
    patient: '',
    appType: 'quick',
    appStart: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: AppointmentType) => {
    setFormData(prev => ({ ...prev, appType: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:5173/appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor: parseInt(formData.doctor),
          patient: parseInt(formData.patient),
          appType: formData.appType,
          appStart: new Date(formData.appStart).toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create appointment')
      }

      toast({
        title: "Success",
        description: "Appointment created successfully",
      })

      router.push('/appointments')
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to create appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Create Appointment</CardTitle>
          <Link href="/appointments">
            <Button variant="outline">Back to Appointments</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor ID</Label>
              <Input
                id="doctor"
                name="doctor"
                type="number"
                required
                value={formData.doctor}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient">Patient ID</Label>
              <Input
                id="patient"
                name="patient"
                type="number"
                required
                value={formData.patient}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appType">Appointment Type</Label>
              <Select onValueChange={handleSelectChange} value={formData.appType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick</SelectItem>
                  <SelectItem value="extensive">Extensive</SelectItem>
                  <SelectItem value="operation">Operation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appStart">Appointment Start</Label>
              <Input
                id="appStart"
                name="appStart"
                type="datetime-local"
                required
                value={formData.appStart}
                onChange={handleInputChange}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Appointment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}