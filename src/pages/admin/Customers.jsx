import { useState } from 'react'
import {
    Search,
    UserPlus,
    MessageCircle,
    TrendingDown,
    Users as UsersIcon,
    Phone,
    Mail,
    Pencil,
    Trash2,
    Plus
} from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../contexts/ToastContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import {
    getDaysSinceLastVisit,
    filterAbsentCustomers,
    generateWhatsAppLink,
    generateReEngagementMessage,
    formatCurrency
} from '../../utils/helpers'

const emptyCustomer = {
    name: '',
    phone: '',
    email: '',
    notes: '',
}

const Customers = () => {
    const { customers, addCustomer, updateCustomer, deleteCustomer } = useApp()
    const { showSuccess, showInfo } = useToast()

    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState('all')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState(null)
    const [form, setForm] = useState(emptyCustomer)
    const [confirmDelete, setConfirmDelete] = useState(null)

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm) ||
            (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase())

        if (!matchesSearch) return false

        if (filter === 'absent') {
            const daysAbsent = getDaysSinceLastVisit(customer.lastVisit)
            return daysAbsent !== null && daysAbsent >= 30
        }
        if (filter === 'active') {
            const daysAbsent = getDaysSinceLastVisit(customer.lastVisit)
            return daysAbsent === null || daysAbsent < 30
        }
        return true
    })

    const absentCustomers = filterAbsentCustomers(customers, 30)

    const getTierBadgeVariant = (tier) => {
        switch (tier) {
            case 'Ouro': return 'gold'
            case 'Prata': return 'primary'
            case 'Bronze': return 'primary'
            default: return 'primary'
        }
    }

    const handleWhatsAppContact = (customer) => {
        const daysAbsent = getDaysSinceLastVisit(customer.lastVisit)
        let message = ''
        if (daysAbsent && daysAbsent >= 30) {
            message = generateReEngagementMessage(customer.name, daysAbsent)
        } else {
            message = `Olá ${customer.name}! 👋 Tudo bem? Como podemos ajudar você hoje?`
        }
        const link = generateWhatsAppLink(customer.phone, message)
        window.open(link, '_blank')
    }

    const openAddModal = () => {
        setEditingCustomer(null)
        setForm(emptyCustomer)
        setModalOpen(true)
    }

    const openEditModal = (customer) => {
        setEditingCustomer(customer)
        setForm({
            name: customer.name,
            phone: customer.phone || '',
            email: customer.email || '',
            notes: customer.notes || '',
        })
        setModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (editingCustomer) {
            await updateCustomer(editingCustomer.id, form)
            showSuccess('Cliente atualizado com sucesso!')
        } else {
            await addCustomer(form)
            showSuccess('Cliente adicionado com sucesso!')
        }
        setModalOpen(false)
    }

    const handleDelete = async (id) => {
        await deleteCustomer(id)
        setConfirmDelete(null)
        showInfo('Cliente removido')
    }

    const isFormValid = form.name.trim().length >= 2 && form.phone.trim().length >= 10

    return (
        <div>
            {/* Header */}
            <div className="bg-dark-800 border-b border-white/10 p-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white">Clientes</h1>
                    <p className="text-sm text-white/60">Gerencie sua base de clientes</p>
                </div>
                <Button onClick={openAddModal} icon={<Plus size={18} />}>
                    Novo Cliente
                </Button>
            </div>

            <div className="p-4 pb-6 max-w-7xl mx-auto">
                {/* Absent Customers Alert */}
                {absentCustomers.length > 0 && (
                    <Card className="mb-4 bg-orange-500/10 border-orange-500/30">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/20">
                                <TrendingDown className="text-orange-500" size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-1">
                                    Clientes Ausentes
                                </h3>
                                <p className="text-sm text-white/70 mb-3">
                                    Você tem <strong>{absentCustomers.length} {absentCustomers.length === 1 ? 'cliente' : 'clientes'}</strong> sem visitar há mais de 30 dias
                                </p>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setFilter('absent')}
                                >
                                    Ver Clientes Ausentes
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Search & Filters */}
                <div className="mb-4 space-y-3">
                    <Input
                        placeholder="Buscar por nome, telefone ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<Search size={18} />}
                    />

                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${filter === 'all'
                                ? 'bg-accent-purple text-white'
                                : 'bg-dark-900/50 text-white/60 hover:bg-dark-900'
                                }`}
                        >
                            Todos ({customers.length})
                        </button>
                        <button
                            onClick={() => setFilter('absent')}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${filter === 'absent'
                                ? 'bg-accent-purple text-white'
                                : 'bg-dark-900/50 text-white/60 hover:bg-dark-900'
                                }`}
                        >
                            Ausentes ({absentCustomers.length})
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${filter === 'active'
                                ? 'bg-accent-purple text-white'
                                : 'bg-dark-900/50 text-white/60 hover:bg-dark-900'
                                }`}
                        >
                            Ativos ({customers.length - absentCustomers.length})
                        </button>
                    </div>
                </div>

                {/* Customers List */}
                <div className="space-y-3">
                    {filteredCustomers.map((customer) => {
                        const daysAbsent = getDaysSinceLastVisit(customer.lastVisit)
                        const isAbsent = daysAbsent !== null && daysAbsent >= 30

                        return (
                            <Card key={customer.id} hover className={isAbsent ? 'border-orange-500/30' : ''}>
                                <div className="flex items-start gap-4">
                                    {/* Photo */}
                                    {customer.photo ? (
                                        <img
                                            src={customer.photo}
                                            alt={customer.name}
                                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-dark-900 flex items-center justify-center flex-shrink-0">
                                            <UsersIcon className="text-white/40" size={24} />
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-1">
                                                    {customer.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-2 text-xs text-white/60">
                                                    <span className="flex items-center gap-1">
                                                        <Phone size={12} />
                                                        {customer.phone}
                                                    </span>
                                                    {customer.email && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail size={12} />
                                                            {customer.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {customer.tier && (
                                                <Badge variant={getTierBadgeVariant(customer.tier)}>
                                                    {customer.tier}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                                            <div>
                                                <span className="text-white/60">Visitas: </span>
                                                <span className="text-white font-medium">{customer.visits || 0}</span>
                                            </div>
                                            <div>
                                                <span className="text-white/60">Total Gasto: </span>
                                                <span className="text-white font-medium">{formatCurrency(customer.totalSpent || 0)}</span>
                                            </div>
                                            <div>
                                                <span className="text-white/60">Pontos: </span>
                                                <span className="text-white font-medium">{customer.loyaltyPoints || 0}</span>
                                            </div>
                                            <div>
                                                <span className="text-white/60">Última Visita: </span>
                                                <span className={`font-medium ${isAbsent ? 'text-orange-500' : 'text-white'}`}>
                                                    {daysAbsent ? `${daysAbsent} dias atrás` : customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString('pt-BR') : 'Nunca'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={isAbsent ? 'primary' : 'secondary'}
                                                onClick={() => handleWhatsAppContact(customer)}
                                                icon={<MessageCircle size={16} />}
                                            >
                                                {isAbsent ? 'Reengajar' : 'WhatsApp'}
                                            </Button>
                                            <button
                                                onClick={() => openEditModal(customer)}
                                                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(customer.id)}
                                                className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {customer.notes && (
                                            <p className="text-sm text-white/60 italic mt-2">
                                                💡 {customer.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )
                    })}

                    {filteredCustomers.length === 0 && (
                        <Card className="text-center py-12">
                            <UsersIcon className="mx-auto mb-4 text-white/30" size={48} />
                            <p className="text-white/60 mb-4">Nenhum cliente encontrado</p>
                            <Button onClick={openAddModal} icon={<Plus size={18} />}>
                                Adicionar Primeiro Cliente
                            </Button>
                        </Card>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nome"
                        placeholder="Nome completo"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Telefone (WhatsApp)"
                        placeholder="(11) 98765-4321"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        placeholder="email@exemplo.com"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <Input
                        label="Observações"
                        placeholder="Preferências, anotações..."
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1" disabled={!isFormValid}>
                            {editingCustomer ? 'Salvar Alterações' : 'Adicionar Cliente'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                title="Confirmar Exclusão"
            >
                <p className="text-white/70 mb-6">
                    Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(null)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        className="flex-1 !bg-red-500 hover:!bg-red-600"
                        onClick={() => handleDelete(confirmDelete)}
                    >
                        Excluir
                    </Button>
                </div>
            </Modal>
        </div>
    )
}

export default Customers
