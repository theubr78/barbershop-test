import { useSubscription } from '../contexts/SubscriptionContext'
import BlockedPage from '../pages/BlockedPage'

const SubscriptionGate = ({ children }) => {
    const { loading, isBlocked } = useSubscription()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-accent-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Verificando assinatura...</p>
                </div>
            </div>
        )
    }

    if (isBlocked) {
        return <BlockedPage />
    }

    return children
}

export default SubscriptionGate
