const { createBarbershop } = require('./utils/firebase-admin.cjs')
const { createCustomer, createSubscription } = require('./utils/asaas-client.cjs')

const MONTHLY_PRICE = 97.00
const SPLIT_CONFIG = [
    {
        walletId: process.env.ASAAS_WALLET_ABIMAEL,
        percentualValue: 33,
    },
    {
        walletId: process.env.ASAAS_WALLET_MARCUS,
        percentualValue: 33,
    },
    // Matheus (34%) receives in main account — no split entry needed
]

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' }
    }

    // Simple auth check
    const authHeader = event.headers.authorization
    if (!authHeader || authHeader !== `Bearer ${process.env.MASTER_API_KEY}`) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }
    }

    try {
        const {
            shopName,
            shopSlug,
            ownerName,
            ownerEmail,
            ownerPhone,
            ownerCpfCnpj,
        } = JSON.parse(event.body)

        // Validate required fields
        if (!shopName || !shopSlug || !ownerName || !ownerEmail || !ownerPhone) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' }),
            }
        }

        console.log(`[CreateSub] Creating subscription for: ${shopName} (${shopSlug})`)

        // 1. Create customer in Asaas
        const asaasCustomer = await createCustomer({
            name: ownerName,
            email: ownerEmail,
            phone: ownerPhone,
            cpfCnpj: ownerCpfCnpj || '00000000000', // sandbox allows fake CPF
        })
        console.log(`[CreateSub] Asaas customer created: ${asaasCustomer.id}`)

        // 2. Calculate next due date (today + 30 days)
        const nextDue = new Date()
        nextDue.setDate(nextDue.getDate() + 30)
        const nextDueDate = nextDue.toISOString().split('T')[0]

        // 3. Build split rules (only if wallet IDs are configured)
        const activeSplit = SPLIT_CONFIG.filter(s => s.walletId)

        // 4. Create subscription in Asaas
        const asaasSub = await createSubscription({
            customerId: asaasCustomer.id,
            value: MONTHLY_PRICE,
            description: `Assinatura Mensal - ${shopName}`,
            nextDueDate,
            split: activeSplit.length > 0 ? activeSplit : undefined,
        })
        console.log(`[CreateSub] Asaas subscription created: ${asaasSub.id}`)

        // 5. Create barbershop in Firestore
        const shop = await createBarbershop({
            name: shopName,
            slug: shopSlug,
            ownerName,
            ownerEmail,
            ownerPhone,
            asaasCustomerId: asaasCustomer.id,
            asaasSubscriptionId: asaasSub.id,
        })
        console.log(`[CreateSub] Barbershop created in Firestore: ${shop.id}`)

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                shop: {
                    id: shop.id,
                    slug: shopSlug,
                    url: `/${shopSlug}`,
                },
                asaas: {
                    customerId: asaasCustomer.id,
                    subscriptionId: asaasSub.id,
                    nextDueDate,
                },
            }),
        }
    } catch (error) {
        console.error('[CreateSub] Error:', error)
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error.message }),
        }
    }
}
