import { generateTimeSlots } from '../utils/helpers'

export class Barber {
    constructor(data) {
        this.id = data.id
        this.name = data.name
        this.active = data.active
        this.schedule = data.schedule || {}
        this.specialties = data.specialties || []
    }

    isAvailable(dateStr, timeStr, appointments) {
        // 1. Check if barber works on this day of week
        const date = new Date(dateStr + 'T12:00:00')
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const dayName = days[date.getDay()]

        const schedule = this.schedule[dayName]
        if (!schedule) return false // Not working today

        // 2. Check if time is within working hours
        // Simple check: exists in generated slots
        const slots = generateTimeSlots(schedule.start, schedule.end)
        if (!slots.includes(timeStr)) return false

        // 3. Check for conflict with existing appointments
        // This logic is often in helpers, but good to have here too used by Service
        const conflict = appointments.some(apt =>
            apt.barberId === this.id &&
            apt.date === dateStr &&
            apt.time === timeStr &&
            apt.status !== 'cancelled'
        )

        return !conflict
    }
}
