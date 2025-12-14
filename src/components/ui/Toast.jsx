import { X, CheckCircle, AlertCircle, Info, Gift } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'

const Toast = ({ id, message, type }) => {
    const { removeToast } = useToast()

    const configs = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-500/90',
            borderColor: 'border-green-500',
            iconColor: 'text-green-100',
        },
        error: {
            icon: AlertCircle,
            bgColor: 'bg-red-500/90',
            borderColor: 'border-red-500',
            iconColor: 'text-red-100',
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-500/90',
            borderColor: 'border-blue-500',
            iconColor: 'text-blue-100',
        },
        reward: {
            icon: Gift,
            bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
            borderColor: 'border-yellow-500',
            iconColor: 'text-yellow-100',
        },
    }

    const config = configs[type] || configs.info
    const Icon = config.icon

    return (
        <div
            className={`flex items-center gap-3 p-4 rounded-lg border-2 ${config.bgColor} ${config.borderColor} shadow-lg backdrop-blur-sm animate-slide-in-right`}
            style={{ minWidth: '300px', maxWidth: '400px' }}
        >
            <Icon className={config.iconColor} size={24} />
            <p className="flex-1 text-white font-medium text-sm">{message}</p>
            <button
                onClick={() => removeToast(id)}
                className="p-1 rounded hover:bg-white/20 transition-colors"
            >
                <X className="text-white" size={18} />
            </button>
        </div>
    )
}

export default Toast
