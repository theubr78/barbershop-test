import { X, Check, Sparkles } from 'lucide-react'
import { formatCurrency, formatTime } from '../../utils/helpers'
import Button from '../ui/Button'

const ServiceCompletionModal = ({
    isOpen,
    onClose,
    appointment,
    customer,
    service,
    barber,
    onConfirm,
    onRedeemFreeCut
}) => {
    if (!isOpen || !appointment || !customer || !service || !barber) return null

    const hasFreeCut = customer.freeCutsAvailable > 0
    const cutsProgress = customer.loyaltyCuts || 0
    const willEarnReward = cutsProgress === 9

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative glass-elevated rounded-xl w-full max-w-md animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">Finalizar Serviço</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Free Cut Alert */}
                    {hasFreeCut && (
                        <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500 animate-pulse-slow">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="text-yellow-500" size={20} />
                                <h3 className="font-bold text-yellow-500">CLIENTE TEM CORTE GRÁTIS!</h3>
                            </div>
                            <p className="text-sm text-white/80 mb-3">
                                Este cliente possui {customer.freeCutsAvailable} corte{customer.freeCutsAvailable > 1 ? 's' : ''} grátis disponível{customer.freeCutsAvailable > 1 ? 'eis' : ''}.
                                Deseja aplicar agora?
                            </p>
                            <Button
                                onClick={() => {
                                    onRedeemFreeCut()
                                    onClose()
                                }}
                                variant="secondary"
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold"
                            >
                                Resgatar Corte Grátis
                            </Button>
                        </div>
                    )}

                    {/* Will Earn Reward Alert */}
                    {willEarnReward && !hasFreeCut && (
                        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-500">
                            <div className="flex items-center gap-2">
                                <Sparkles className="text-purple-400" size={20} />
                                <p className="text-sm font-bold text-purple-400">                  🎉 Este cliente vai GANHAR um corte grátis após este serviço!
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Service Summary */}
                    <div className="space-y-3">
                        <div>
                            <span className="text-xs text-white/60">Cliente</span>
                            <p className="text-white font-medium">{customer.name}</p>
                        </div>

                        <div>
                            <span className="text-xs text-white/60">Serviço</span>
                            <p className="text-white font-medium">{service.name}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <span className="text-xs text-white/60">Barbeiro</span>
                                <p className="text-white font-medium">{barber.name}</p>
                            </div>
                            <div>
                                <span className="text-xs text-white/60">Horário</span>
                                <p className="text-white font-medium">{formatTime(appointment.time)}</p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-white/10">
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Valor</span>
                                <span className="text-2xl font-bold text-gradient-primary">
                                    {formatCurrency(service.price)}
                                </span>
                            </div>
                        </div>

                        {/* Loyalty Progress */}
                        <div className="pt-3 border-t border-white/10">
                            <span className="text-xs text-white/60 mb-2 block">Progresso Fidelidade</span>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-dark-900 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                                        style={{ width: `${(cutsProgress / 10) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-bold text-yellow-500">
                                    {cutsProgress}/10
                                </span>
                            </div>
                            <p className="text-xs text-white/50 mt-1">
                                Após este serviço: {cutsProgress + 1}/10 cortes
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 border-t border-white/10">
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        icon={<Check size={20} />}
                        className="flex-1"
                    >
                        Confirmar
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ServiceCompletionModal
