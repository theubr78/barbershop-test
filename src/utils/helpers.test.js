import { describe, it, expect } from 'vitest'
import {
    validateEmail,
    validatePhone,
    validateName,
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime,
    generateWhatsAppLink,
    generateReEngagementMessage,
    calculateLoyaltyPoints,
    getTierByPoints,
    getNextTier,
    generateTimeSlots,
    isSlotAvailable,
    getStatusColor,
    getStatusLabel,
    sortByDate,
    sortByName,
    filterAbsentCustomers,
    getDaysSinceLastVisit
} from './helpers'

// ==================== VALIDATION ====================
describe('Validation', () => {
    describe('validateEmail', () => {
        it('should accept valid emails', () => {
            expect(validateEmail('test@example.com')).toBe(true)
            expect(validateEmail('user.name@domain.co.uk')).toBe(true)
            expect(validateEmail('user+tag@gmail.com')).toBe(true)
        })

        it('should reject invalid emails', () => {
            expect(validateEmail('')).toBe(false)
            expect(validateEmail('invalid')).toBe(false)
            expect(validateEmail('@domain.com')).toBe(false)
            expect(validateEmail('user@')).toBe(false)
            expect(validateEmail('user @domain.com')).toBe(false)
        })
    })

    describe('validatePhone', () => {
        it('should accept valid Brazilian phone numbers', () => {
            expect(validatePhone('(11) 98765-4321')).toBe(true)
            expect(validatePhone('11987654321')).toBe(true)
            expect(validatePhone('(21) 3456-7890')).toBe(true)
        })

        it('should reject short or invalid phones', () => {
            expect(validatePhone('123')).toBe(false)
            expect(validatePhone('abc')).toBe(false)
            expect(validatePhone('')).toBe(false)
        })
    })

    describe('validateName', () => {
        it('should accept names with 3+ characters', () => {
            expect(validateName('Ana')).toBe(true)
            expect(validateName('João Silva')).toBe(true)
        })

        it('should reject names under 3 characters', () => {
            expect(validateName('Jo')).toBe(false)
            expect(validateName('A')).toBe(false)
            expect(validateName('  ')).toBe(false)
        })
    })
})

// ==================== FORMATTING ====================
describe('Formatting', () => {
    describe('formatCurrency', () => {
        it('should format BRL currency correctly', () => {
            const result = formatCurrency(100)
            expect(result).toContain('R$')
            expect(result).toContain('100')
        })

        it('should format zero', () => {
            const result = formatCurrency(0)
            expect(result).toContain('R$')
            expect(result).toContain('0')
        })

        it('should format decimal values', () => {
            const result = formatCurrency(49.90)
            expect(result).toContain('R$')
            expect(result).toContain('49')
        })
    })

    describe('formatDate', () => {
        it('should format ISO date string', () => {
            const result = formatDate('2026-01-15')
            expect(result).toBe('15/01/2026')
        })

        it('should return empty string for null/undefined', () => {
            expect(formatDate(null)).toBe('')
            expect(formatDate(undefined)).toBe('')
        })
    })

    describe('formatTime', () => {
        it('should return the time as-is', () => {
            expect(formatTime('14:30')).toBe('14:30')
        })

        it('should return empty string for null', () => {
            expect(formatTime(null)).toBe('')
        })
    })

    describe('formatDateTime', () => {
        it('should combine date and time', () => {
            const result = formatDateTime('2026-01-15', '14:30')
            expect(result).toContain('15/01/2026')
            expect(result).toContain('14:30')
            expect(result).toContain('às')
        })
    })
})

