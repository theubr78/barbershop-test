import { Link } from 'react-router-dom'
import { Scissors, Clock, DollarSign, Home, CalendarDays, Users, Award } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { formatCurrency } from '../../utils/helpers'

const Services = () => {
    const { services } = useApp()

    const servicesByCategory = services.reduce((acc, service) => {
        if (!acc[service.category]) {
            acc[service.category] = []
        }
        acc[service.category].push(service)
        return acc
    }, {})

    return (
        <div className="min-h-screen bg-gradient-dark">
            {/* Header */}
            <div className="bg-dark-800 border-b border-white/10 p-4">
                <h1 className="text-2xl font-display font-bold text-white">Serviços</h1>
                <p className="text-sm text-white/60">Gerencie seu catálogo de serviços</p>
            </div>

            <div className="p-4 pb-24 max-w-7xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-accent-purple/20">
                                <Scissors className="text-accent-purple" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{services.length}</div>
                                <div className="text-xs text-white/60">Total de Serviços</div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <DollarSign className="text-green-500" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {formatCurrency(Math.min(...services.map(s => s.price)))}
                                </div>
                                <div className="text-xs text-white/60">Preço Mínimo</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <DollarSign className="text-blue-500" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {formatCurrency(Math.max(...services.map(s => s.price)))}
                                </div>
                                <div className="text-xs text-white/60">Preço Máximo</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Services by Category */}
                <div className="space-y-6">
                    {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                        <div key={category}>
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="text-gradient-primary">{category}</span>
                                <Badge variant="primary">{categoryServices.length}</Badge>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categoryServices.map((service) => (
                                    <Card key={service.id} hover>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3 mb-2">
                                                    <div className="p-2 rounded-lg bg-accent-purple/20 flex-shrink-0">
                                                        <Scissors className="text-accent-purple" size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-white mb-1">
                                                            {service.name}
                                                        </h3>
                                                        <p className="text-sm text-white/60">
                                                            {service.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            {service.active && (
                                                <Badge variant="success">Ativo</Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                            <div className="flex items-center gap-2 text-white/60 text-sm">
                                                <Clock size={16} />
                                                <span>{service.duration} minutos</span>
                                            </div>
                                            <div className="text-2xl font-bold text-gradient-primary">
                                                {formatCurrency(service.price)}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
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

export default Services
