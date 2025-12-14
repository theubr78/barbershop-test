import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import { ToastProvider } from './contexts/ToastContext'
import ToastContainer from './components/ui/ToastContainer'

// Public Pages
import Landing from './pages/public/Landing'
import BookingFlow from './pages/public/BookingFlow'
import BookingConfirmation from './pages/public/BookingConfirmation'

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import Agenda from './pages/admin/Agenda'
import Customers from './pages/admin/Customers'
import LoyaltyProgram from './pages/admin/LoyaltyProgram'
import Services from './pages/admin/Services'
import Barbers from './pages/admin/Barbers'

function App() {
    return (
        <ToastProvider>
            <AppProvider>
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Landing />} />
                        <Route path="/agendar" element={<BookingFlow />} />
                        <Route path="/confirmacao/:id" element={<BookingConfirmation />} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<Dashboard />} />
                        <Route path="/admin/agenda" element={<Agenda />} />
                        <Route path="/admin/clientes" element={<Customers />} />
                        <Route path="/admin/fidelidade" element={<LoyaltyProgram />} />
                        <Route path="/admin/servicos" element={<Services />} />
                        <Route path="/admin/barbeiros" element={<Barbers />} />
                    </Routes>
                </Router>
                <ToastContainer />
            </AppProvider>
        </ToastProvider>
    )
}

export default App
