import { useState } from 'react'
import { Scissors, Clock, DollarSign, Plus, Pencil, Trash2, X } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../contexts/ToastContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { formatCurrency } from '../../utils/helpers'

const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 120, 150]

const emptyService = {
    name: '',
    description: '',
    duration: 30,
    price: '',
    category: '',
    active: true,
}

const Services = () => {
    const { services, addService, updateService, deleteService } = useApp()
    const { showSuccess, showInfo } = useToast()

    const [modalOpen, setModalOpen] = useState(false)
    const [editingService, setEditingService] = useState(null)
    const [form, setForm] = useState(emptyService)
    const [confirmDelete, setConfirmDelete] = useState(null)

    const servicesByCategory = services.reduce((acc, service) => {
        const cat = service.category || 'Outros'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(service)
        return acc
    }, {})

    const openAddModal = () => {
        setEditingService(null)
        setForm(emptyService)
        setModalOpen(true)
    }

    const openEditModal = (service) => {
        setEditingService(service)
        setForm({
            name: service.name,
            description: service.description || '',
            duration: service.duration,
            price: String(service.price),
            category: service.category || '',
            active: service.active !== false,
        })
        setModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const data = {
            ...form,
            price: parseFloat(form.price),
            duration: parseInt(form.duration),
        }

        if (editingService) {
            await updateService(editingService.id, data)
            showSuccess('Serviço atualizado com sucesso!')
        } else {
            await addService(data)
            showSuccess('Serviço adicionado com sucesso!')
        }
        setModalOpen(false)
    }

    const handleDelete = async (id) => {
        await deleteService(id)
        setConfirmDelete(null)
        showInfo('Serviço removido')
    }

    const isFormValid = form.name.trim() && form.price && parseFloat(form.price) > 0

    return (
        <div>
            {/* Header */}
            <div className="bg-dark-800 border-b border-white/10 p-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white">Serviços</h1>
                    <p className="text-sm text-white/60">Gerencie seu catálogo de serviços</p>
                </div>
                <Button onClick={openAddModal} icon={<Plus size={18} />}>
                    Novo Serviço
                </Button>
            </div>

            <div className="p-4 pb-6 max-w-7xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-accent-purple/20">
                                <Scissors className="text-accent-purple" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{services.length}</div>
                                <div className="text-xs text-white/60">Total de Serviços</div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <DollarSign className="text-green-500" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {services.length > 0 ? formatCurrency(Math.min(...services.map(s => s.price))) : 'R$ 0'}
                                </div>
                                <div className="text-xs text-white/60">Preço Mínimo</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <DollarSign className="text-blue-500" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {services.length > 0 ? formatCurrency(Math.max(...services.map(s => s.price))) : 'R$ 0'}
                                </div>
                                <div className="text-xs text-white/60">Preço Máximo</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Services by Category */}
                <div className="space-y-6">
                    {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                        <div key={category}>
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="text-gradient-primary">{category}</span>
                                <Badge variant="primary">{categoryServices.length}</Badge>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categoryServices.map((service) => (
                                    <Card key={service.id} hover>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3 mb-2">
                                                    <div className="p-2 rounded-lg bg-accent-purple/20 flex-shrink-0">
                                                        <Scissors className="text-accent-purple" size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-white mb-1">
                                                            {service.name}
                                                        </h3>
                                                        <p className="text-sm text-white/60">
                                                            {service.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {service.active && <Badge variant="success">Ativo</Badge>}
                                                {!service.active && <Badge variant="primary">Inativo</Badge>}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 text-white/60 text-sm">
                                                    <Clock size={16} />
                                                    <span>{service.duration} min</span>
                                                </div>
                                                <div className="text-xl font-bold text-gradient-primary">
                                                    {formatCurrency(service.price)}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(service)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(service.id)}
                                                    className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}

                    {services.length === 0 && (
                        <Card className="text-center py-12">
                            <Scissors className="mx-auto mb-4 text-white/30" size={48} />
                            <p className="text-white/60 mb-4">Nenhum serviço cadastrado</p>
                            <Button onClick={openAddModal} icon={<Plus size={18} />}>
                                Adicionar Primeiro Serviço
                            </Button>
                        </Card>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nome do Serviço"
                        placeholder="Ex: Corte Degradê"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Descrição"
                        placeholder="Breve descrição do serviço"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Duração</label>
                            <select
                                value={form.duration}
                                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white focus:border-accent-purple focus:outline-none transition-colors"
                            >
                                {DURATION_OPTIONS.map(d => (
                                    <option key={d} value={d}>{d} minutos</option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Preço (R$)"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            required
                        />
                    </div>

                    <Input
                        label="Categoria"
                        placeholder="Ex: Cabelo, Barba, Combo"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                    />

                    <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.active}
                                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-dark-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-purple"></div>
                        </label>
                        <span className="text-sm text-white/80">Serviço ativo</span>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1" disabled={!isFormValid}>
                            {editingService ? 'Salvar Alterações' : 'Adicionar Serviço'}
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
                    Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
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

export default Services
