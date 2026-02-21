const { initializeApp, cert, getApps } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')

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

// --- Asaas Client ---
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

    if (response.status === 204) return null

    const data = await response.json()
    if (!response.ok) {
        console.error('Asaas API error:', data)
        throw new Error(data.errors?.[0]?.description || 'Asaas API error')
    }
    return data
}

// --- Handlers ---
async function handleEdit(shopId, body) {
    const { ownerName, ownerEmail, ownerPhone, ownerCpfCnpj, shopName } = body
    const updates = {}

    if (shopName) updates.name = shopName
    if (ownerName) updates.ownerName = ownerName
    if (ownerEmail) updates.ownerEmail = ownerEmail
    if (ownerPhone) updates.ownerPhone = ownerPhone
    if (ownerCpfCnpj !== undefined) updates.ownerCpfCnpj = ownerCpfCnpj
    updates.updatedAt = new Date().toISOString()

    await getDb().collection('barbershops').doc(shopId).update(updates)

    // Update Asaas customer if exists
    const doc = await getDb().collection('barbershops').doc(shopId).get()
    const shop = doc.data()
    const asaasCustomerId = shop?.subscription?.asaasCustomerId

    if (asaasCustomerId) {
        const asaasUpdate = {}
        if (ownerName) asaasUpdate.name = ownerName
        if (ownerEmail) asaasUpdate.email = ownerEmail
        if (ownerPhone) asaasUpdate.mobilePhone = ownerPhone
        if (ownerCpfCnpj) asaasUpdate.cpfCnpj = ownerCpfCnpj

        if (Object.keys(asaasUpdate).length > 0) {
            await asaasRequest(`/customers/${asaasCustomerId}`, {
                method: 'PUT',
                body: JSON.stringify(asaasUpdate),
            })
        }
    }

    return { success: true, message: 'Informações atualizadas' }
}

async function handleSuspend(shopId) {
    const doc = await getDb().collection('barbershops').doc(shopId).get()
    if (!doc.exists) throw new Error('Barbearia não encontrada')

    const shop = doc.data()
    const subId = shop?.subscription?.asaasSubscriptionId

    // Cancel Asaas subscription if exists
    if (subId) {
        try {
            await asaasRequest(`/subscriptions/${subId}`, { method: 'DELETE' })
        } catch (err) {
            console.warn(`[ManageSub] Could not cancel Asaas sub ${subId}:`, err.message)
        }
    }

    await getDb().collection('barbershops').doc(shopId).update({
        'subscription.status': 'suspended',
        'subscription.updatedAt': new Date().toISOString(),
        active: false,
    })

    return { success: true, message: 'Barbearia suspensa' }
}

async function handleActivate(shopId) {
    await getDb().collection('barbershops').doc(shopId).update({
        'subscription.status': 'active',
        'subscription.updatedAt': new Date().toISOString(),
        active: true,
    })

    return { success: true, message: 'Barbearia reativada' }
}

async function handleDelete(shopId) {
    const doc = await getDb().collection('barbershops').doc(shopId).get()
    if (!doc.exists) throw new Error('Barbearia não encontrada')

    const shop = doc.data()
    const subId = shop?.subscription?.asaasSubscriptionId
    const customerId = shop?.subscription?.asaasCustomerId

    // Cancel Asaas subscription
    if (subId) {
        try {
            await asaasRequest(`/subscriptions/${subId}`, { method: 'DELETE' })
        } catch (err) {
            console.warn(`[ManageSub] Could not cancel Asaas sub:`, err.message)
        }
    }

    // Delete Asaas customer
    if (customerId) {
        try {
            await asaasRequest(`/customers/${customerId}`, { method: 'DELETE' })
        } catch (err) {
            console.warn(`[ManageSub] Could not delete Asaas customer:`, err.message)
        }
    }

    // Delete all subcollections (services, barbers, appointments, customers)
    const subcollections = ['services', 'barbers', 'appointments', 'customers']
    for (const sub of subcollections) {
        const snap = await getDb().collection('barbershops').doc(shopId).collection(sub).get()
        const batch = getDb().batch()
        snap.docs.forEach(d => batch.delete(d.ref))
        if (snap.docs.length > 0) await batch.commit()
    }

    // Delete the barbershop document
    await getDb().collection('barbershops').doc(shopId).delete()

    return { success: true, message: 'Barbearia excluída permanentemente' }
}

// --- Main Handler ---
exports.handler = async (event) => {
    // Auth check
    const authHeader = event.headers.authorization
    if (!authHeader || authHeader !== `Bearer ${process.env.MASTER_API_KEY}`) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }
    }

    const shopId = event.queryStringParameters?.shopId
    if (!shopId) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing shopId' }) }
    }

    try {
        let result

        if (event.httpMethod === 'PATCH') {
            const body = JSON.parse(event.body)
            const { action } = body

            switch (action) {
                case 'edit':
                    result = await handleEdit(shopId, body)
                    break
                case 'suspend':
                    result = await handleSuspend(shopId)
                    break
                case 'activate':
                    result = await handleActivate(shopId)
                    break
                default:
                    return { statusCode: 400, body: JSON.stringify({ error: `Unknown action: ${action}` }) }
            }
        } else if (event.httpMethod === 'DELETE') {
            result = await handleDelete(shopId)
        } else {
            return { statusCode: 405, body: 'Method not allowed' }
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result),
        }
    } catch (error) {
        console.error('[ManageSub] Error:', error)
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error.message }),
        }
    }
}
