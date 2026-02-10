// Mock Data for Barbershop CRM

export const services = [
    {
        id: 1,
        name: 'Corte Degradê',
        description: 'Corte moderno com técnica de degradê perfeito',
        price: 30,
        duration: 45,
        category: 'Cabelo',
        active: true,
    },
    {
        id: 2,
        name: 'Corte Todo por Um',
        description: 'Corte tradicional em altura única',
        price: 25,
        duration: 30,
        category: 'Cabelo',
        active: true,
    },
    {
        id: 3,
        name: 'Barba',
        description: 'Modelagem e acabamento de barba',
        price: 20,
        duration: 30,
        category: 'Barba',
        active: true,
    },
    {
        id: 4,
        name: 'Cabelo e Barba',
        description: 'Combo completo de corte e barba',
        price: 50,
        duration: 60,
        category: 'Combo',
        active: true,
    },
    {
        id: 5,
        name: 'Cabelo, Barba e Sobrancelha',
        description: 'Serviço completo de visual',
        price: 60,
        duration: 75,
        category: 'Combo',
        active: true,
    },
    {
        id: 6,
        name: 'Sobrancelha',
        description: 'Design e limpeza de sobrancelha',
        price: 15,
        duration: 15,
        category: 'Acabamento',
        active: true,
    },
    {
        id: 7,
        name: 'Pigmentação',
        description: 'Pigmentação para correção e acabamento',
        price: 15,
        duration: 30,
        category: 'Acabamento',
        active: true,
    },
    {
        id: 8,
        name: 'Cabelo e Pigmentação',
        description: 'Corte com acabamento pigmentado',
        price: 45,
        duration: 60,
        category: 'Combo',
        active: true,
    },
    {
        id: 9,
        name: 'Luzes',
        description: 'A partir de R$ 130 - Técnica de iluminação capilar',
        price: 130,
        duration: 120,
        category: 'Química',
        active: true,
    },
    {
        id: 10,
        name: 'Nevou',
        description: 'A partir de R$ 130 - Descoloração global platinada',
        price: 130,
        duration: 150,
        category: 'Química',
        active: true,
    },
    {
        id: 11,
        name: 'Cabelo e Sobrancelha',
        description: 'Corte de cabelo e design de sobrancelha',
        price: 45,
        duration: 60,
        category: 'Combo',
        active: true,
    },
]

export const barbers = [
    {
        id: 1,
        name: 'Samuel Rodrigues',
        photo: '/barbers/samuel.jpeg',
        bio: 'Barbeiro especialista com atendimento exclusivo e personalizado.',
        specialties: ['Degradê', 'Barboterapia', 'Pigmentação', 'Platinado'],
        active: true,
        schedule: {
            monday: { start: '09:00', end: '19:00' },
            tuesday: { start: '09:00', end: '19:00' },
            wednesday: { start: '09:00', end: '19:00' },
            thursday: { start: '09:00', end: '19:00' },
            friday: { start: '09:00', end: '19:00' },
            saturday: { start: '08:00', end: '18:00' },
            sunday: { start: '08:30', end: '12:00' },
        },
    },
]

export const customers = []

export const appointments = []

export const loyaltyConfig = {
    tiers: [
        {
            name: 'Bronze',
            minPoints: 0,
            maxPoints: 100,
            color: '#cd7f32',
            benefits: ['5% de desconto em serviços'],
        },
        {
            name: 'Prata',
            minPoints: 101,
            maxPoints: 500,
            color: '#c0c0c0',
            benefits: ['10% de desconto em serviços', 'Prioridade no agendamento'],
        },
        {
            name: 'Ouro',
            minPoints: 501,
            maxPoints: 9999,
            color: '#ffd700',
            benefits: ['15% de desconto em serviços', 'Corte grátis a cada 10 visitas', 'Bebida premium inclusa'],
        },
    ],
    pointsPerReal: 0.5, // 1 ponto a cada R$ 2 gastos
    rewards: [
        {
            id: 1,
            name: 'Corte Grátis',
            pointsCost: 200,
            description: 'Um corte clássico gratuito',
        },
        {
            id: 2,
            name: '20% de Desconto',
            pointsCost: 150,
            description: 'Desconto de 20% em qualquer serviço',
        },
        {
            id: 3,
            name: 'Upgrade Premium',
            pointsCost: 300,
            description: 'Upgrade gratuito para pacote VIP',
        },
    ],
}

export const statistics = {
    today: {
        appointments: 0,
        revenue: 0,
        newCustomers: 0,
    },
    week: {
        appointments: 0,
        revenue: 0,
        newCustomers: 0,
    },
    month: {
        appointments: 0,
        revenue: 0,
        newCustomers: 0,
    },
}
