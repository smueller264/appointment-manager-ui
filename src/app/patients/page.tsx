'use client'

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Patient {
  id: number
  firstName: string
  lastName: string
  insuranceNumber: string
}

interface Appointment {
  id: number
  doctor: number
  patient: number
  appType: string
  appStart: string
  appEnd: string
}

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://localhost:5173/patients')
        if (!response.ok) {
          throw new Error('Failed to fetch patients')
        }
        const data = await response.json()
        setPatients(data)
      } catch (err) {
        setError('An error occurred while fetching patients')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatients()
  }, [])

  const fetchAppointments = async (patientId: number) => {
    try {
      const response = await fetch(`http://localhost:5173/appointmentbypatient/${patientId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }
      const data = await response.json()
      setAppointments(data)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      })
    }
  }

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient)
    fetchAppointments(patient.id)
  }

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      const response = await fetch(`http://localhost:5173/appointment/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        throw new Error(`Failed to cancel appointment: ${errorData.error || response.statusText}`)
      }
      
      const result = await response.json()
      console.log('Cancellation result:', result)
      
      setAppointments(appointments.filter(app => app.id !== appointmentId))
      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      })
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to cancel appointment",
        variant: "destructive",
      })
    }
  }

  const handleCancelAllAppointments = async () => {
    if (!selectedPatient) return

    try {
      const response = await fetch(`http://localhost:5173/appointmentbypatient/${selectedPatient.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        throw new Error(`Failed to cancel all appointments: ${errorData.error || response.statusText}`)
      }
      
      const result = await response.json()
      console.log('Cancellation result:', result)
      
      setAppointments([])
      toast({
        title: "Success",
        description: "All appointments cancelled successfully",
      })
    } catch (err) {
      console.error('Error cancelling all appointments:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to cancel all appointments",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Registered Patients</CardTitle>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of all registered patients.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Insurance Number</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.id}</TableCell>
                  <TableCell>{patient.firstName}</TableCell>
                  <TableCell>{patient.lastName}</TableCell>
                  <TableCell>{patient.insuranceNumber}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => handlePatientClick(patient)}>View Appointments</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>{patient.firstName} {patient.lastName}'s Appointments</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <Button variant="destructive" onClick={handleCancelAllAppointments} className="mb-4">
                            Cancel All Appointments
                          </Button>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Doctor ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Start</TableHead>
                                <TableHead>End</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {appointments.map((appointment) => (
                                <TableRow key={appointment.id}>
                                  <TableCell>{appointment.id}</TableCell>
                                  <TableCell>{appointment.doctor}</TableCell>
                                  <TableCell>{appointment.appType}</TableCell>
                                  <TableCell>{new Date(appointment.appStart).toLocaleString()}</TableCell>
                                  <TableCell>{new Date(appointment.appEnd).toLocaleString()}</TableCell>
                                  <TableCell>
                                    <Button variant="destructive" onClick={() => handleCancelAppointment(appointment.id)}>
                                      Cancel
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}