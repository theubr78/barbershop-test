import { Gift, Sparkles } from 'lucide-react'

const FreeCutBadge = ({ count = 1, size = 'md', animated = true }) => {
    if (count <= 0) return null

    const sizes = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-2',
        lg: 'text-base px-4 py-2',
    }

    return (
        <div
            className={`
        inline-flex items-center gap-2 rounded-lg font-bold
        bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500
        text-gray-900 shadow-glow-gold border-2 border-yellow-600
        ${sizes[size]}
        ${animated ? 'animate-pulse-slow' : ''}
      `}
        >
            <Gift size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
            <span>
                {count} Corte{count > 1 ? 's' : ''} Grátis!
            </span>
            <Sparkles size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        </div>
    )
}

export default FreeCutBadge
