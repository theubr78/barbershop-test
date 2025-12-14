# Barbershop CRM - Sistema de Gerenciamento para Barbearias

Sistema completo de CRM e agendamento para barbearias, com área pública para clientes e área administrativa mobile-first para barbeiros.

## 🚀 Características

### Área Pública
- **Landing Page** impactante com showcase de serviços e equipe
- **Fluxo de Agendamento** completo em 4 etapas:
  - Seleção de serviço
  - Escolha do barbeiro
  - Data e horário
  - Dados do cliente
- **Confirmação** com integração WhatsApp

### Área Administrativa (Mobile-First)
- **Dashboard** com métricas em tempo real
- **Agenda** com navegação por data e filtros
- **CRM de Clientes** com:
  - Busca e filtros avançados
  - Detecção de clientes ausentes (>30 dias)
  - Reengajamento via WhatsApp automático
- **Programa de Fidelidade** com tiers (Bronze/Prata/Ouro)
- **Gestão de Serviços** e **Barbeiros**

## 🛠️ Tecnologias

- **React 18** + Vite
- **Tailwind CSS** (design system dark mode premium)
- **React Router DOM** (navegação)
- **Lucide React** (ícones)
- **date-fns** (manipulação de datas)

## 📦 Instalação

### Pré-requisitos
- Node.js 16+ instalado
- npm ou yarn

### Passo a Passo

**⚠️ IMPORTANTE**: Se você está no Windows e recebe erro de "execução de scripts desabilitada", execute este comando no PowerShell como Administrador:

\`\`\`powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
\`\`\`

Depois, instale as dependências:

\`\`\`bash
# Navegue até a pasta do projeto
cd "c:\\Users\\Matheus Silva\\Desktop\\Site Barbearias"

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
\`\`\`

O aplicativo estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

\`\`\`
src/
├── components/
│   └── ui/              # Componentes reutilizáveis (Button, Card, Input, etc.)
├── contexts/
│   └── AppContext.jsx   # Gerenciamento de estado global
├── data/
│   └── mockData.js      # Dados mockados
├── pages/
│   ├── public/          # Páginas públicas (Landing, BookingFlow, etc.)
│   └── admin/           # Páginas administrativas (Dashboard, Agenda, etc.)
├── utils/
│   └── helpers.js       # Funções auxiliares
├── App.jsx              # Configuração de rotas
├── main.jsx             # Entry point
└── index.css            # Design system
\`\`\`

## 🎨 Design System

O projeto utiliza um design system premium com:
- **Dark Mode** nativo
- **Glassmorphism** e efeitos de backdrop blur
- **Gradientes vibrantes** (roxo/azul, dourado)
- **Animações suaves** e micro-interações
- **Tipografia Google Fonts** (Inter + Outfit)

## 🌐 Rotas

### Públicas
- `/` - Landing page
- `/agendar` - Fluxo de agendamento
- `/confirmacao/:id` - Confirmação do agendamento

### Administrativas
- `/admin` - Dashboard
- `/admin/agenda` - Agenda
- `/admin/clientes` - CRM
- `/admin/fidelidade` - Programa de fidelidade
- `/admin/servicos` - Serviços
- `/admin/barbeiros` - Barbeiros

## 💡 Funcionalidades Destaque

### WhatsApp Integration
A funcionalidade de reengajamento de clientes ausentes gera automaticamente mensagens personalizadas via WhatsApp:

- Detecta clientes com mais de 30 dias sem visita
- Gera link `wa.me` com mensagem pré-formatada
- Inclui nome do cliente e dias de ausência

### Programa de Fidelidade
Sistema de pontos com 3 tiers:

- **Bronze** (0-100 pts): 5% desconto
- **Prata** (101-500 pts): 10% desconto + prioridade
- **Ouro** (501+ pts): 15% desconto + benefícios VIP

Pontos: R$ 2 gastos = 1 ponto

## 🚀 Build para Produção

\`\`\`bash
npm run build
\`\`\`

Os arquivos otimizados estarão na pasta `dist/`

## 📱 Mobile-First

A área administrativa foi desenvolvida com abordagem mobile-first, incluindo:
- Bottom navigation em telas pequenas
- Layout responsivo em todos os componentes
- Touch-friendly (botões e cards maiores)
- Swipe gestures ready

## 🎯 Próximos Passos

- [ ] Integração com backend real
- [ ] Autenticação de usuários
- [ ] API WhatsApp Business oficial
- [ ] Sistema de notificações push
- [ ] Relatórios e analytics avançados
- [ ] Exportação de dados (PDF, Excel)

## 📄 Licença

Este projeto é um sistema demo para fins de demonstração.

---

**Desenvolvido com ❤️ usando React + Vite + Tailwind CSS**
