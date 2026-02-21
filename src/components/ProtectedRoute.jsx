import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth()
    const { shopSlug } = useParams()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Verificando autenticação...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        const loginPath = shopSlug ? `/${shopSlug}/admin/login` : '/master/login'
        return <Navigate to={loginPath} replace />
    }

    return children
}
