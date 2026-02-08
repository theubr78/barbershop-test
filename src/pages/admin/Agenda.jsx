import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Filter, ChevronLeft, ChevronRight, Home, CalendarDays, Users, Award } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../contexts/ToastContext'
import Card from '../../components/ui/Card'
import StatusDropdown from '../../components/admin/StatusDropdown'
import LoyaltyProgressBar from '../../components/ui/LoyaltyProgressBar'
import FreeCutBadge from '../../components/ui/FreeCutBadge'
import ServiceCompletionModal from '../../components/admin/ServiceCompletionModal'
import { formatCurrency } from '../../utils/helpers'

const Agenda = () => {
    const { appointments, getServiceById, getBarberById, getCustomerById, barbers, updateAppointment, completeService, redeemFreeCut } = useApp()
    const { showSuccess, showReward, showInfo } = useToast()

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedBarber, setSelectedBarber] = useState(null)
    const [completionModal, setCompletionModal] = useState({ isOpen: false, appointmentId: null })

    const dayAppointments = appointments
        .filter(a => {
            const matchesDate = a.date === selectedDate
            const matchesBarber = !selectedBarber || a.barberId === selectedBarber
            const notCancelled = a.status !== 'cancelled'
            return matchesDate && matchesBarber && notCancelled
        })
        .sort((a, b) => a.time.localeCompare(b.time))

    const navigateDate = (direction) => {
        const date = new Date(selectedDate)
        date.setDate(date.getDate() + direction)
        setSelectedDate(date.toISOString().split('T')[0])
    }

    const formatDateDisplay = (dateStr) => {
        const date = new Date(dateStr + 'T12:00:00')
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        if (dateStr === today.toISOString().split('T')[0]) {
            return 'Hoje'
        } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
            return 'Amanhã'
        }

        return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    }

    const handleStatusChange = (appointmentId, newStatus) => {
        if (newStatus === 'completed') {
            // Open modal for completion
            setCompletionModal({ isOpen: true, appointmentId })
        } else {
            updateAppointment(appointmentId, { status: newStatus })
            showInfo(`Status atualizado`)
        }
    }

    const handleConfirmCompletion = () => {
        const result = completeService(completionModal.appointmentId)

        if (result.reward) {
            showReward(`🎉 Parabéns! ${result.customer.name} ganhou um CORTE GRÁTIS!`)
        } else {
            showSuccess(`✅ Serviço finalizado! Fidelidade: ${result.progress}/10`)
        }

        setCompletionModal({ isOpen: false, appointmentId: null })
    }

    const handleRedeemFreeCut = () => {
        const apt = appointments.find(a => a.id === completionModal.appointmentId)
        if (apt) {
            const success = redeemFreeCut(apt.customerId, apt.appointmentId)
            if (success) {
                showSuccess('🎁 Corte grátis resgatado com sucesso!')
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-dark">
            {/* Header */}
            <div className="bg-dark-800 border-b border-white/10 p-4">
                <h1 className="text-2xl font-display font-bold text-white">Agenda</h1>
                <p className="text-sm text-white/60">Gerencie seus agendamentos e finalize serviços</p>
            </div>

            <div className="p-4 pb-24 max-w-7xl mx-auto">
                {/* Date Navigator */}
                <Card className="mb-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigateDate(-1)}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <ChevronLeft className="text-white/70" size={20} />
                        </button>

                        <div className="text-center">
                            <p className="text-lg font-semibold text-white capitalize">
                                {formatDateDisplay(selectedDate)}
                            </p>
                            <p className="text-sm text-white/60">
                                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </p>
                        </div>

                        <button
                            onClick={() => navigateDate(1)}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <ChevronRight className="text-white/70" size={20} />
                        </button>
                    </div>
                </Card>

                {/* Barber Filter */}
                <Card className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter size={16} className="text-white/60" />
                        <span className="text-sm text-white/70">Filtrar por barbeiro</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setSelectedBarber(null)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${!selectedBarber
                                ? 'bg-accent-purple text-white'
                                : 'bg-dark-900/50 text-white/60 hover:bg-dark-900'
                                }`}
                        >
                            Todos
                        </button>
                        {barbers.map((barber) => (
                            <button
                                key={barber.id}
                                onClick={() => setSelectedBarber(barber.id)}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${selectedBarber === barber.id
                                    ? 'bg-accent-purple text-white'
                                    : 'bg-dark-900/50 text-white/60 hover:bg-dark-900'
                                    }`}
                            >
                                {barber.name}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Appointments List */}
                <div className="space-y-3">
                    {dayAppointments.length > 0 ? (
                        dayAppointments.map((apt) => {
                            const service = getServiceById(apt.serviceId)
                            const barber = getBarberById(apt.barberId)
                            const customer = getCustomerById(apt.customerId)
                            const hasFreeCut = customer?.freeCutsAvailable > 0

                            return (
                                <Card
                                    key={apt.id}
                                    hover
                                    className={`relative ${hasFreeCut ? 'border-2 border-yellow-500 shadow-glow-gold' : ''}`}
                                >
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${hasFreeCut ? 'bg-yellow-500' : 'bg-accent-purple'}`} />
                                    <div className="pl-4">
                                        {/* Free Cut Alert */}
                                        {hasFreeCut && (
                                            <div className="mb-3">
                                                <FreeCutBadge count={customer.freeCutsAvailable} />
                                            </div>
                                        )}

                                        <div className="flex items-start gap-4">
                                            {/* Time */}
                                            <div className="flex-shrink-0 text-center">
                                                <div className="text-2xl font-bold text-white">{apt.time.split(':')[0]}</div>
                                                <div className="text-sm text-white/60">{apt.time.split(':')[1]}</div>
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white">{customer?.name}</h3>
                                                        <p className="text-sm text-white/60">{customer?.phone}</p>
                                                    </div>
                                                    <StatusDropdown
                                                        currentStatus={apt.status}
                                                        onStatusChange={(newStatus) => handleStatusChange(apt.id, newStatus)}
                                                        disabled={apt.status === 'completed'}
                                                    />
                                                </div>

                                                {/* Loyalty Progress */}
                                                {customer && (
                                                    <div className="mb-3">
                                                        <LoyaltyProgressBar
                                                            cuts={customer.loyaltyCuts || 0}
                                                            size="sm"
                                                        />
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-white/60">Serviço: </span>
                                                        <span className="text-white">{service?.name}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-white/60">Barbeiro: </span>
                                                        <span className="text-white">{barber?.name}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-white/60">Duração: </span>
                                                        <span className="text-white">{service?.duration} min</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-white/60">Valor: </span>
                                                        <span className="text-white font-semibold">{formatCurrency(service?.price)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })
                    ) : (
                        <Card className="text-center py-12">
                            <Calendar className="mx-auto mb-4 text-white/30" size={48} />
                            <p className="text-white/60">Nenhum agendamento para este dia</p>
                        </Card>
                    )}
                </div>
            </div>

            {/* Service Completion Modal */}
            <ServiceCompletionModal
                isOpen={completionModal.isOpen}
                onClose={() => setCompletionModal({ isOpen: false, appointmentId: null })}
                appointment={appointments.find(a => a.id === completionModal.appointmentId)}
                customer={getCustomerById(appointments.find(a => a.id === completionModal.appointmentId)?.customerId)}
                service={getServiceById(appointments.find(a => a.id === completionModal.appointmentId)?.serviceId)}
                barber={getBarberById(appointments.find(a => a.id === completionModal.appointmentId)?.barberId)}
                onConfirm={handleConfirmCompletion}
                onRedeemFreeCut={handleRedeemFreeCut}
            />

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-white/10 lg:hidden">
                <div className="flex items-center justify-around p-2">
                    {[
                        { icon: Home, label: 'Início', to: '/admin' },
                        { icon: CalendarDays, label: 'Agenda', to: '/admin/agenda' },
                        { icon: Users, label: 'Clientes', to: '/admin/clientes' },
                        { icon: Award, label: 'Fidelidade', to: '/admin/fidelidade' },
                    ].map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-colors flex-1"
                        >
                            <item.icon size={20} className={item.to === '/admin/agenda' ? 'text-accent-purple' : 'text-white/60'} />
                            <span className={`text-xs ${item.to === '/admin/agenda' ? 'text-accent-purple' : 'text-white/60'}`}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}

export default Agenda
