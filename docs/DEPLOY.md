# Guia de Deploy (Publicação)

Este guia descreve como colocar o seu site "Barbershop CRM" no ar gratuitamente usando **Vercel** ou **Netlify**.

## ⚠️ Importante: Banco de Dados (Firebase)
O seu banco de dados (Firebase) **vai funcionar perfeitamente** hospedado na Vercel ou Netlify.
- O Firebase é um serviço em nuvem separado.
- O seu site apenas "conversa" com o Firebase.
- Para isso funcionar, você PRECISA configurar as **Variáveis de Ambiente** (Environment Variables) no serviço de hospedagem. Sem isso, o site não consegue acessar o banco de dados.

---

## Opção 1: Vercel (Recomendada)
A Vercel é a criadora do framework Next.js e tem uma integração excelente com projetos Vite/React.

### Passo a Passo
1. Crie uma conta em [vercel.com](https://vercel.com) (pode usar sua conta do GitHub).
2. Instale a Vercel CLI (opcional) ou conecte ao seu GitHub.
   - **Método mais fácil (Via GitHub):**
     1. Envie seu código atual para um repositório no GitHub.
     2. No painel da Vercel, clique em "Add New..." -> "Project".
     3. Importe o repositório `barbershop-crm`.
3. **Configuração do Projeto (Project Settings):**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (deixe padrão)
   - **Build Command:** `npm run build` (ou `vite build`)
   - **Output Directory:** `dist`
4. **Variáveis de Ambiente (Environment Variables):**
   *Esta é a parte mais importante.* Abra o arquivo `.env.local` no seu computador e copie os valores para a configuração na Vercel.
   
   Você deve adicionar cada uma dessas chaves com seus respectivos valores:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

5. Clique em **Deploy**.

---

## Opção 2: Netlify

### Passo a Passo
1. Crie uma conta em [netlify.com](https://netlify.com).
2. Clique em "Add new site" -> "Import an existing project".
3. Conecte com o GitHub e selecione o repositório.
4. **Build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. **Environment variables (Variáveis de ambiente):**
   - Clique em "Show advanced" ou vá nas configurações do site após a criação.
   - Adicione as mesmas variáveis do Firebase listadas acima (`VITE_FIREBASE_API_KEY`, etc).
6. Clique em **Deploy site**.

---

## Atualizando o Site
Sempre que você quiser atualizar o site:
1. Faça as alterações no código.
2. Comite e dê push para o GitHub:
   ```bash
   git add .
   git commit -m "Nova funcionalidade"
   git push origin main
   ```
3. A Vercel/Netlify detectará a mudança e fará o novo deploy automaticamente.
