import { Link } from 'react-router-dom'
import { Trophy, Gift, Star, Home, CalendarDays, Users, Award as AwardIcon } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { formatCurrency, getTierByPoints } from '../../utils/helpers'

const LoyaltyProgram = () => {
    const { customers, loyaltyConfig } = useApp()

    // Sort customers by points
    const topCustomers = [...customers]
        .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
        .slice(0, 10)

    const getTierColor = (tierName) => {
        switch (tierName) {
            case 'Ouro': return 'text-yellow-500'
            case 'Prata': return 'text-gray-400'
            case 'Bronze': return 'text-orange-700'
            default: return 'text-white/60'
        }
    }

    const getTierBg = (tierName) => {
        switch (tierName) {
            case 'Ouro': return 'bg-yellow-500/20'
            case 'Prata': return 'bg-gray-400/20'
            case 'Bronze': return 'bg-orange-700/20'
            default: return 'bg-white/10'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-dark">
            {/* Header */}
            <div className="bg-dark-800 border-b border-white/10 p-4">
                <h1 className="text-2xl font-display font-bold text-white">Programa de Fidelidade</h1>
                <p className="text-sm text-white/60">Recompense seus melhores clientes</p>
            </div>

            <div className="p-4 pb-24 max-w-7xl mx-auto">
                {/* Program Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {loyaltyConfig.tiers.map((tier, index) => (
                        <Card key={index} className="relative overflow-hidden">
                            <div
                                className={`absolute top-0 right-0 w-20 h-20 ${getTierBg(tier.name)} rounded-full -mr-10 -mt-10 opacity-50`}
                            />
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-3 rounded-lg ${getTierBg(tier.name)}`}>
                                        <Trophy className={getTierColor(tier.name)} size={24} />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-bold ${getTierColor(tier.name)}`}>
                                            {tier.name}
                                        </h3>
                                        <p className="text-xs text-white/60">
                                            {tier.minPoints} - {tier.maxPoints === 9999 ? '∞' : tier.maxPoints} pontos
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {tier.benefits.map((benefit, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                                            <Star size={14} className="mt-0.5 flex-shrink-0 text-accent-purple" />
                                            <span>{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Rewards */}
                <Card className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Gift className="text-accent-purple" size={24} />
                        <h2 className="text-xl font-semibold text-white">Recompensas Disponíveis</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {loyaltyConfig.rewards.map((reward) => (
                            <div
                                key={reward.id}
                                className="p-4 rounded-lg bg-dark-900/50 border border-white/10 hover:border-accent-purple/50 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-white">{reward.name}</h3>
                                    <Badge variant="gold">{reward.pointsCost} pts</Badge>
                                </div>
                                <p className="text-sm text-white/60">{reward.description}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Top Customers Ranking */}
                <Card>
                    <div className="flex items-center gap-2 mb-6">
                        <Trophy className="text-accent-gold" size={24} />
                        <h2 className="text-xl font-semibold text-white">Top 10 Clientes Fiéis</h2>
                    </div>

                    <div className="space-y-3">
                        {topCustomers.map((customer, index) => {
                            const tier = getTierByPoints(customer.loyaltyPoints, loyaltyConfig.tiers)

                            return (
                                <div
                                    key={customer.id}
                                    className="flex items-center gap-4 p-4 rounded-lg bg-dark-900/30 hover:bg-dark-900/50 transition-colors"
                                >
                                    {/* Ranking */}
                                    <div className="flex-shrink-0 w-8 text-center">
                                        {index < 3 ? (
                                            <Trophy
                                                className={
                                                    index === 0 ? 'text-yellow-500' :
                                                        index === 1 ? 'text-gray-400' :
                                                            'text-orange-700'
                                                }
                                                size={24}
                                            />
                                        ) : (
                                            <span className="text-lg font-bold text-white/40">#{index + 1}</span>
                                        )}
                                    </div>

                                    {/* Customer Info */}
                                    <img
                                        src={customer.photo}
                                        alt={customer.name}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white truncate">{customer.name}</h3>
                                        <p className="text-sm text-white/60">
                                            {customer.visits} visitas • {formatCurrency(customer.totalSpent)} gastos
                                        </p>
                                    </div>

                                    {/* Points & Tier */}
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-xl font-bold text-accent-gold mb-1">
                                            {customer.loyaltyPoints}
                                        </div>
                                        <div className={`text-xs font-medium px-2 py-1 rounded ${getTierBg(tier.name)} ${getTierColor(tier.name)}`}>
                                            {tier.name}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>

                {/* Program Info */}
                <Card variant="glass" className="mt-6">
                    <h3 className="font-semibold text-white mb-3">ℹ️ Como Funciona</h3>
                    <ul className="space-y-2 text-sm text-white/70">
                        <li>• Clientes ganham <strong>1 ponto a cada R$ 2 gastos</strong></li>
                        <li>• Pontos nunca expiram</li>
                        <li>• Benefícios aumentam conforme o tier (Bronze → Prata → Ouro)</li>
                        <li>• Recompensas podem ser resgatadas a qualquer momento</li>
                    </ul>
                </Card>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-white/10 lg:hidden">
                <div className="flex items-center justify-around p-2">
                    {[
                        { icon: Home, label: 'Início', to: '/admin' },
                        { icon: CalendarDays, label: 'Agenda', to: '/admin/agenda' },
                        { icon: Users, label: 'Clientes', to: '/admin/clientes' },
                        { icon: AwardIcon, label: 'Fidelidade', to: '/admin/fidelidade' },
                    ].map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-colors flex-1"
                        >
                            <item.icon size={20} className={item.to === '/admin/fidelidade' ? 'text-accent-purple' : 'text-white/60'} />
                            <span className={`text-xs ${item.to === '/admin/fidelidade' ? 'text-accent-purple' : 'text-white/60'}`}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}

export default LoyaltyProgram
