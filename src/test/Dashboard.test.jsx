import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Dashboard from '../pages/admin/Dashboard'
import { BrowserRouter } from 'react-router-dom'

// Mock useApp
const mockAppointments = [
    {
        id: 'a1',
        date: new Date().toISOString().split('T')[0], // Today
        time: '14:00',
        status: 'confirmed',
        serviceId: 's1',
        barberId: 'b1',
        customerId: 'c1'
    },
    {
        id: 'a2',
        date: new Date().toISOString().split('T')[0], // Today
        time: '15:00',
        status: 'pending',
        serviceId: 's1',
        barberId: 'b1',
        customerId: 'c2'
    }
]

const mockStatistics = {
    today: { appointments: 2, revenue: 100 },
    week: { appointments: 10, revenue: 500 },
    month: { appointments: 40, revenue: 2000, newCustomers: 5 }
}

const mockCustomers = [
    { id: 'c1', name: 'John Doe', photo: 'url' },
    { id: 'c2', name: 'Jane Doe' }
]

vi.mock('../contexts/AppContext', async (importOriginal) => {
    return {
        useApp: () => ({
            appointments: mockAppointments,
            customers: mockCustomers,
            services: [{ id: 's1', name: 'Corte', price: 50 }],
            barbers: [{ id: 'b1', name: 'Barber Jack' }],
            statistics: mockStatistics,
            getServiceById: (id) => ({ id, name: 'Corte', price: 50 }),
            getBarberById: (id) => ({ id, name: 'Barber Jack' }),
            getCustomerById: (id) => mockCustomers.find(c => c.id === id)
        })
    }
})

describe('Admin Dashboard', () => {
    it('should render statistics correctly', () => {
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        )

        // Check stats
        expect(screen.getByText('Receita Hoje')).toBeInTheDocument()
        // We look for formatted currency. "100" -> "R$ 100,00" approx
        expect(screen.getByText(/100/)).toBeInTheDocument()

        const weeks = screen.getAllByText('Esta Semana')
        expect(weeks.length).toBeGreaterThan(0)
        expect(screen.getByText('10')).toBeInTheDocument() // Week appointments value
    })

    it('should render upcoming appointments', () => {
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        )

        expect(screen.getByText('Agenda de Hoje')).toBeInTheDocument()
        const johns = screen.getAllByText('John Doe')
        expect(johns.length).toBeGreaterThan(0)

        const janes = screen.getAllByText('Jane Doe')
        expect(janes.length).toBeGreaterThan(0)

        const times14 = screen.getAllByText('14:00')
        expect(times14.length).toBeGreaterThan(0)

        const times15 = screen.getAllByText('15:00')
        expect(times15.length).toBeGreaterThan(0)
    })
})
