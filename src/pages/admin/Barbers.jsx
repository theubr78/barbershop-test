import { Link } from 'react-router-dom'
import { User, Star, Clock, Home, CalendarDays, Users, Award } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const Barbers = () => {
    const { barbers, appointments } = useApp()

    // Calculate stats for each barber
    const barbersWithStats = barbers.map(barber => {
        const barberAppointments = appointments.filter(a => a.barberId === barber.id)
        const completedAppointments = barberAppointments.filter(a => a.status === 'completed')

        return {
            ...barber,
            totalAppointments: barberAppointments.length,
            completedAppointments: completedAppointments.length,
        }
    })

    const getScheduleInfo = (schedule) => {
        const workingDays = Object.entries(schedule).filter(([_, time]) => time !== null)
        const dayNames = {
            monday: 'Seg',
            tuesday: 'Ter',
            wednesday: 'Qua',
            thursday: 'Qui',
            friday: 'Sex',
            saturday: 'Sáb',
            sunday: 'Dom',
        }

        return workingDays.map(([day]) => dayNames[day]).join(', ')
    }

    return (
        <div className="min-h-screen bg-gradient-dark">
            {/* Header */}
            <div className="bg-dark-800 border-b border-white/10 p-4">
                <h1 className="text-2xl font-display font-bold text-white">Barbeiros</h1>
                <p className="text-sm text-white/60">Gerencie sua equipe</p>
            </div>

            <div className="p-4 pb-24 max-w-7xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-accent-purple/20">
                                <User className="text-accent-purple" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{barbers.length}</div>
                                <div className="text-xs text-white/60">Total de Barbeiros</div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <Star className="text-green-500" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {barbers.filter(b => b.active).length}
                                </div>
                                <div className="text-xs text-white/60">Ativos</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <Clock className="text-blue-500" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {appointments.length}
                                </div>
                                <div className="text-xs text-white/60">Agendamentos Total</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Barbers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {barbersWithStats.map((barber) => (
                        <Card key={barber.id} hover className="relative">
                            {/* Active Badge */}
                            {barber.active && (
                                <div className="absolute top-4 right-4">
                                    <Badge variant="success">Ativo</Badge>
                                </div>
                            )}

                            {/* Profile */}
                            <div className="flex flex-col items-center text-center mb-4">
                                <img
                                    src={barber.photo}
                                    alt={barber.name}
                                    className="w-24 h-24 rounded-full mb-4 border-4 border-accent-purple object-cover"
                                />
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {barber.name}
                                </h3>
                                <p className="text-sm text-white/60 mb-4">
                                    {barber.bio}
                                </p>
                            </div>

                            {/* Specialties */}
                            <div className="mb-4">
                                <p className="text-xs text-white/60 mb-2">Especialidades:</p>
                                <div className="flex flex-wrap gap-2">
                                    {barber.specialties.map((specialty, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 rounded-full text-xs bg-accent-purple/20 text-accent-purple"
                                        >
                                            {specialty}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className="mb-4 p-3 rounded-lg bg-dark-900/50 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="text-white/60" size={14} />
                                    <span className="text-xs text-white/60">Horário de Trabalho</span>
                                </div>
                                <p className="text-sm text-white">{getScheduleInfo(barber.schedule)}</p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-white">{barber.totalAppointments}</div>
                                    <div className="text-xs text-white/60">Agendamentos</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-accent-purple">{barber.completedAppointments}</div>
                                    <div className="text-xs text-white/60">Concluídos</div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

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
                            <item.icon size={20} className="text-white/60" />
                            <span className="text-xs text-white/60">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}

export default Barbers
