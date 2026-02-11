import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SetupAdmin from './SetupAdmin'
import { AuthProvider } from './contexts/AuthContext'
import { BarbershopProvider } from './contexts/BarbershopContext'
import { AppProvider } from './contexts/AppContext'
import { ToastProvider } from './contexts/ToastContext'
import ToastContainer from './components/ui/ToastContainer'
import ProtectedRoute from './components/ProtectedRoute'

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

function App() {
    return (
        <Router>
            <AuthProvider>
                <BarbershopProvider>
                    <ToastProvider>
                        <AppProvider>
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/setup-admin" element={<SetupAdmin />} />
                                <Route path="/" element={<Landing />} />
                                <Route path="/agendar" element={<BookingFlow />} />
                                <Route path="/confirmacao/:id" element={<BookingConfirmation />} />

                                {/* Admin Login */}
                                <Route path="/admin/login" element={<Login />} />

                                {/* Protected Admin Routes (nested under AdminLayout) */}
                                <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
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
                    </ToastProvider>
                </BarbershopProvider>
            </AuthProvider>
        </Router>
    )
}

export default App
