import { AlertTriangle, Phone, Mail } from 'lucide-react'

const BlockedPage = () => {
    return (
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="text-red-500" size={48} />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-display font-bold text-white mb-3">
                    Acesso Suspenso
                </h1>

                {/* Description */}
                <p className="text-white/70 text-lg mb-8 leading-relaxed">
                    A assinatura desta barbearia está inativa devido a um pagamento pendente.
                    Para restaurar o acesso, regularize sua situação.
                </p>

                {/* Status Card */}
                <div className="glass-elevated rounded-xl p-6 mb-8 text-left">
                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                        O que aconteceu?
                    </h3>
                    <ul className="space-y-3 text-sm text-white/70">
                        <li className="flex items-start gap-3">
                            <span className="text-red-400 mt-0.5">•</span>
                            <span>Sua mensalidade não foi identificada pelo sistema</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-orange-400 mt-0.5">•</span>
                            <span>O período de carência de 3 dias foi excedido</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-green-400 mt-0.5">•</span>
                            <span>Ao regularizar, o acesso é restaurado automaticamente</span>
                        </li>
                    </ul>
                </div>

                {/* Contact */}
                <div className="space-y-3">
                    <p className="text-sm text-white/50">Entre em contato para regularizar:</p>
                    <div className="flex flex-col gap-2">
                        <a
                            href="https://wa.me/5500000000000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                        >
                            <Phone size={18} />
                            Falar via WhatsApp
                        </a>
                        <a
                            href="mailto:suporte@dexisdev.com"
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-dark-800 hover:bg-dark-700 text-white/80 font-medium border border-white/10 transition-colors"
                        >
                            <Mail size={18} />
                            Enviar Email
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-xs text-white/30 mt-8">
                    Se você acredita que isso é um erro, entre em contato conosco.
                </p>
            </div>
        </div>
    )
}

export default BlockedPage
