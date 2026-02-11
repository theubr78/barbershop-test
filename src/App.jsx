import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SetupAdmin from './SetupAdmin'
import { AuthProvider } from './contexts/AuthContext'
import { BarbershopProvider } from './contexts/BarbershopContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { AppProvider } from './contexts/AppContext'
import { ToastProvider } from './contexts/ToastContext'
import ToastContainer from './components/ui/ToastContainer'
import ProtectedRoute from './components/ProtectedRoute'
import SubscriptionGate from './components/SubscriptionGate'

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

                        {/* Setup Admin */}
                        <Route path="/setup-admin" element={<SetupAdmin />} />

                        {/* Shop-specific routes wrapped in BarbershopProvider */}
                        <Route path="/:shopSlug/*" element={
                            <BarbershopProvider>
                                <SubscriptionProvider>
                                    <AppProvider>
                                        <Routes>
                                            {/* Public Routes (blocked if subscription inactive) */}
                                            <Route path="/" element={
                                                <SubscriptionGate>
                                                    <Landing />
                                                </SubscriptionGate>
                                            } />
                                            <Route path="/agendar" element={
                                                <SubscriptionGate>
                                                    <BookingFlow />
                                                </SubscriptionGate>
                                            } />
                                            <Route path="/confirmacao/:id" element={
                                                <SubscriptionGate>
                                                    <BookingConfirmation />
                                                </SubscriptionGate>
                                            } />

                                            {/* Admin Login */}
                                            <Route path="/admin/login" element={<Login />} />

                                            {/* Protected Admin Routes */}
                                            <Route path="/admin" element={
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
                                        </Routes>
                                        <ToastContainer />
                                    </AppProvider>
                                </SubscriptionProvider>
                            </BarbershopProvider>
                        } />

                        {/* Root landing (fallback to demo) */}
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