// ==================== WHATSAPP ====================
describe('WhatsApp', () => {
    describe('generateWhatsAppLink', () => {
        it('should generate correct link with message', () => {
            const link = generateWhatsAppLink('11999999999', 'Hello')
            expect(link).toBe('https://wa.me/5511999999999?text=Hello')
        })

        it('should not duplicate country code', () => {
            const link = generateWhatsAppLink('5511999999999')
            expect(link).toBe('https://wa.me/5511999999999')
        })

        it('should strip non-numeric characters', () => {
            const link = generateWhatsAppLink('(11) 99999-9999')
            expect(link).toBe('https://wa.me/5511999999999')
        })

        it('should generate link without message', () => {
            const link = generateWhatsAppLink('11999999999')
            expect(link).not.toContain('?text=')
        })
    })

    describe('generateReEngagementMessage', () => {
        it('should include customer name and days', () => {
            const msg = generateReEngagementMessage('João', 45)
            expect(msg).toContain('João')
            expect(msg).toContain('45')
        })
    })
})

// ==================== LOYALTY ====================
describe('Loyalty Program', () => {
    const tiers = [
        { name: 'Bronze', minPoints: 0, maxPoints: 99 },
        { name: 'Prata', minPoints: 100, maxPoints: 249 },
        { name: 'Ouro', minPoints: 250, maxPoints: 499 },
        { name: 'Diamante', minPoints: 500, maxPoints: Infinity },
    ]

    describe('calculateLoyaltyPoints', () => {
        it('should calculate points based on spending', () => {
            expect(calculateLoyaltyPoints(100)).toBe(50)
            expect(calculateLoyaltyPoints(200, 1)).toBe(200)
            expect(calculateLoyaltyPoints(0)).toBe(0)
        })

        it('should floor decimal results', () => {
            expect(calculateLoyaltyPoints(99)).toBe(49)
        })
    })

    describe('getTierByPoints', () => {
        it('should return correct tier for each range', () => {
            expect(getTierByPoints(0, tiers).name).toBe('Bronze')
            expect(getTierByPoints(50, tiers).name).toBe('Bronze')
            expect(getTierByPoints(100, tiers).name).toBe('Prata')
            expect(getTierByPoints(250, tiers).name).toBe('Ouro')
            expect(getTierByPoints(500, tiers).name).toBe('Diamante')
        })
    })

    describe('getNextTier', () => {
        it('should return next tier and points needed', () => {
            const result = getNextTier(80, tiers)
            expect(result.tier.name).toBe('Prata')
            expect(result.pointsNeeded).toBe(20)
        })

        it('should return null when at max tier', () => {
            expect(getNextTier(600, tiers)).toBeNull()
        })
    })
})

// ==================== TIME SLOTS ====================
describe('Time Slots', () => {
    describe('generateTimeSlots', () => {
        it('should generate slots for morning range', () => {
            const slots = generateTimeSlots('08:00', '12:00', 60)
            expect(slots).toEqual(['08:00', '09:00', '10:00', '11:00'])
        })

        it('should skip lunch break (12:00-14:00)', () => {
            const slots = generateTimeSlots('11:00', '15:00', 60)
            expect(slots).toContain('11:00')
            expect(slots).not.toContain('12:00')
            expect(slots).not.toContain('13:00')
            expect(slots).toContain('14:00')
        })

        it('should generate 30-min slots by default', () => {
            const slots = generateTimeSlots('08:00', '09:00', 30)
            expect(slots).toEqual(['08:00', '08:30'])
        })

        it('should respect custom duration', () => {
            const slots = generateTimeSlots('08:00', '10:00', 45)
            expect(slots.length).toBe(3) // 08:00, 08:45, 09:30
        })
    })

    describe('isSlotAvailable', () => {
        const appointments = [
            { barberId: 'b1', date: '2026-01-15', time: '14:00', status: 'confirmed' },
            { barberId: 'b1', date: '2026-01-15', time: '15:00', status: 'cancelled' },
            { barberId: 'b2', date: '2026-01-15', time: '14:00', status: 'confirmed' },
        ]

        it('should return true for empty slot', () => {
            expect(isSlotAvailable('16:00', appointments, 'b1', '2026-01-15')).toBe(true)
        })

        it('should return false for taken slot', () => {
            expect(isSlotAvailable('14:00', appointments, 'b1', '2026-01-15')).toBe(false)
        })

        it('should return true for cancelled appointment slot', () => {
            expect(isSlotAvailable('15:00', appointments, 'b1', '2026-01-15')).toBe(true)
        })

        it('should return true for different barber same time', () => {
            expect(isSlotAvailable('14:00', appointments, 'b3', '2026-01-15')).toBe(true)
        })

        it('should return true for different date same time', () => {
            expect(isSlotAvailable('14:00', appointments, 'b1', '2026-01-16')).toBe(true)
        })
    })
})

