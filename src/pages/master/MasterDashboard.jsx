import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../services/firebaseService'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import {
    Store,
    Plus,
    Search,
    CheckCircle,
    AlertTriangle,
    XCircle,
    LogOut,
    ExternalLink,
    DollarSign,
    Users
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

const MasterDashboard = () => {
    const { logout } = useAuth()
    const { showSuccess, showError } = useToast()
    const navigate = useNavigate()

    const [shops, setShops] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [creating, setCreating] = useState(false)

    const [form, setForm] = useState({
        shopName: '',
        shopSlug: '',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        ownerCpfCnpj: '',
    })

    useEffect(() => {
        loadShops()
    }, [])

    const loadShops = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'barbershops'))
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setShops(data)
        } catch (err) {
            console.error('Error loading shops:', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredShops = shops.filter(shop =>
        shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleCreateShop = async (e) => {
        e.preventDefault()
        setCreating(true)

        try {
            const response = await fetch('/api/create-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_MASTER_API_KEY}`,
                },
                body: JSON.stringify(form),
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error)

            showSuccess(`Barbearia "${form.shopName}" criada com sucesso!`)
            setModalOpen(false)
            setForm({ shopName: '', shopSlug: '', ownerName: '', ownerEmail: '', ownerPhone: '', ownerCpfCnpj: '' })
            loadShops()
        } catch (err) {
            showError(`Erro: ${err.message}`)
        } finally {
            setCreating(false)
        }
    }

    const handleSlugGenerate = (name) => {
        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        setForm({ ...form, shopName: name, shopSlug: slug })
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge variant="success"><CheckCircle size={12} className="mr-1" /> Ativo</Badge>
            case 'overdue':
                return <Badge variant="primary" className="!bg-orange-500/20 !text-orange-400"><AlertTriangle size={12} className="mr-1" /> Inadimplente</Badge>
            case 'suspended':
            case 'cancelled':
                return <Badge variant="primary" className="!bg-red-500/20 !text-red-400"><XCircle size={12} className="mr-1" /> Suspenso</Badge>
            default:
                return <Badge variant="primary">Pendente</Badge>
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate('/master/login')
    }

    const activeShops = shops.filter(s => s.subscription?.status === 'active').length
    const totalRevenue = activeShops * 97

    return (
        <div className="min-h-screen bg-gradient-dark">
            {/* Header */}
            <header className="bg-dark-800 border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white">Master Admin</h1>
                    <p className="text-sm text-white/50">Gerenciamento de barbearias</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => setModalOpen(true)} icon={<Plus size={18} />}>
                        Nova Barbearia
                    </Button>
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <div className="p-6 max-w-7xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-accent-purple/20">
                                <Store className="text-accent-purple" size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{shops.length}</p>
                                <p className="text-xs text-white/60">Total de barbearias</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-green-500/20">
                                <CheckCircle className="text-green-500" size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{activeShops}</p>
                                <p className="text-xs text-white/60">Assinaturas ativas</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-accent-gold/20">
                                <DollarSign className="text-accent-gold" size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">R$ {totalRevenue.toFixed(2)}</p>
                                <p className="text-xs text-white/60">Receita mensal estimada</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Search */}
                <div className="mb-4">
                    <Input
                        placeholder="Buscar barbearia por nome ou slug..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<Search size={18} />}
                    />
                </div>

                {/* Shops List */}
                <div className="space-y-3">
                    {loading ? (
                        <Card className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-accent-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-white/60">Carregando...</p>
                        </Card>
                    ) : filteredShops.length === 0 ? (
                        <Card className="text-center py-12">
                            <Store className="mx-auto mb-4 text-white/30" size={48} />
                            <p className="text-white/60 mb-4">Nenhuma barbearia cadastrada</p>
                            <Button onClick={() => setModalOpen(true)} icon={<Plus size={18} />}>
                                Cadastrar Primeira Barbearia
                            </Button>
                        </Card>
                    ) : (
                        filteredShops.map((shop) => (
                            <Card key={shop.id} hover>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-dark-900 flex items-center justify-center flex-shrink-0">
                                            <Store className="text-white/40" size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-semibold text-white truncate">{shop.name}</h3>
                                            <p className="text-sm text-white/50">/{shop.slug}</p>
                                            {shop.ownerName && (
                                                <p className="text-xs text-white/40 flex items-center gap-1 mt-1">
                                                    <Users size={12} /> {shop.ownerName}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        {getStatusBadge(shop.subscription?.status)}
                                        <a
                                            href={`/${shop.slug}/admin`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                            title="Abrir painel"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Create Shop Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Nova Barbearia"
                size="md"
            >
                <form onSubmit={handleCreateShop} className="space-y-4">
                    <Input
                        label="Nome da Barbearia"
                        placeholder="Ex: Barbearia do João"
                        value={form.shopName}
                        onChange={(e) => handleSlugGenerate(e.target.value)}
                        required
                    />
                    <Input
                        label="Slug (URL)"
                        placeholder="barbearia-do-joao"
                        value={form.shopSlug}
                        onChange={(e) => setForm({ ...form, shopSlug: e.target.value })}
                        required
                    />
                    <p className="text-xs text-white/40 -mt-2">
                        URL: seusite.netlify.app/<strong>{form.shopSlug || '...'}</strong>
                    </p>

                    <hr className="border-white/10" />

                    <Input
                        label="Nome do Proprietário"
                        placeholder="João Silva"
                        value={form.ownerName}
                        onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="joao@email.com"
                        value={form.ownerEmail}
                        onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                        required
                    />
                    <Input
                        label="Telefone (WhatsApp)"
                        placeholder="(11) 98765-4321"
                        value={form.ownerPhone}
                        onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                        required
                    />
                    <Input
                        label="CPF/CNPJ"
                        placeholder="000.000.000-00"
                        value={form.ownerCpfCnpj}
                        onChange={(e) => setForm({ ...form, ownerCpfCnpj: e.target.value })}
                    />

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1" disabled={creating || !form.shopName || !form.shopSlug || !form.ownerName}>
                            {creating ? 'Criando...' : 'Criar Barbearia + Assinatura'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default MasterDashboard
