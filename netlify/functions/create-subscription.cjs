const { initializeApp, cert, getApps } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

// --- Firebase Admin Setup ---
let db

function getDb() {
    if (!db) {
        if (getApps().length === 0) {
            initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            })
        }
        db = getFirestore()
    }
    return db
}

async function createBarbershop(shopData) {
    const ref = getDb().collection('barbershops').doc(shopData.slug)
    await ref.set({
        name: shopData.name,
        slug: shopData.slug,
        ownerName: shopData.ownerName,
        ownerEmail: shopData.ownerEmail,
        ownerPhone: shopData.ownerPhone,
        subscription: {
            status: 'pending',
            asaasCustomerId: shopData.asaasCustomerId || null,
            asaasSubscriptionId: shopData.asaasSubscriptionId || null,
            dueDate: null,
            paidUntil: null,
            graceDays: 3,
        },
        createdAt: new Date().toISOString(),
        active: true,
    })
    return { id: shopData.slug, ...shopData }
}

// --- Asaas Client Setup ---
const ASAAS_BASE_URL = process.env.ASAAS_SANDBOX === 'true'
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/api/v3'

async function asaasRequest(endpoint, options = {}) {
    const response = await fetch(`${ASAAS_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'access_token': process.env.ASAAS_API_KEY,
            ...options.headers,
        },
    })

    const data = await response.json()

    if (!response.ok) {
        console.error('Asaas API error:', data)
        throw new Error(data.errors?.[0]?.description || 'Asaas API error')
    }

    return data
}

async function createCustomer({ name, email, phone, cpfCnpj }) {
    return asaasRequest('/customers', {
        method: 'POST',
        body: JSON.stringify({ name, email, mobilePhone: phone, cpfCnpj }),
    })
}

async function createSubscription({ customerId, value, description, nextDueDate, split }) {
    const body = {
        customer: customerId,
        billingType: 'UNDEFINED',
        value,
        cycle: 'MONTHLY',
        description,
        nextDueDate,
    }

    if (split && split.length > 0) {
        body.split = split.map(s => ({
            walletId: s.walletId,
            percentualValue: s.percentualValue,
        }))
    }

    return asaasRequest('/subscriptions', {
        method: 'POST',
        body: JSON.stringify(body),
    })
}

// --- Main Handler ---
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
]

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' }
    }

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

        if (!shopName || !shopSlug || !ownerName || !ownerEmail || !ownerPhone) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' }),
            }
        }

        console.log(`[CreateSub] Creating subscription for: ${shopName} (${shopSlug})`)

        const asaasCustomer = await createCustomer({
            name: ownerName,
            email: ownerEmail,
            phone: ownerPhone,
            cpfCnpj: ownerCpfCnpj || '00000000000',
        })
        console.log(`[CreateSub] Asaas customer created: ${asaasCustomer.id}`)

        const nextDue = new Date()
        nextDue.setDate(nextDue.getDate() + 30)
        const nextDueDate = nextDue.toISOString().split('T')[0]

        const activeSplit = SPLIT_CONFIG.filter(s => s.walletId)

        const asaasSub = await createSubscription({
            customerId: asaasCustomer.id,
            value: MONTHLY_PRICE,
            description: `Assinatura Mensal - ${shopName}`,
            nextDueDate,
            split: activeSplit.length > 0 ? activeSplit : undefined,
        })
        console.log(`[CreateSub] Asaas subscription created: ${asaasSub.id}`)

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
