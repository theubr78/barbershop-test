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
    Users,
    Pencil,
    Ban,
    Power,
    Trash2,
    Shield
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

const API_KEY = import.meta.env.VITE_MASTER_API_KEY

const apiCall = async (url, method, body = null) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
        },
    }
    if (body) options.body = JSON.stringify(body)
    const res = await fetch(url, options)
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro na requisição')
    return data
}

const MasterDashboard = () => {
    const { logout } = useAuth()
    const { showSuccess, showError } = useToast()
    const navigate = useNavigate()

    const [shops, setShops] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Create modal
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const [createForm, setCreateForm] = useState({
        shopName: '', shopSlug: '', ownerName: '', ownerEmail: '', ownerPhone: '', ownerCpfCnpj: '',
    })

    // Edit modal
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [editingShop, setEditingShop] = useState(null)
    const [saving, setSaving] = useState(false)
    const [editForm, setEditForm] = useState({
        shopName: '', ownerName: '', ownerEmail: '', ownerPhone: '', ownerCpfCnpj: '',
    })

    // Delete modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deletingShop, setDeletingShop] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState('')
    const [deleting, setDeleting] = useState(false)

    // Action loading
    const [actionLoading, setActionLoading] = useState(null)

    useEffect(() => { loadShops() }, [])

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

    // --- Create ---
    const handleCreateShop = async (e) => {
        e.preventDefault()
        setCreating(true)
        try {
            await apiCall('/api/create-subscription', 'POST', createForm)
            showSuccess(`Barbearia "${createForm.shopName}" criada com sucesso!`)
            setCreateModalOpen(false)
            setCreateForm({ shopName: '', shopSlug: '', ownerName: '', ownerEmail: '', ownerPhone: '', ownerCpfCnpj: '' })
            loadShops()
        } catch (err) {
            showError(`Erro: ${err.message}`)
        } finally {
            setCreating(false)
        }
    }

    const handleSlugGenerate = (name) => {
        const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        setCreateForm({ ...createForm, shopName: name, shopSlug: slug })
    }

    // --- Edit ---
    const openEdit = (shop) => {
        setEditingShop(shop)
        setEditForm({
            shopName: shop.name || '',
            ownerName: shop.ownerName || '',
            ownerEmail: shop.ownerEmail || '',
            ownerPhone: shop.ownerPhone || '',
            ownerCpfCnpj: shop.ownerCpfCnpj || '',
        })
        setEditModalOpen(true)
    }

    const handleEdit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await apiCall(`/api/manage-subscription?shopId=${editingShop.id}`, 'PATCH', {
                action: 'edit',
                ...editForm,
            })
            showSuccess('Informações atualizadas!')
            setEditModalOpen(false)
            loadShops()
        } catch (err) {
            showError(`Erro: ${err.message}`)
        } finally {
            setSaving(false)
        }
    }

    // --- Suspend / Activate ---
    const handleToggleStatus = async (shop) => {
        const isSuspending = shop.subscription?.status !== 'suspended'
        const action = isSuspending ? 'suspend' : 'activate'
        const label = isSuspending ? 'suspender' : 'reativar'

        if (!confirm(`Tem certeza que deseja ${label} "${shop.name}"?`)) return

        setActionLoading(shop.id)
        try {
            await apiCall(`/api/manage-subscription?shopId=${shop.id}`, 'PATCH', { action })
            showSuccess(isSuspending ? `"${shop.name}" suspensa!` : `"${shop.name}" reativada!`)
            loadShops()
        } catch (err) {
            showError(`Erro: ${err.message}`)
        } finally {
            setActionLoading(null)
        }
    }

    // --- Delete ---
    const openDelete = (shop) => {
        setDeletingShop(shop)
        setDeleteConfirm('')
        setDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await apiCall(`/api/manage-subscription?shopId=${deletingShop.id}`, 'DELETE')
            showSuccess(`"${deletingShop.name}" excluída permanentemente!`)
            setDeleteModalOpen(false)
            loadShops()
        } catch (err) {
            showError(`Erro: ${err.message}`)
        } finally {
            setDeleting(false)
        }
    }

    // --- Helpers ---
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
                    <Button onClick={() => setCreateModalOpen(true)} icon={<Plus size={18} />}>
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
                            <Button onClick={() => setCreateModalOpen(true)} icon={<Plus size={18} />}>
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
                                                    {shop.ownerEmail && <span className="text-white/30 ml-2">• {shop.ownerEmail}</span>}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {getStatusBadge(shop.subscription?.status)}

                                        {/* Edit */}
                                        <button
                                            onClick={() => openEdit(shop)}
                                            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-blue-400 transition-colors"
                                            title="Editar informações"
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        {/* Suspend/Activate */}
                                        <button
                                            onClick={() => handleToggleStatus(shop)}
                                            disabled={actionLoading === shop.id}
                                            className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${shop.subscription?.status === 'suspended'
                                                    ? 'text-green-400/60 hover:text-green-400'
                                                    : 'text-white/40 hover:text-orange-400'
                                                }`}
                                            title={shop.subscription?.status === 'suspended' ? 'Reativar' : 'Suspender'}
                                        >
                                            {actionLoading === shop.id ? (
                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : shop.subscription?.status === 'suspended' ? (
                                                <Power size={16} />
                                            ) : (
                                                <Ban size={16} />
                                            )}
                                        </button>

                                        {/* Delete */}
                                        <button
                                            onClick={() => openDelete(shop)}
                                            className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                                            title="Excluir permanentemente"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        {/* External Link */}
                                        <a
                                            href={`/${shop.slug}/admin`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
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

            {/* ===== CREATE MODAL ===== */}
            <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Nova Barbearia" size="md">
                <form onSubmit={handleCreateShop} className="space-y-4">
                    <Input label="Nome da Barbearia" placeholder="Ex: Barbearia do João" value={createForm.shopName} onChange={(e) => handleSlugGenerate(e.target.value)} required />
                    <Input label="Slug (URL)" placeholder="barbearia-do-joao" value={createForm.shopSlug} onChange={(e) => setCreateForm({ ...createForm, shopSlug: e.target.value })} required />
                    <p className="text-xs text-white/40 -mt-2">URL: seusite.netlify.app/<strong>{createForm.shopSlug || '...'}</strong></p>
                    <hr className="border-white/10" />
                    <Input label="Nome do Proprietário" placeholder="João Silva" value={createForm.ownerName} onChange={(e) => setCreateForm({ ...createForm, ownerName: e.target.value })} required />
                    <Input label="Email" type="email" placeholder="joao@email.com" value={createForm.ownerEmail} onChange={(e) => setCreateForm({ ...createForm, ownerEmail: e.target.value })} required />
                    <Input label="Telefone (WhatsApp)" placeholder="(11) 98765-4321" value={createForm.ownerPhone} onChange={(e) => setCreateForm({ ...createForm, ownerPhone: e.target.value })} required />
                    <Input label="CPF/CNPJ" placeholder="000.000.000-00" value={createForm.ownerCpfCnpj} onChange={(e) => setCreateForm({ ...createForm, ownerCpfCnpj: e.target.value })} />
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setCreateModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="flex-1" disabled={creating || !createForm.shopName || !createForm.shopSlug || !createForm.ownerName}>
                            {creating ? 'Criando...' : 'Criar Barbearia + Assinatura'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* ===== EDIT MODAL ===== */}
            <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Editar — ${editingShop?.name}`} size="md">
                <form onSubmit={handleEdit} className="space-y-4">
                    <Input label="Nome da Barbearia" value={editForm.shopName} onChange={(e) => setEditForm({ ...editForm, shopName: e.target.value })} required />
                    <Input label="Nome do Proprietário" value={editForm.ownerName} onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })} required />
                    <Input label="Email" type="email" value={editForm.ownerEmail} onChange={(e) => setEditForm({ ...editForm, ownerEmail: e.target.value })} required />
                    <Input label="Telefone (WhatsApp)" value={editForm.ownerPhone} onChange={(e) => setEditForm({ ...editForm, ownerPhone: e.target.value })} required />
                    <Input label="CPF/CNPJ" value={editForm.ownerCpfCnpj} onChange={(e) => setEditForm({ ...editForm, ownerCpfCnpj: e.target.value })} />

                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs text-white/50">
                            <Shield size={12} className="inline mr-1" />
                            O slug (URL) não pode ser alterado para evitar quebra de links.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="flex-1" disabled={saving}>
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* ===== DELETE CONFIRMATION MODAL ===== */}
            <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Excluir Barbearia" size="md">
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-400 font-medium mb-2">⚠️ Esta ação é irreversível!</p>
                        <p className="text-xs text-red-400/80">
                            Todos os dados serão apagados permanentemente: serviços, barbeiros, agendamentos, clientes e a assinatura no Asaas.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm text-white/60 mb-2">
                            Digite <strong className="text-white">{deletingShop?.name}</strong> para confirmar:
                        </label>
                        <Input
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                            placeholder={deletingShop?.name}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
                        <button
                            onClick={handleDelete}
                            disabled={deleteConfirm !== deletingShop?.name || deleting}
                            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${deleteConfirm === deletingShop?.name
                                    ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                                    : 'bg-red-500/20 text-red-400/50 cursor-not-allowed'
                                }`}
                        >
                            {deleting ? 'Excluindo...' : 'Excluir Permanentemente'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default MasterDashboard
