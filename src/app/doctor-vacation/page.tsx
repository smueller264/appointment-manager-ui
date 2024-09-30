'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Doctor {
  id: number
  firstName: string
  lastName: string
}

interface Appointment {
  id: number
  doctor: number
  patient: number
  appType: string
  appStart: string
  appEnd: string
}

export default function DoctorVacation() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<string>('')

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:5173/doctors')
        if (!response.ok) {
          throw new Error('Failed to fetch doctors')
        }
        const data: Doctor[] = await response.json()
        setDoctors(data)
      } catch (error) {
        console.error('Error fetching doctors:', error)
        toast({
          title: "Error",
          description: "Failed to fetch doctors. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchDoctors()
  }, [])

  const handleCheckAvailability = async () => {
    if (!selectedDoctor || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select a doctor and enter vacation dates.",
        variant: "destructive",
      })
      return
    }

    setIsChecking(true)
    setCheckResult('')

    try {
      const response = await fetch('http://localhost:5173/checkdoctoravailability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor: parseInt(selectedDoctor),
          timeStart: new Date(startDate).toISOString(),
          timeEnd: new Date(endDate).toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to check doctor availability')
      }

      const appointments: Appointment[] = await response.json()

      if (appointments.length === 0) {
        setCheckResult('The vacation can be approved. No appointments during this period.')
      } else {
        setCheckResult(`The doctor has ${appointments.length} appointment(s) during this period. Vacation cannot be approved.`)
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      toast({
        title: "Error",
        description: "Failed to check doctor availability. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Doctor Vacation Booking</CardTitle>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctor">Select Doctor</Label>
              <Select onValueChange={setSelectedDoctor} value={selectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.firstName} {doctor.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Vacation Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Vacation End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button type="button" onClick={handleCheckAvailability} disabled={isChecking}>
              {isChecking ? "Checking..." : "Check Availability"}
            </Button>
          </form>
          {checkResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <p className="text-sm font-medium">{checkResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}