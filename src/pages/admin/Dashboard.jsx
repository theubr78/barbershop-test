import { Link } from 'react-router-dom'
import {
    Calendar,
    CalendarDays,
    Users,
    TrendingUp,
    Clock,
    DollarSign,
    UserPlus,
    Scissors,
    BarChart3,
    Award
} from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { formatCurrency, formatDate, formatTime } from '../../utils/helpers'

const Dashboard = () => {
    const { appointments, customers, services, barbers, statistics, getServiceById, getBarberById, getCustomerById } = useApp()

    const today = new Date().toISOString().split('T')[0]
    const todayAppointments = appointments.filter(a => a.date === today && a.status !== 'cancelled')
    const upcomingAppointments = appointments
        .filter(a => a.date >= today && a.status !== 'cancelled')
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
        .slice(0, 5)

    const stats = [
        {
            label: 'Hoje',
            value: statistics.today.appointments,
            icon: Calendar,
            color: 'text-accent-purple',
            bgColor: 'bg-accent-purple/20',
            trend: '+12%',
        },
        {
            label: 'Receita Realizada',
            value: formatCurrency(statistics.today.revenue),
            icon: DollarSign,
            color: 'text-green-500',
            bgColor: 'bg-green-500/20',
            trend: '+8%',
        },
        {
            label: 'Clientes',
            value: customers.length,
            icon: Users,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/20',
            trend: `+${statistics.month.newCustomers}`,
        },
        {
            label: 'Esta Semana',
            value: statistics.week.appointments,
            icon: TrendingUp,
            color: 'text-accent-gold',
            bgColor: 'bg-accent-gold/20',
            trend: '+15%',
        },
    ]

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'success'
            case 'pending': return 'primary'
            case 'completed': return 'primary'
            default: return 'primary'
        }
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'confirmed': return 'Confirmado'
            case 'pending': return 'Pendente'
            case 'completed': return 'Concluído'
            case 'cancelled': return 'Cancelado'
            default: return status
        }
    }

    return (
        <div>
            {/* Mobile Header */}
            <div className="bg-dark-800 border-b border-white/10 p-4">
                <h1 className="text-2xl font-display font-bold text-white">
                    Dashboard
                </h1>
                <p className="text-sm text-white/60">Bem-vindo de volta!</p>
            </div>

            <div className="p-4 pb-6 max-w-7xl mx-auto">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {stats.map((stat, index) => (
                        <Card key={index} className="relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-20 h-20 ${stat.bgColor} rounded-full -mr-10 -mt-10 opacity-50`} />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                        <stat.icon className={stat.color} size={20} />
                                    </div>
                                    <span className="text-xs text-green-500 font-medium">{stat.trend}</span>
                                </div>
                                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-xs text-white/60">{stat.label}</div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Today's Schedule */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Clock size={20} className="text-accent-purple" />
                                Agenda de Hoje
                            </h2>
                            <Link to="/admin/agenda">
                                <button className="text-sm text-accent-purple hover:text-accent-purple/80">
                                    Ver Tudo
                                </button>
                            </Link>
                        </div>

                        {todayAppointments.length > 0 ? (
                            <div className="space-y-3">
                                {todayAppointments.map((apt) => {
                                    const service = getServiceById(apt.serviceId)
                                    const barber = getBarberById(apt.barberId)
                                    const customer = getCustomerById(apt.customerId)

                                    return (
                                        <div
                                            key={apt.id}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-dark-900/50 border border-white/5"
                                        >
                                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                                                <Scissors className="text-accent-purple" size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {customer?.name}
                                                </p>
                                                <p className="text-xs text-white/60 truncate">
                                                    {service?.name} • {barber?.name}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0 text-right">
                                                <p className="text-sm font-semibold text-white">{apt.time}</p>
                                                <Badge variant={getStatusColor(apt.status)} className="text-xs mt-1">
                                                    {getStatusLabel(apt.status)}
                                                </Badge>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-white/50">
                                <Calendar className="mx-auto mb-2 opacity-50" size={32} />
                                <p className="text-sm">Nenhum agendamento para hoje</p>
                            </div>
                        )}
                    </Card>

                    {/* Revenue Chart (Simplified) */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <BarChart3 size={20} className="text-accent-gold" />
                                Receita Mensal
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-end justify-between h-40 gap-2">
                                {[45, 65, 55, 75, 70, 85, 95].map((height, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full bg-gradient-primary rounded-t-lg transition-all hover:opacity-80"
                                            style={{ height: `${height}%` }}
                                        />
                                        <span className="text-xs text-white/40">
                                            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][index]}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <div>
                                    <p className="text-xs text-white/60">Receita Realizada (Mês)</p>
                                    <p className="text-2xl font-bold text-white">
                                        {formatCurrency(statistics.month.revenue)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-white/60">Esta Semana</p>
                                    <p className="text-xl font-semibold text-accent-gold">
                                        {formatCurrency(statistics.week.revenue)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Recent Activity & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Próximos Agendamentos */}
                    <Card className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Próximos Agendamentos</h2>
                            <Link to="/admin/agenda">
                                <button className="text-sm text-accent-purple hover:text-accent-purple/80">
                                    Ver Agenda
                                </button>
                            </Link>
                        </div>

                        <div className="space-y-2">
                            {upcomingAppointments.map((apt) => {
                                const service = getServiceById(apt.serviceId)
                                const barber = getBarberById(apt.barberId)
                                const customer = getCustomerById(apt.customerId)

                                return (
                                    <div
                                        key={apt.id}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        {customer?.photo && (
                                            <img
                                                src={customer.photo}
                                                alt={customer.name}
                                                className="w-10 h-10 rounded-lg object-cover"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white">{customer?.name}</p>
                                            <p className="text-xs text-white/60">
                                                {service?.name} • {barber?.name}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0 text-right">
                                            <p className="text-xs text-white/60">{formatDate(apt.date, 'dd/MM')}</p>
                                            <p className="text-sm font-medium text-white">{apt.time}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h2>
                        <div className="space-y-2">
                            <Link to="/admin/agenda">
                                <button className="w-full p-3 rounded-lg bg-dark-900/50 hover:bg-dark-900 border border-white/10 flex items-center gap-3 transition-colors">
                                    <CalendarDays className="text-accent-purple" size={20} />
                                    <span className="text-sm text-white">Ver Agenda</span>
                                </button>
                            </Link>
                            <Link to="/admin/clientes">
                                <button className="w-full p-3 rounded-lg bg-dark-900/50 hover:bg-dark-900 border border-white/10 flex items-center gap-3 transition-colors">
                                    <Users className="text-blue-500" size={20} />
                                    <span className="text-sm text-white">Clientes</span>
                                </button>
                            </Link>
                            <Link to="/admin/fidelidade">
                                <button className="w-full p-3 rounded-lg bg-dark-900/50 hover:bg-dark-900 border border-white/10 flex items-center gap-3 transition-colors">
                                    <Award className="text-accent-gold" size={20} />
                                    <span className="text-sm text-white">Fidelidade</span>
                                </button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
