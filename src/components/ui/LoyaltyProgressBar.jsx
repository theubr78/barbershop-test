const LoyaltyProgressBar = ({ cuts = 0, size = 'md', className = '' }) => {
    const progress = (cuts / 10) * 100
    const isNearReward = cuts >= 8

    const sizes = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
    }

    return (
        <div className={`w-full ${className}`}>
            {/* Progress Text */}
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/70">
                    Progresso Fidelidade
                </span>
                <span className={`text-xs font-bold ${isNearReward ? 'text-yellow-500 animate-pulse' : 'text-white'}`}>
                    {cuts}/10 Cortes
                </span>
            </div>

            {/* Progress Bar */}
            <div className={`w-full ${sizes[size]} bg-dark-900 rounded-full overflow-hidden border border-white/10`}>
                <div
                    className={`h-full transition-all duration-500 ${isNearReward
                            ? 'bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 shadow-glow-gold'
                            : 'bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-500'
                        }`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Near Reward Message */}
            {isNearReward && (
                <p className="text-xs text-yellow-500 mt-1 animate-pulse">
                    🔥 Quase lá! Faltam {10 - cuts} corte{10 - cuts > 1 ? 's' : ''}!
                </p>
            )}
        </div>
    )
}

export default LoyaltyProgressBar
