import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import '@testing-library/jest-dom'

// Mock all contexts
vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        isAuthenticated: true,
        loading: false,
        logout: vi.fn(),
    }),
}))

vi.mock('../../contexts/BarbershopContext', () => ({
    useBarbershop: () => ({
        barbershopId: 'test-shop',
        barbershop: { id: 'test-shop', name: 'Test Barber', active: true },
        loading: false,
    }),
    BarbershopProvider: ({ children }) => children,
}))

vi.mock('../../contexts/SubscriptionContext', () => ({
    useSubscription: () => ({
        isActive: true,
        loading: false,
        status: 'active',
    }),
    SubscriptionProvider: ({ children }) => children,
}))

vi.mock('../../contexts/AppContext', () => ({
    useApp: () => ({
        appointments: [],
        customers: [],
        services: [],
        barbers: [],
        statistics: { today: {}, week: {}, month: { revenue: 0 } },
        getServiceById: vi.fn(),
        getBarberById: vi.fn(),
        getCustomerById: vi.fn(),
    }),
    AppProvider: ({ children }) => children,
}))

vi.mock('../../contexts/ToastContext', () => ({
    useToast: () => ({
        showSuccess: vi.fn(),
        showError: vi.fn(),
    }),
}))

vi.mock('../../services/firebaseService', () => ({
    db: {},
    auth: {},
}))

import AdminLayout from './AdminLayout'

describe('AdminLayout', () => {
    const renderWithRouter = (path = '/test-shop/admin') => {
        return render(
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/:shopSlug/admin" element={<AdminLayout />}>
                        <Route index element={<div data-testid="dashboard-page">Dashboard Page</div>} />
                        <Route path="agenda" element={<div data-testid="agenda-page">Agenda Page</div>} />
                        <Route path="servicos" element={<div data-testid="servicos-page">Serviços Page</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        )
    }

    it('should render sidebar nav items', () => {
        renderWithRouter()
        // Use getAllByText since "Dashboard" appears in both sidebar and Outlet
        const dashboardLinks = screen.getAllByText('Dashboard')
        expect(dashboardLinks.length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText('Agenda')).toBeInTheDocument()
        expect(screen.getByText('Clientes')).toBeInTheDocument()
        expect(screen.getByText('Serviços')).toBeInTheDocument()
        expect(screen.getByText('Barbeiros')).toBeInTheDocument()
        expect(screen.getByText('Fidelidade')).toBeInTheDocument()
    })

    it('should render nav links with correct shopSlug paths', () => {
        renderWithRouter()
        const agendaLink = screen.getByText('Agenda').closest('a')
        expect(agendaLink).toHaveAttribute('href', '/test-shop/admin/agenda')

        const servicosLink = screen.getByText('Serviços').closest('a')
        expect(servicosLink).toHaveAttribute('href', '/test-shop/admin/servicos')

        const clientesLink = screen.getByText('Clientes').closest('a')
        expect(clientesLink).toHaveAttribute('href', '/test-shop/admin/clientes')
    })

    it('should render the Sair button', () => {
        renderWithRouter()
        expect(screen.getByText('Sair')).toBeInTheDocument()
    })

    it('should render child route content via Outlet', () => {
        renderWithRouter('/test-shop/admin')
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    })
})
