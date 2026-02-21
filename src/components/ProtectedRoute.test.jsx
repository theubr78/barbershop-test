import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import '@testing-library/jest-dom'

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        isAuthenticated: false,
        loading: false,
    }),
}))

import ProtectedRoute from './ProtectedRoute'

describe('ProtectedRoute (unauthenticated)', () => {
    it('should redirect to shop login when not authenticated and shopSlug exists', () => {
        render(
            <MemoryRouter initialEntries={['/my-shop/admin']}>
                <Routes>
                    <Route path="/:shopSlug/admin" element={
                        <ProtectedRoute>
                            <div>Protected Content</div>
                        </ProtectedRoute>
                    } />
                    <Route path="/:shopSlug/admin/login" element={<div data-testid="login">Login</div>} />
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByTestId('login')).toBeInTheDocument()
    })

    it('should redirect to master login when no shopSlug', () => {
        render(
            <MemoryRouter initialEntries={['/master']}>
                <Routes>
                    <Route path="/master" element={
                        <ProtectedRoute>
                            <div>Protected Content</div>
                        </ProtectedRoute>
                    } />
                    <Route path="/master/login" element={<div data-testid="master-login">Master Login</div>} />
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByTestId('master-login')).toBeInTheDocument()
    })
})
