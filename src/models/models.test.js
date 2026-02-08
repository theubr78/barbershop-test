import { describe, it, expect } from 'vitest'
import { Appointment } from './Appointment'
import { Customer } from './Customer'
import { Barber } from './Barber'

describe('Domain Models', () => {

    describe('Appointment Model', () => {
        it('should calculate revenue only when completed and not redeemed', () => {
            const pending = new Appointment({ status: 'pending', price: 50 })
            const confirmed = new Appointment({ status: 'confirmed', price: 50 })
            const cancelled = new Appointment({ status: 'cancelled', price: 50 })
            const completed = new Appointment({ status: 'completed', price: 50 })
            const freeCut = new Appointment({ status: 'completed', price: 50, redeemed: true })

            expect(pending.revenue).toBe(0)
            expect(confirmed.revenue).toBe(0)
            expect(cancelled.revenue).toBe(0)
            expect(completed.revenue).toBe(50)
            expect(freeCut.revenue).toBe(0)
        })

        it('should calculate projected revenue correctly', () => {
            const pending = new Appointment({ status: 'pending', price: 50 })
            const confirmed = new Appointment({ status: 'confirmed', price: 50 })
            const cancelled = new Appointment({ status: 'cancelled', price: 50 })
            const completed = new Appointment({ status: 'completed', price: 50 })
            const freeCut = new Appointment({ status: 'completed', price: 50, redeemed: true })

            expect(pending.projectedRevenue).toBe(50)
            expect(confirmed.projectedRevenue).toBe(50)
            expect(cancelled.projectedRevenue).toBe(0)
            expect(completed.projectedRevenue).toBe(50)
            expect(freeCut.projectedRevenue).toBe(0)
        })
    })

    describe('Customer Model', () => {
        it('should increment visits and loyalty points', () => {
            const customer = new Customer({
                name: 'John',
                loyaltyCuts: 5,
                totalSpent: 100
            })

            const result = customer.addVisit(50, '2023-01-01')

            expect(customer.visits).toBe(1) // incremented from 0 (default in constructor if not provided) or wait, constructor uses data.visits || 0. 
            // In my test data I didn't provide visits, so it was 0.

            expect(customer.totalSpent).toBe(150)
            expect(customer.loyaltyCuts).toBe(6)
            expect(result.reward).toBe(false)
        })

        it('should trigger reward on 10th cut', () => {
            const customer = new Customer({
                name: 'John',
                loyaltyCuts: 9,
                visits: 9
            })

            const result = customer.addVisit(50, '2023-01-01')

            expect(customer.loyaltyCuts).toBe(0) // Resets
            expect(customer.freeCutsAvailable).toBe(1)
            expect(result.reward).toBe(true)
        })

        it('should redeem free cut correctly', () => {
            const customer = new Customer({
                name: 'John',
                freeCutsAvailable: 1
            })

            const success = customer.redeemFreeCut()

            expect(success).toBe(true)
            expect(customer.freeCutsAvailable).toBe(0)
        })

        it('should fail to redeem if no free cuts', () => {
            const customer = new Customer({
                name: 'John',
                freeCutsAvailable: 0
            })

            const success = customer.redeemFreeCut()

            expect(success).toBe(false)
        })
    })

    describe('Barber Model', () => {
        it('should check availability correctly', () => {
            const barber = new Barber({
                id: '1',
                name: 'Barber 1',
                active: true,
                schedule: {
                    monday: { start: '09:00', end: '17:00' }
                }
            })

            // Mock appointments
            const appointments = [
                { barberId: '1', date: '2023-10-23', time: '10:00', status: 'confirmed' } // 2023-10-23 is Monday
            ]

            // Test 1: Wrong Day (Sunday)
            expect(barber.isAvailable('2023-10-22', '10:00', appointments)).toBe(false)

            // Test 2: Occupied Slot
            expect(barber.isAvailable('2023-10-23', '10:00', appointments)).toBe(false)

            // Test 3: Free Slot
            expect(barber.isAvailable('2023-10-23', '11:00', appointments)).toBe(true)

            // Test 4: Outside Hours
            expect(barber.isAvailable('2023-10-23', '08:00', appointments)).toBe(false)
        })
    })
})
