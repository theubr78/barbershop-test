import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import {
    Home,
    CalendarDays,
    Users,
    Scissors,
    UserCheck,
    Award,
    Menu,
    X,
    LogOut,
    ChevronRight
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const getNavItems = (shopSlug) => [
    { icon: Home, label: 'Dashboard', to: `/${shopSlug}/admin`, end: true },
    { icon: CalendarDays, label: 'Agenda', to: `/${shopSlug}/admin/agenda` },
    { icon: Users, label: 'Clientes', to: `/${shopSlug}/admin/clientes` },
    { icon: Scissors, label: 'Serviços', to: `/${shopSlug}/admin/servicos` },
    { icon: UserCheck, label: 'Barbeiros', to: `/${shopSlug}/admin/barbeiros` },
    { icon: Award, label: 'Fidelidade', to: `/${shopSlug}/admin/fidelidade` },
]

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { logout } = useAuth()
    const navigate = useNavigate()
    const { shopSlug } = useParams()
    const navItems = getNavItems(shopSlug)

    const handleLogout = async () => {
        await logout()
        navigate(`/${shopSlug}/admin/login`)
    }

    const closeSidebar = () => setSidebarOpen(false)

    return (
        <div className="min-h-screen bg-gradient-dark flex">
            {/* Overlay (mobile) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 bottom-0 z-50 w-64 bg-dark-800 border-r border-white/10
                    flex flex-col transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:static lg:z-auto
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Logo / Brand */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                            <Scissors className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-white font-display font-bold text-lg leading-tight">Barbearia</h2>
                            <p className="text-xs text-white/40">Painel Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={closeSidebar}
                        className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="text-white/60" size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={closeSidebar}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                                ${isActive
                                    ? 'bg-accent-purple/20 text-accent-purple shadow-lg shadow-accent-purple/10'
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={20} className={isActive ? 'text-accent-purple' : 'text-white/40 group-hover:text-white/70'} />
                                    <span className="flex-1">{item.label}</span>
                                    {isActive && <ChevronRight size={16} className="text-accent-purple/60" />}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden bg-dark-800 border-b border-white/10 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <Menu className="text-white" size={22} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                            <Scissors className="text-white" size={14} />
                        </div>
                        <span className="text-white font-display font-bold">Barbearia</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
