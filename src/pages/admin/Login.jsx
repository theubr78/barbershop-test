import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Lock, Mail, AlertCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function Login() {
    const navigate = useNavigate()
    const { shopSlug } = useParams()
    const { login, error: authError } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!email || !password) {
            setError('Preencha todos os campos')
            return
        }

        try {
            setLoading(true)
            await login(email, password)
            navigate(`/${shopSlug}/admin`)
        } catch (err) {
            console.error('Login error:', err)
            setError('Email ou senha incorretos')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark via-dark-lighter to-dark p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-dark rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent mb-2">
                        Área Administrativa
                    </h1>
                    <p className="text-gray-400">
                        Acesse com suas credenciais
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8 rounded-3xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Alert */}
                        {(error || authError) && (
                            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-400">{error || authError}</p>
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray- 300 mb-2">
                                Email
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu-email@exemplo.com"
                                icon={Mail}
                                disabled={loading}
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Senha
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={Lock}
                                disabled={loading}
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Entrando...</span>
                                </div>
                            ) : (
                                'Entrar'
                            )}
                        </Button>
                    </form>

                    {/* Demo Credentials Info */}
                    <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-xl">
                        <p className="text-xs text-gray-400 text-center">
                            <strong className="text-accent">Demo:</strong> Configure suas credenciais no Firebase Console
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-400 hover:text-accent transition-colors"
                    >
                        ← Voltar para página inicial
                    </button>
                </div>
            </div>
        </div>
    )
}
