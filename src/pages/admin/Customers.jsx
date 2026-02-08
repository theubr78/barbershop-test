import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Search,
    UserPlus,
    MessageCircle,
    TrendingDown,
    Home,
    CalendarDays,
    Users as UsersIcon,
    Award,
    Phone,
    Mail
} from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import {
    getDaysSinceLastVisit,
    filterAbsentCustomers,
    generateWhatsAppLink,
    generateReEngagementMessage,
    formatCurrency
} from '../../utils/helpers'

const Customers = () => {
    const { customers } = useApp()
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState('all') // all, absent, active

    // Filter logic
    const filteredCustomers = customers.filter(customer => {
        // Search filter
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase())

        if (!matchesSearch) return false

        // Status filter
        if (filter === 'absent') {
            const daysAbsent = getDaysSinceLastVisit(customer.lastVisit)
            return daysAbsent !== null && daysAbsent >= 30
        }
        if (filter === 'active') {
            const daysAbsent = getDaysSinceLastVisit(customer.lastVisit)
            return daysAbsent === null || daysAbsent < 30
        }

        return true
    })

    const absentCustomers = filterAbsentCustomers(customers, 30)

    const getTierBadgeVariant = (tier) => {
        switch (tier) {
            case 'Ouro': return 'gold'
            case 'Prata': return 'primary'
            case 'Bronze': return 'primary'
            default: return 'primary'
        }
    }

    const handleWhatsAppContact = (customer) => {
        const daysAbsent = getDaysSinceLastVisit(customer.lastVisit)
        let message = ''

        if (daysAbsent && daysAbsent >= 30) {
            message = generateReEngagementMessage(customer.name, daysAbsent)
        } else {
            message = `Olá ${customer.name}! 👋 Tudo bem? Como podemos ajudar você hoje?`
        }

        const link = generateWhatsAppLink(customer.phone, message)
        window.open(link, '_blank')
    }

    return (
        <div className="min-h-screen bg-gradient-dark">
            {/* Header */}
            <div className="bg-dark-800 border-b border-white/10 p-4">
                <h1 className="text-2xl font-display font-bold text-white">Clientes</h1>
                <p className="text-sm text-white/60">Gerencie sua base de clientes</p>
            </div>

            <div className="p-4 pb-24 max-w-7xl mx-auto">
                {/* Absent Customers Alert */}
                {absentCustomers.length > 0 && (
                    <Card className="mb-4 bg-orange-500/10 border-orange-500/30">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/20">
                                <TrendingDown className="text-orange-500" size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-1">
                                    Clientes Ausentes
                                </h3>
                                <p className="text-sm text-white/70 mb-3">
                                    Você tem <strong>{absentCustomers.length} {absentCustomers.length === 1 ? 'cliente' : 'clientes'}</strong> sem visitar há mais de 30 dias
                                </p>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setFilter('absent')}
                                >
                                    Ver Clientes Ausentes
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Search & Filters */}
                <div className="mb-4 space-y-3">
                    <Input
                        placeholder="Buscar por nome, telefone ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<Search size={18} />}
                    />

                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${filter === 'all'
                                ? 'bg-accent-purple text-white'
                                : 'bg-dark-900/50 text-white/60 hover:bg-dark-900'
                                }`}
                        >
                            Todos ({customers.length})
                        </button>
                        <button
                            onClick={() => setFilter('absent')}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${filter === 'absent'
                                ? 'bg-accent-purple text-white'
                                : 'bg-dark-900/50 text-white/60 hover:bg-dark-900'
                                }`}
                        >
                            Ausentes ({absentCustomers.length})
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${filter === 'active'
                                ? 'bg-accent-purple text-white'
                                : 'bg-dark-900/50 text-white/60 hover:bg-dark-900'
                                }`}
                        >
                            Ativos ({customers.length - absentCustomers.length})
                        </button>
                    </div>
                </div>

                {/* Customers List */}
                <div className="space-y-3">
                    {filteredCustomers.map((customer) => {
                        const daysAbsent = getDaysSinceLastVisit(customer.lastVisit)
                        const isAbsent = daysAbsent !== null && daysAbsent >= 30

                        return (
                            <Card key={customer.id} hover className={isAbsent ? 'border-orange-500/30' : ''}>
                                <div className="flex items-start gap-4">
                                    {/* Photo */}
                                    <img
                                        src={customer.photo}
                                        alt={customer.name}
                                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                    />

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-1">
                                                    {customer.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-2 text-xs text-white/60">
                                                    <span className="flex items-center gap-1">
                                                        <Phone size={12} />
                                                        {customer.phone}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Mail size={12} />
                                                        {customer.email}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge variant={getTierBadgeVariant(customer.tier)}>
                                                {customer.tier}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                                            <div>
                                                <span className="text-white/60">Visitas: </span>
                                                <span className="text-white font-medium">{customer.visits}</span>
                                            </div>
                                            <div>
                                                <span className="text-white/60">Total Gasto: </span>
                                                <span className="text-white font-medium">{formatCurrency(customer.totalSpent)}</span>
                                            </div>
                                            <div>
                                                <span className="text-white/60">Pontos: </span>
                                                <span className="text-white font-medium">{customer.loyaltyPoints}</span>
                                            </div>
                                            <div>
                                                <span className="text-white/60">Última Visita: </span>
                                                <span className={`font-medium ${isAbsent ? 'text-orange-500' : 'text-white'}`}>
                                                    {daysAbsent ? `${daysAbsent} dias atrás` : new Date(customer.lastVisit).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={isAbsent ? 'primary' : 'secondary'}
                                                onClick={() => handleWhatsAppContact(customer)}
                                                icon={<MessageCircle size={16} />}
                                            >
                                                {isAbsent ? 'Reengajar via WhatsApp' : 'WhatsApp'}
                                            </Button>
                                        </div>

                                        {customer.notes && (
                                            <p className="text-sm text-white/60 italic mt-2">
                                                💡 {customer.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )
                    })}

                    {filteredCustomers.length === 0 && (
                        <Card className="text-center py-12">
                            <UsersIcon className="mx-auto mb-4 text-white/30" size={48} />
                            <p className="text-white/60">Nenhum cliente encontrado</p>
                        </Card>
                    )}
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-white/10 lg:hidden">
                <div className="flex items-center justify-around p-2">
                    {[
                        { icon: Home, label: 'Início', to: '/admin' },
                        { icon: CalendarDays, label: 'Agenda', to: '/admin/agenda' },
                        { icon: UsersIcon, label: 'Clientes', to: '/admin/clientes' },
                        { icon: Award, label: 'Fidelidade', to: '/admin/fidelidade' },
                    ].map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-colors flex-1"
                        >
                            <item.icon size={20} className={item.to === '/admin/clientes' ? 'text-accent-purple' : 'text-white/60'} />
                            <span className={`text-xs ${item.to === '/admin/clientes' ? 'text-accent-purple' : 'text-white/60'}`}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}

export default Customers
