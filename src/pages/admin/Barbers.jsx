import { useState } from 'react'
import { User, Star, Clock, Plus, Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../contexts/ToastContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

const DAYS = [
    { key: 'monday', label: 'Segunda' },
    { key: 'tuesday', label: 'Terça' },
    { key: 'wednesday', label: 'Quarta' },
    { key: 'thursday', label: 'Quinta' },
    { key: 'friday', label: 'Sexta' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
]

const INTERVAL_OPTIONS = [15, 30, 45, 60]

const DAY_LABELS = {
    monday: 'Seg', tuesday: 'Ter', wednesday: 'Qua',
    thursday: 'Qui', friday: 'Sex', saturday: 'Sáb', sunday: 'Dom',
}

const defaultSchedule = () => {
    const schedule = {}
    DAYS.forEach(({ key }) => {
        schedule[key] = key === 'sunday'
            ? { start: '08:30', end: '12:00', interval: 30 }
            : key === 'saturday'
                ? { start: '08:00', end: '18:00', interval: 30 }
                : { start: '09:00', end: '19:00', interval: 30 }
    })
    return schedule
}

const emptyBarber = {
    name: '',
    photo: '',
    bio: '',
    specialties: '',
    active: true,
}

const Barbers = () => {
    const { barbers, appointments, addBarber, updateBarber, deleteBarber } = useApp()
    const { showSuccess, showInfo } = useToast()

    const [modalOpen, setModalOpen] = useState(false)
    const [editingBarber, setEditingBarber] = useState(null)
    const [form, setForm] = useState(emptyBarber)
    const [schedule, setSchedule] = useState(defaultSchedule())
    const [enabledDays, setEnabledDays] = useState(
        Object.fromEntries(DAYS.map(d => [d.key, true]))
    )
    const [confirmDelete, setConfirmDelete] = useState(null)

    const barbersWithStats = barbers.map(barber => {
        const barberAppointments = appointments.filter(a => a.barberId === barber.id)
        const completedAppointments = barberAppointments.filter(a => a.status === 'completed')
        return {
            ...barber,
            totalAppointments: barberAppointments.length,
            completedAppointments: completedAppointments.length,
        }
    })

    const getScheduleInfo = (sched) => {
        if (!sched) return 'Sem horário definido'
        const workingDays = Object.entries(sched).filter(([, time]) => time !== null)
        return workingDays.map(([day]) => DAY_LABELS[day]).join(', ')
    }

    const openAddModal = () => {
        setEditingBarber(null)
        setForm(emptyBarber)
        setSchedule(defaultSchedule())
        setEnabledDays(Object.fromEntries(DAYS.map(d => [d.key, true])))
        setModalOpen(true)
    }

    const openEditModal = (barber) => {
        setEditingBarber(barber)
        setForm({
            name: barber.name,
            photo: barber.photo || '',
            bio: barber.bio || '',
            specialties: (barber.specialties || []).join(', '),
            active: barber.active !== false,
        })

        const sched = { ...defaultSchedule() }
        const enabled = {}
        DAYS.forEach(({ key }) => {
            if (barber.schedule && barber.schedule[key]) {
                sched[key] = { ...sched[key], ...barber.schedule[key] }
                enabled[key] = true
            } else {
                enabled[key] = false
            }
        })
        setSchedule(sched)
        setEnabledDays(enabled)
        setModalOpen(true)
    }

    const handleScheduleChange = (day, field, value) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: field === 'interval' ? parseInt(value) : value }
        }))
    }

    const toggleDay = (day) => {
        setEnabledDays(prev => ({ ...prev, [day]: !prev[day] }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const finalSchedule = {}
        DAYS.forEach(({ key }) => {
            if (enabledDays[key]) {
                finalSchedule[key] = schedule[key]
            }
        })

        const data = {
            name: form.name,
            photo: form.photo,
            bio: form.bio,
            specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean),
            active: form.active,
            schedule: finalSchedule,
        }

        if (editingBarber) {
            await updateBarber(editingBarber.id, data)
            showSuccess('Barbeiro atualizado com sucesso!')
        } else {
            await addBarber(data)
            showSuccess('Barbeiro adicionado com sucesso!')
        }
        setModalOpen(false)
    }

    const handleDelete = async (id) => {
        await deleteBarber(id)
        setConfirmDelete(null)
        showInfo('Barbeiro removido')
    }

    const isFormValid = form.name.trim().length >= 2

    return (
        <div>
            {/* Header */}
            <div className="bg-dark-800 border-b border-white/10 p-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white">Barbeiros</h1>
                    <p className="text-sm text-white/60">Gerencie sua equipe</p>
                </div>
                <Button onClick={openAddModal} icon={<Plus size={18} />}>
                    Novo Barbeiro
                </Button>
            </div>

            <div className="p-4 pb-6 max-w-7xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-accent-purple/20">
                                <User className="text-accent-purple" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{barbers.length}</div>
                                <div className="text-xs text-white/60">Total de Barbeiros</div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <Star className="text-green-500" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {barbers.filter(b => b.active).length}
                                </div>
                                <div className="text-xs text-white/60">Ativos</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <Clock className="text-blue-500" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {appointments.length}
                                </div>
                                <div className="text-xs text-white/60">Agendamentos Total</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Barbers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {barbersWithStats.map((barber) => (
                        <Card key={barber.id} hover className="relative">
                            {/* Active Badge */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                {barber.active
                                    ? <Badge variant="success">Ativo</Badge>
                                    : <Badge variant="primary">Inativo</Badge>
                                }
                            </div>

                            {/* Profile */}
                            <div className="flex flex-col items-center text-center mb-4">
                                {barber.photo ? (
                                    <img
                                        src={barber.photo}
                                        alt={barber.name}
                                        className="w-24 h-24 rounded-full mb-4 border-4 border-accent-purple object-cover"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full mb-4 border-4 border-accent-purple bg-dark-900 flex items-center justify-center">
                                        <User className="text-white/40" size={36} />
                                    </div>
                                )}
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {barber.name}
                                </h3>
                                {barber.bio && (
                                    <p className="text-sm text-white/60 mb-4">{barber.bio}</p>
                                )}
                            </div>

                            {/* Specialties */}
                            {barber.specialties?.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs text-white/60 mb-2">Especialidades:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {barber.specialties.map((specialty, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 rounded-full text-xs bg-accent-purple/20 text-accent-purple"
                                            >
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Schedule */}
                            <div className="mb-4 p-3 rounded-lg bg-dark-900/50 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="text-white/60" size={14} />
                                    <span className="text-xs text-white/60">Horário de Trabalho</span>
                                </div>
                                <p className="text-sm text-white">{getScheduleInfo(barber.schedule)}</p>
                                {barber.schedule && Object.entries(barber.schedule).length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {Object.entries(barber.schedule).map(([day, time]) => (
                                            time && (
                                                <div key={day} className="flex justify-between text-xs text-white/50">
                                                    <span>{DAY_LABELS[day]}</span>
                                                    <span>{time.start} - {time.end} ({time.interval || 30}min)</span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-white">{barber.totalAppointments}</div>
                                    <div className="text-xs text-white/60">Agendamentos</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-accent-purple">{barber.completedAppointments}</div>
                                    <div className="text-xs text-white/60">Concluídos</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => openEditModal(barber)}
                                    icon={<Pencil size={14} />}
                                >
                                    Editar
                                </Button>
                                <button
                                    onClick={() => setConfirmDelete(barber.id)}
                                    className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>

                {barbers.length === 0 && (
                    <Card className="text-center py-12">
                        <User className="mx-auto mb-4 text-white/30" size={48} />
                        <p className="text-white/60 mb-4">Nenhum barbeiro cadastrado</p>
                        <Button onClick={openAddModal} icon={<Plus size={18} />}>
                            Adicionar Primeiro Barbeiro
                        </Button>
                    </Card>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
            >
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    <Input
                        label="Nome"
                        placeholder="Nome do barbeiro"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Foto (URL)"
                        placeholder="https://..."
                        value={form.photo}
                        onChange={(e) => setForm({ ...form, photo: e.target.value })}
                    />

                    <Input
                        label="Bio"
                        placeholder="Breve descrição"
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    />

                    <Input
                        label="Especialidades (separar por vírgula)"
                        placeholder="Degradê, Barba, Pigmentação"
                        value={form.specialties}
                        onChange={(e) => setForm({ ...form, specialties: e.target.value })}
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
                        <span className="text-sm text-white/80">Barbeiro ativo</span>
                    </div>

                    {/* Schedule Configuration */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <Clock size={16} className="text-accent-purple" />
                            Horários de Atendimento
                        </h3>
                        <div className="space-y-3">
                            {DAYS.map(({ key, label }) => (
                                <div key={key} className="p-3 rounded-lg bg-dark-900/50 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-white">{label}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={enabledDays[key]}
                                                onChange={() => toggleDay(key)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-dark-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-purple"></div>
                                        </label>
                                    </div>

                                    {enabledDays[key] && (
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-xs text-white/50 mb-1 block">Início</label>
                                                <input
                                                    type="time"
                                                    value={schedule[key].start}
                                                    onChange={(e) => handleScheduleChange(key, 'start', e.target.value)}
                                                    className="w-full px-2 py-1.5 rounded-lg bg-dark-800 border border-white/10 text-white text-sm focus:border-accent-purple focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-white/50 mb-1 block">Fim</label>
                                                <input
                                                    type="time"
                                                    value={schedule[key].end}
                                                    onChange={(e) => handleScheduleChange(key, 'end', e.target.value)}
                                                    className="w-full px-2 py-1.5 rounded-lg bg-dark-800 border border-white/10 text-white text-sm focus:border-accent-purple focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-white/50 mb-1 block">Intervalo</label>
                                                <select
                                                    value={schedule[key].interval}
                                                    onChange={(e) => handleScheduleChange(key, 'interval', e.target.value)}
                                                    className="w-full px-2 py-1.5 rounded-lg bg-dark-800 border border-white/10 text-white text-sm focus:border-accent-purple focus:outline-none"
                                                >
                                                    {INTERVAL_OPTIONS.map(i => (
                                                        <option key={i} value={i}>{i}min</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2 sticky bottom-0 bg-dark-800 pb-1">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1" disabled={!isFormValid}>
                            {editingBarber ? 'Salvar Alterações' : 'Adicionar Barbeiro'}
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
                    Tem certeza que deseja excluir este barbeiro? Esta ação não pode ser desfeita.
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

export default Barbers