// ==================== STATUS HELPERS ====================
describe('Status Helpers', () => {
    describe('getStatusColor', () => {
        it('should return correct color for each status', () => {
            expect(getStatusColor('confirmed')).toContain('green')
            expect(getStatusColor('pending')).toContain('yellow')
            expect(getStatusColor('completed')).toContain('blue')
            expect(getStatusColor('cancelled')).toContain('red')
        })

        it('should return pending color for unknown status', () => {
            expect(getStatusColor('unknown')).toContain('yellow')
        })
    })

    describe('getStatusLabel', () => {
        it('should return Portuguese labels', () => {
            expect(getStatusLabel('confirmed')).toBe('Confirmado')
            expect(getStatusLabel('pending')).toBe('Pendente')
            expect(getStatusLabel('completed')).toBe('Concluído')
            expect(getStatusLabel('cancelled')).toBe('Cancelado')
        })

        it('should return raw status for unmapped values', () => {
            expect(getStatusLabel('xyz')).toBe('xyz')
        })
    })
})

// ==================== SORTING ====================
describe('Sorting', () => {
    describe('sortByDate', () => {
        const items = [
            { id: 1, date: '2026-03-15' },
            { id: 2, date: '2026-01-10' },
            { id: 3, date: '2026-02-20' },
        ]

        it('should sort ascending by default', () => {
            const sorted = sortByDate(items)
            expect(sorted[0].id).toBe(2)
            expect(sorted[1].id).toBe(3)
            expect(sorted[2].id).toBe(1)
        })

        it('should sort descending when specified', () => {
            const sorted = sortByDate(items, 'date', true)
            expect(sorted[0].id).toBe(1)
            expect(sorted[2].id).toBe(2)
        })

        it('should not mutate original array', () => {
            const original = [...items]
            sortByDate(items)
            expect(items).toEqual(original)
        })
    })

    describe('sortByName', () => {
        it('should sort alphabetically', () => {
            const items = [
                { name: 'Carlos' },
                { name: 'Ana' },
                { name: 'Bruno' },
            ]
            const sorted = sortByName(items)
            expect(sorted[0].name).toBe('Ana')
            expect(sorted[1].name).toBe('Bruno')
            expect(sorted[2].name).toBe('Carlos')
        })
    })
})

// ==================== FILTERING ====================
describe('Filtering', () => {
    describe('filterAbsentCustomers', () => {
        it('should filter customers absent for N+ days', () => {
            const today = new Date()
            const daysAgo = (n) => {
                const d = new Date(today)
                d.setDate(d.getDate() - n)
                return d.toISOString()
            }

            const customers = [
                { name: 'Recent', lastVisit: daysAgo(5) },
                { name: 'Old', lastVisit: daysAgo(45) },
                { name: 'VeryOld', lastVisit: daysAgo(90) },
                { name: 'NoVisit', lastVisit: null },
            ]

            const result = filterAbsentCustomers(customers, 30)
            expect(result.length).toBe(2)
            expect(result.map(c => c.name)).toContain('Old')
            expect(result.map(c => c.name)).toContain('VeryOld')
        })
    })

    describe('getDaysSinceLastVisit', () => {
        it('should return null for no last visit', () => {
            expect(getDaysSinceLastVisit(null)).toBeNull()
        })

        it('should return 0 for today', () => {
            const today = new Date().toISOString()
            expect(getDaysSinceLastVisit(today)).toBe(0)
        })
    })
})
