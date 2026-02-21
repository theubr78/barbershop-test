import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import SetupAdmin from './SetupAdmin'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import SubscriptionGate from './components/SubscriptionGate'
import ShopLayout from './components/ShopLayout'
import { BarbershopProvider } from './contexts/BarbershopContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { AppProvider } from './contexts/AppContext'

// Public Pages
import Landing from './pages/public/Landing'
import BookingFlow from './pages/public/BookingFlow'
import BookingConfirmation from './pages/public/BookingConfirmation'

// Admin Pages
import Login from './pages/admin/Login'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Agenda from './pages/admin/Agenda'
import Customers from './pages/admin/Customers'
import LoyaltyProgram from './pages/admin/LoyaltyProgram'
import Services from './pages/admin/Services'
import Barbers from './pages/admin/Barbers'

// Master Pages
import MasterLogin from './pages/master/MasterLogin'
import MasterDashboard from './pages/master/MasterDashboard'

function App() {
    return (
        <Router>
            <AuthProvider>
                <ToastProvider>
                    <Routes>
                        {/* Master Admin Routes (SaaS owner) */}
                        <Route path="/master/login" element={<MasterLogin />} />
                        <Route path="/master" element={
                            <ProtectedRoute>
                                <MasterDashboard />
                            </ProtectedRoute>
                        } />

                        {/* Explicit redirect for legacy /admin to master or setup */}
                        <Route path="/admin" element={<Navigate to="/master/login" replace />} />

                        {/* Setup Admin */}
                        <Route path="/setup-admin" element={<SetupAdmin />} />

                        {/* Shop-specific routes using ShopLayout */}
                        <Route path="/:shopSlug" element={<ShopLayout />}>
                            {/* Public Routes */}
                            <Route index element={
                                <SubscriptionGate>
                                    <Landing />
                                </SubscriptionGate>
                            } />
                            <Route path="agendar" element={
                                <SubscriptionGate>
                                    <BookingFlow />
                                </SubscriptionGate>
                            } />
                            <Route path="confirmacao/:id" element={
                                <SubscriptionGate>
                                    <BookingConfirmation />
                                </SubscriptionGate>
                            } />

                            {/* Admin Login */}
                            <Route path="admin/login" element={<Login />} />

                            {/* Protected Admin Routes */}
                            <Route path="admin" element={
                                <ProtectedRoute>
                                    <SubscriptionGate>
                                        <AdminLayout />
                                    </SubscriptionGate>
                                </ProtectedRoute>
                            }>
                                <Route index element={<Dashboard />} />
                                <Route path="agenda" element={<Agenda />} />
                                <Route path="clientes" element={<Customers />} />
                                <Route path="servicos" element={<Services />} />
                                <Route path="barbeiros" element={<Barbers />} />
                                <Route path="fidelidade" element={<LoyaltyProgram />} />
                            </Route>
                        </Route>
                        <Route path="/" element={
                            <BarbershopProvider>
                                <SubscriptionProvider>
                                    <AppProvider>
                                        <Landing />
                                    </AppProvider>
                                </SubscriptionProvider>
                            </BarbershopProvider>
                        } />
                    </Routes>
                </ToastProvider>
            </AuthProvider>
        </Router>
    )
}

export default App
