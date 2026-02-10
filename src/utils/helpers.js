import { format, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Date formatting
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr, { locale: ptBR })
}

export const formatTime = (time) => {
    if (!time) return ''
    return time
}

export const formatDateTime = (date, time) => {
    return `${formatDate(date)} às ${time}`
}

// Currency formatting
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

// Days calculation
export const getDaysSinceLastVisit = (lastVisit) => {
    if (!lastVisit) return null
    const lastVisitDate = typeof lastVisit === 'string' ? parseISO(lastVisit) : lastVisit
    return differenceInDays(new Date(), lastVisitDate)
}

// WhatsApp helpers
export const generateWhatsAppLink = (phone, message = '') => {
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '')
    // Add country code if not present (55 for Brazil)
    const phoneWithCode = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
    // Encode message
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${phoneWithCode}${message ? `?text=${encodedMessage}` : ''}`
}

export const generateReEngagementMessage = (customerName, daysAbsent) => {
    return `Olá ${customerName}! 👋\n\nPercebemos que você não nos visita há ${daysAbsent} dias e sentimos sua falta! 😊\n\nQue tal agendar um horário? Temos uma promoção especial esperando por você! 🎉\n\nClique aqui para escolher seu horário: [link do agendamento]`
}

// Loyalty program helpers
export const calculateLoyaltyPoints = (totalSpent, pointsPerReal = 0.5) => {
    return Math.floor(totalSpent * pointsPerReal)
}

export const getTierByPoints = (points, tiers) => {
    for (const tier of tiers) {
        if (points >= tier.minPoints && points <= tier.maxPoints) {
            return tier
        }
    }
    return tiers[0] // Return Bronze as default
}

export const getNextTier = (currentPoints, tiers) => {
    const currentTier = getTierByPoints(currentPoints, tiers)
    const currentIndex = tiers.findIndex(t => t.name === currentTier.name)

    if (currentIndex < tiers.length - 1) {
        const nextTier = tiers[currentIndex + 1]
        const pointsNeeded = nextTier.minPoints - currentPoints
        return { tier: nextTier, pointsNeeded }
    }

    return null // Already at max tier
}

// Form validation
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

export const validatePhone = (phone) => {
    const re = /^[\d\s\-\(\)]+$/
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export const validateName = (name) => {
    return name.trim().length >= 3
}

// Availability helpers
const LUNCH_START = '12:00'
const LUNCH_END = '14:00'

export const generateTimeSlots = (startTime, endTime, duration = 30) => {
    const slots = []
    let current = parseTime(startTime)
    const end = parseTime(endTime)
    const lunchStart = parseTime(LUNCH_START)
    const lunchEnd = parseTime(LUNCH_END)

    while (current < end) {
        if (current < lunchStart || current >= lunchEnd) {
            slots.push(formatTimeSlot(current))
        }
        current += duration * 60 * 1000
    }

    return slots
}

const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date.getTime()
}

const formatTimeSlot = (timestamp) => {
    const date = new Date(timestamp)
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export const isSlotAvailable = (timeSlot, appointments, barberId, date) => {
    return !appointments.some(
        apt =>
            apt.barberId === barberId &&
            apt.date === date &&
            apt.time === timeSlot &&
            apt.status !== 'cancelled'
    )
}

// Status helpers
export const getStatusColor = (status) => {
    const colors = {
        confirmed: 'text-green-500 bg-green-500/20',
        pending: 'text-yellow-500 bg-yellow-500/20',
        completed: 'text-blue-500 bg-blue-500/20',
        cancelled: 'text-red-500 bg-red-500/20',
    }
    return colors[status] || colors.pending
}

export const getStatusLabel = (status) => {
    const labels = {
        confirmed: 'Confirmado',
        pending: 'Pendente',
        completed: 'Concluído',
        cancelled: 'Cancelado',
    }
    return labels[status] || status
}

// Sorting helpers
export const sortByDate = (items, key = 'date', descending = false) => {
    return [...items].sort((a, b) => {
        const dateA = new Date(a[key])
        const dateB = new Date(b[key])
        return descending ? dateB - dateA : dateA - dateB
    })
}

export const sortByName = (items, key = 'name') => {
    return [...items].sort((a, b) => a[key].localeCompare(b[key]))
}

// Filter helpers
export const filterAbsentCustomers = (customers, minDays = 30) => {
    return customers.filter(customer => {
        const days = getDaysSinceLastVisit(customer.lastVisit)
        return days !== null && days >= minDays
    })
}
