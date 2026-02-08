import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BookingFlow from '../pages/public/BookingFlow'
import { AppProvider } from '../contexts/AppContext'
import { BrowserRouter } from 'react-router-dom'

// Mock the AppContext
const mockAddAppointment = vi.fn()
const mockAddCustomer = vi.fn()

const mockServices = [
    { id: 's1', name: 'Corte de Cabelo', price: 50, duration: 30, active: true },
    { id: 's2', name: 'Barba', price: 30, duration: 20, active: true },
]

const mockBarbers = [
    {
        id: 'b1',
        name: 'Carlos',
        active: true,
        photo: 'url-to-photo',
        schedule: {
            monday: { start: '09:00', end: '18:00' },
            tuesday: { start: '09:00', end: '18:00' },
            wednesday: { start: '09:00', end: '18:00' },
            thursday: { start: '09:00', end: '18:00' },
            friday: { start: '09:00', end: '18:00' },
            saturday: { start: '09:00', end: '18:00' },
            sunday: { start: '09:00', end: '18:00' }
        },
        specialties: ['Corte', 'Barba']
    }
]

// Mock the useApp hook
vi.mock('../contexts/AppContext', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useApp: () => ({
            services: mockServices,
            barbers: mockBarbers,
            appointments: [],
            addAppointment: mockAddAppointment,
            addCustomer: mockAddCustomer,
            customers: []
        })
    }
})

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

describe('BookingFlow Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset mocks returns
        mockAddCustomer.mockResolvedValue({ id: 'c1' })
        mockAddAppointment.mockResolvedValue({ id: 'a1' })
    })

    it('should complete a booking flow successfully', async () => {
        render(
            <BrowserRouter>
                <BookingFlow />
            </BrowserRouter>
        )

        // Step 1: Select Service
        expect(screen.getByText('Agende seu')).toBeInTheDocument()
        fireEvent.click(screen.getByText('Corte de Cabelo'))
        fireEvent.click(screen.getByText('Próximo'))

        // Step 2: Select Barber
        expect(screen.getByText('Carlos')).toBeInTheDocument()
        fireEvent.click(screen.getByText('Carlos'))
        fireEvent.click(screen.getByText('Próximo'))

        // Step 3: Select Date & Time
        // We need to find a date that corresponds to a working day (Mon-Fri)
        // Since the component generates dates dynamically, we'll try to click the first available date
        // and check if slots appear.

        // Find date buttons (they contain day numbers)
        // We'll just click the first available date button
        const dateButtons = screen.getAllByRole('button').filter(btn =>
            btn.className.includes('p-3 rounded-lg border')
        )

        // Click the first date
        if (dateButtons.length > 0) {
            fireEvent.click(dateButtons[0])
        }

        // Wait for time slots to appear
        await waitFor(() => {
            expect(screen.getByText('Horários Disponíveis')).toBeInTheDocument()
        })

        // Click a time slot (e.g. 10:00)
        // If 09:00 is too early or passed, we look for any time
        const timeButtons = screen.getAllByRole('button').filter(btn =>
            btn.textContent.includes(':')
        )
        if (timeButtons.length > 0) {
            fireEvent.click(timeButtons[0]) // Select first available time
        }

        fireEvent.click(screen.getByText('Próximo'))

        // Step 4: Customer Data
        expect(screen.getByText('Seus Dados')).toBeInTheDocument()

        fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'Test User' } })
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByLabelText(/Telefone/i), { target: { value: '(11) 99999-9999' } })

        // Submit
        fireEvent.click(screen.getByText('Confirmar Agendamento'))

        // Verify calls
        await waitFor(() => {
            expect(mockAddCustomer).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Test User',
                email: 'test@example.com',
                phone: '(11) 99999-9999'
            }))

            expect(mockAddAppointment).toHaveBeenCalledWith(expect.objectContaining({
                customerId: 'c1',
                barberId: 'b1',
                serviceId: 's1',
                status: 'pending'
            }))

            expect(mockNavigate).toHaveBeenCalledWith('/confirmacao/a1')
        })
    })

    it('should show error if validation fails', async () => {
        render(
            <BrowserRouter>
                <BookingFlow />
            </BrowserRouter>
        )

        // Skip to step 4 (using helper state manipulation - technically difficult in integration test without exposing state)
        // So we have to click through again.

        // Step 1
        fireEvent.click(screen.getByText('Barba'))
        fireEvent.click(screen.getByText('Próximo'))

        // Step 2
        fireEvent.click(screen.getByText('Carlos'))
        fireEvent.click(screen.getByText('Próximo'))

        // Step 3
        const dateButtons = screen.getAllByRole('button').filter(btn =>
            btn.className.includes('p-3')
        )
        if (dateButtons.length > 0) fireEvent.click(dateButtons[0])

        await waitFor(() => screen.findByText('Horários Disponíveis'))

        const timeButtons = screen.getAllByRole('button').filter(btn => btn.textContent.includes(':'))
        if (timeButtons.length > 0) fireEvent.click(timeButtons[0])

        fireEvent.click(screen.getByText('Próximo'))

        // Step 4 - Submit without data
        fireEvent.click(screen.getByText('Confirmar Agendamento'))

        // Expect errors
        expect(await screen.findByText('Nome deve ter pelo menos 3 caracteres')).toBeInTheDocument()
        expect(mockAddAppointment).not.toHaveBeenCalled()
    })
})
