'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment)

interface Appointment {
  id: number
  doctor: number
  patient: number
  appType: string
  appStart: string
  appEnd: string
  createdAt: string
}

interface CalendarEvent {
  id: number
  title: string
  start: Date
  end: Date
  doctor: number
  patient: number
  appType: string
}

export default function AppointmentsCalendar() {
  const [appointments, setAppointments] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>(Views.MONTH)
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('http://localhost:5173/appointments')

        if (!response.ok) {
          throw new Error('Failed to fetch appointments')
        }

        const appointmentsData: Appointment[] = await response.json()

        const calendarEvents: CalendarEvent[] = appointmentsData.map(app => ({
          id: app.id,
          title: `${app.appType} Appointment`,
          start: new Date(app.appStart),
          end: new Date(app.appEnd),
          doctor: app.doctor,
          patient: app.patient,
          appType: app.appType
        }))

        setAppointments(calendarEvents)
      } catch (err) {
        setError('An error occurred while fetching appointments')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    let backgroundColor = '#3174ad'
    switch (event.appType) {
      case 'quick':
        backgroundColor = '#4caf50'
        break
      case 'extensive':
        backgroundColor = '#ff9800'
        break
      case 'operation':
        backgroundColor = '#f44336'
        break
    }
    return { style: { backgroundColor } }
  }, [])

  const onNavigate = useCallback((newDate: Date) => {
    setDate(newDate)
  }, [])

  const onView = useCallback((newView: View) => {
    setView(newView)
  }, [])

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    alert(`Selected appointment: ${event.title}\nDoctor ID: ${event.doctor}\nPatient ID: ${event.patient}`)
  }, [])

  const recentAndUpcomingAppointments = useMemo(() => {
    const now = new Date()
    const sortedAppointments = [...appointments].sort((a, b) => a.start.getTime() - b.start.getTime())
    const recentAppointments = sortedAppointments.filter(app => app.start <= now).slice(-5).reverse()
    const upcomingAppointments = sortedAppointments.filter(app => app.start > now).slice(0, 5)
    return [...recentAppointments, ...upcomingAppointments]
  }, [appointments])

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
          <CardTitle className="text-2xl font-bold">Appointments Calendar</CardTitle>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="lg:w-3/4">
              <Calendar
                localizer={localizer}
                events={appointments}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                onNavigate={onNavigate}
                onView={onView}
                view={view}
                date={date}
                tooltipAccessor={(event) => `${event.title}\nDoctor ID: ${event.doctor}\nPatient ID: ${event.patient}`}
              />
            </div>
            <div className="lg:w-1/4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent & Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {recentAndUpcomingAppointments.map((app) => (
                      <li key={app.id} className="text-sm">
                        <span className={`font-semibold ${app.start > new Date() ? 'text-green-600' : 'text-gray-600'}`}>
                          {moment(app.start).format('MMM D, HH:mm')}
                        </span>
                        <br />
                        {app.title} (Doctor: {app.doctor}, Patient: {app.patient})
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}