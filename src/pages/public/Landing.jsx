import { Link } from 'react-router-dom'
import { Calendar, Scissors, Star, Users, ArrowRight, Clock, Award } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { formatCurrency } from '../../utils/helpers'

const Landing = () => {
    const { services, barbers } = useApp()
    const featuredServices = services.slice(0, 6)

    return (
        <div className="min-h-screen bg-gradient-dark">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-primary opacity-10" />

                <div className="container-custom relative z-10 py-20 md:py-32">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 animate-slide-up">
                            Estilo e <span className="text-gradient-primary">Elegância</span>
                            <br />
                            em Cada Corte
                        </h1>
                        <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                            Agende seu horário com os melhores barbeiros da cidade. Experiência premium, atendimento personalizado.
                        </p>
                        <Link to="/agendar">
                            <Button size="lg" icon={<Calendar size={20} />}>
                                Agendar Agora
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
                        {[
                            { icon: Users, label: 'Clientes', value: '500+' },
                            { icon: Star, label: 'Avaliação', value: '4.9' },
                            { icon: Scissors, label: 'Profissionais', value: barbers.length },
                            { icon: Award, label: 'Anos', value: '8+' },
                        ].map((stat, index) => (
                            <Card key={index} variant="glass" className="text-center p-6">
                                <stat.icon className="mx-auto mb-2 text-accent-purple" size={32} />
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-sm text-white/60">{stat.label}</div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-display font-bold mb-4">
                            Nossos <span className="text-gradient-primary">Serviços</span>
                        </h2>
                        <p className="text-white/70">Escolha o serviço perfeito para você</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredServices.map((service) => (
                            <Card key={service.id} hover className="group">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            {service.name}
                                        </h3>
                                        <p className="text-sm text-white/60">
                                            {service.description}
                                        </p>
                                    </div>
                                    <Scissors className="text-accent-purple group-hover:rotate-12 transition-transform" size={24} />
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-2 text-white/60 text-sm">
                                        <Clock size={16} />
                                        <span>{service.duration} min</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gradient-primary">
                                        {formatCurrency(service.price)}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Link to="/agendar">
                            <Button variant="secondary" icon={<ArrowRight size={18} />} iconPosition="right">
                                Ver Todos os Serviços
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Barbers Section */}
            <section className="py-20 bg-dark-900/50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-display font-bold mb-4">
                            Nossos <span className="text-gradient-gold">Profissionais</span>
                        </h2>
                        <p className="text-white/70">Equipe especializada e experiente</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {barbers.slice(0, 6).map((barber) => (
                            <Card key={barber.id} hover className="text-center">
                                <img
                                    src={barber.photo}
                                    alt={barber.name}
                                    className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-accent-purple object-cover"
                                />
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {barber.name}
                                </h3>
                                <p className="text-sm text-white/60 mb-4">
                                    {barber.bio}
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {barber.specialties.slice(0, 2).map((specialty, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 rounded-full text-xs bg-accent-purple/20 text-accent-purple"
                                        >
                                            {specialty}
                                        </span>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container-custom">
                    <Card variant="glass" className="text-center p-12 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-primary opacity-10" />
                        <div className="relative z-10">
                            <h2 className="text-4xl font-display font-bold mb-4">
                                Pronto para uma Nova Experiência?
                            </h2>
                            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                                Agende seu horário agora mesmo e descubra por que somos a barbearia preferida da região
                            </p>
                            <Link to="/agendar">
                                <Button size="lg" icon={<Calendar size={20} />}>
                                    Fazer Agendamento
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-white/10">
                <div className="container-custom text-center text-white/50 text-sm">
                    <p>© 2024 Barbershop CRM. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    )
}

export default Landing
