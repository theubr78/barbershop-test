import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Scissors, User, Calendar, Clock, Phone } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { formatCurrency, validatePhone, validateName, generateTimeSlots, isSlotAvailable } from '../../utils/helpers'

const BookingFlow = () => {
    const navigate = useNavigate()
    const { services, barbers, appointments, addAppointment, addCustomer, customers } = useApp()

    const [step, setStep] = useState(1)
    const [selectedService, setSelectedService] = useState(null)
    const [selectedBarber, setSelectedBarber] = useState(null)
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTime, setSelectedTime] = useState('')
    const [customerData, setCustomerData] = useState({
        name: '',
        phone: '',
    })
    const [errors, setErrors] = useState({})

    // Load from LocalStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('barber_user_data')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setCustomerData(prev => ({ ...prev, ...parsed }))
            } catch (e) {
                console.error('Error loading saved data', e)
            }
        }
    }, [])

    const activeServices = services.filter(s => s.active)
    const activeBarbers = barbers.filter(b => b.active)

    // Generate available dates (next 14 days)
    const getAvailableDates = () => {
        const dates = []
        for (let i = 0; i < 14; i++) {
            const date = new Date()
            date.setDate(date.getDate() + i)
            dates.push(date.toISOString().split('T')[0])
        }
        return dates
    }

    // Get available time slots
    const getAvailableTimeSlots = () => {
        if (!selectedBarber || !selectedDate) return []

        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(selectedDate + 'T12:00:00').getDay()]
        const schedule = selectedBarber.schedule[dayOfWeek]

        if (!schedule) return []

        const slots = generateTimeSlots(schedule.start, schedule.end, schedule.interval || 30)
        return slots.filter(slot => isSlotAvailable(slot, appointments, selectedBarber.id, selectedDate))
    }

    const handlePhoneBlur = () => {
        if (!customerData.phone || customerData.phone.length < 10) return

        // CLEAN phone for comparison
        const cleanPhone = customerData.phone.replace(/\D/g, '')

        // Find in loaded customers (AppContext has them)
        const found = customers.find(c => c.phone.replace(/\D/g, '') === cleanPhone)

        if (found) {
            setCustomerData(prev => ({ ...prev, name: found.name }))
            // Optional: Toast "Welcome back"
        }
    }

    const handleNext = async () => {
        if (step === 4) {
            // Validate customer data
            const newErrors = {}
            if (!validateName(customerData.name)) {
                newErrors.name = 'Nome deve ter pelo menos 3 caracteres'
            }
            if (!validatePhone(customerData.phone)) {
                newErrors.phone = 'Telefone inválido'
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors)
                return
            }

            try {
                // Save to LocalStorage
                localStorage.setItem('barber_user_data', JSON.stringify({
                    name: customerData.name,
                    phone: customerData.phone
                }))

                // Create customer and appointment (both are async!)
                const customer = await addCustomer(customerData)
                const appointment = await addAppointment({
                    customerId: customer.id,
                    barberId: selectedBarber.id,
                    serviceId: selectedService.id,
                    date: selectedDate,
                    time: selectedTime,
                    status: 'pending',
                })

                navigate(`/confirmacao/${appointment.id}`)
            } catch (error) {
                console.error('Error creating booking:', error)
                setErrors({ general: 'Erro ao criar agendamento. Tente novamente.' })
            }
        } else {
            setStep(step + 1)
        }
    }

    const canProceed = () => {
        switch (step) {
            case 1: return selectedService !== null
            case 2: return selectedBarber !== null
            case 3: return selectedDate && selectedTime
            case 4: return true
            default: return false
        }
    }

    const steps = [
        { number: 1, label: 'Serviço', icon: Scissors },
        { number: 2, label: 'Barbeiro', icon: User },
        { number: 3, label: 'Data/Hora', icon: Calendar },
        { number: 4, label: 'Dados', icon: Phone },
    ]

    return (
        <div className="min-h-screen bg-gradient-dark py-12">
            <div className="container-custom max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => step === 1 ? navigate('/') : setStep(step - 1)}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft size={20} />
                        Voltar
                    </button>

                    <h1 className="text-4xl font-display font-bold mb-8 text-center">
                        Agende seu <span className="text-gradient-primary">Horário</span>
                    </h1>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between max-w-2xl mx-auto mb-12">
                        {steps.map((s, index) => (
                            <div key={s.number} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${step >= s.number
                                            ? 'border-accent-purple bg-accent-purple text-white'
                                            : 'border-white/20 text-white/40'
                                            }`}
                                    >
                                        {step > s.number ? <Check size={20} /> : <s.icon size={20} />}
                                    </div>
                                    <span className={`text-xs mt-2 ${step >= s.number ? 'text-white' : 'text-white/40'}`}>
                                        {s.label}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`h-0.5 flex-1 mx-2 ${step > s.number ? 'bg-accent-purple' : 'bg-white/20'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 1: Service Selection */}
                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        {activeServices.map((service) => (
                            <Card
                                key={service.id}
                                hover
                                className={`cursor-pointer transition-all ${selectedService?.id === service.id
                                    ? 'border-accent-purple border-2 shadow-glow'
                                    : ''
                                    }`}
                                onClick={() => setSelectedService(service)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white mb-2">
                                            {service.name}
                                        </h3>
                                        <p className="text-sm text-white/60 mb-3">
                                            {service.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1 text-white/60">
                                                <Clock size={16} />
                                                {service.duration} min
                                            </div>
                                            <div className="text-xl font-bold text-accent-purple">
                                                {formatCurrency(service.price)}
                                            </div>
                                        </div>
                                    </div>
                                    <Scissors className={`${selectedService?.id === service.id ? 'text-accent-purple' : 'text-white/40'}`} size={24} />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Step 2: Barber Selection */}
                {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                        {activeBarbers.map((barber) => (
                            <Card
                                key={barber.id}
                                hover
                                className={`cursor-pointer text-center transition-all ${selectedBarber?.id === barber.id
                                    ? 'border-accent-purple border-2 shadow-glow'
                                    : ''
                                    }`}
                                onClick={() => setSelectedBarber(barber)}
                            >
                                <img
                                    src={barber.photo}
                                    alt={barber.name}
                                    className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-accent-purple object-cover"
                                />
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {barber.name}
                                </h3>
                                <p className="text-xs text-white/60 mb-3 line-clamp-2">
                                    {barber.bio}
                                </p>
                                <div className="flex flex-wrap gap-1 justify-center">
                                    {barber.specialties.slice(0, 2).map((specialty, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 rounded-full text-xs bg-accent-purple/20 text-accent-purple"
                                        >
                                            {specialty}
                                        </span>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Step 3: Date & Time Selection */}
                {step === 3 && (
                    <div className="max-w-3xl mx-auto animate-fade-in">
                        <Card className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Selecione a Data</h3>
                            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                                {getAvailableDates().map((date) => {
                                    const dateObj = new Date(date + 'T12:00:00')
                                    const day = dateObj.getDate()
                                    const weekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')

                                    return (
                                        <button
                                            key={date}
                                            onClick={() => {
                                                setSelectedDate(date)
                                                setSelectedTime('')
                                            }}
                                            className={`p-3 rounded-lg border transition-all ${selectedDate === date
                                                ? 'border-accent-purple bg-accent-purple/20 text-white'
                                                : 'border-white/20 text-white/70 hover:border-white/40'
                                                }`}
                                        >
                                            <div className="text-xs opacity-70 uppercase tracking-wider">{weekday}</div>
                                            <div className="text-lg font-bold">{day}</div>
                                        </button>
                                    )
                                })}
                            </div>
                        </Card>

                        {selectedDate && (
                            <Card>
                                <h3 className="text-lg font-semibold text-white mb-4">Horários Disponíveis</h3>
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                    {getAvailableTimeSlots().map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`p-3 rounded-lg border transition-all ${selectedTime === time
                                                ? 'border-accent-purple bg-accent-purple/20 text-white'
                                                : 'border-white/20 text-white/70 hover:border-white/40'
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                                {getAvailableTimeSlots().length === 0 && (
                                    <p className="text-white/60 text-center py-4">
                                        Nenhum horário disponível para esta data
                                    </p>
                                )}
                            </Card>
                        )}
                    </div>
                )}

                {/* Step 4: Customer Data */}
                {step === 4 && (
                    <div className="max-w-2xl mx-auto animate-fade-in">
                        <Card>
                            <h3 className="text-lg font-semibold text-white mb-6">Seus Dados</h3>
                            <div className="space-y-4">
                                <Input
                                    label="Nome Completo"
                                    type="text"
                                    value={customerData.name}
                                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                                    error={errors.name}
                                    id="name"
                                    placeholder="João Silva"
                                />
                                <Input
                                    label="Telefone (WhatsApp)"
                                    type="tel"
                                    value={customerData.phone}
                                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                                    onBlur={handlePhoneBlur}
                                    error={errors.phone}
                                    id="phone"
                                    placeholder="(11) 98765-4321"
                                />
                            </div>

                            {/* Summary */}
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <h4 className="text-sm font-semibold text-white/70 mb-3">Resumo do Agendamento</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Serviço:</span>
                                        <span className="text-white font-medium">{selectedService?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Barbeiro:</span>
                                        <span className="text-white font-medium">{selectedBarber?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Data/Hora:</span>
                                        <span className="text-white font-medium">
                                            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')} às {selectedTime}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-white/10">
                                        <span className="text-white/60">Valor:</span>
                                        <span className="text-xl font-bold text-accent-purple">{formatCurrency(selectedService?.price)}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-end gap-4 mt-8">
                    <Button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        size="lg"
                        icon={step === 4 ? <Check size={20} /> : <ArrowRight size={20} />}
                        iconPosition="right"
                    >
                        {step === 4 ? 'Confirmar Agendamento' : 'Próximo'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default BookingFlow
