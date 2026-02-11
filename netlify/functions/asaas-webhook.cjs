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

async function findBarbershopByAsaasCustomer(asaasCustomerId) {
    const snapshot = await getDb()
        .collection('barbershops')
        .where('subscription.asaasCustomerId', '==', asaasCustomerId)
        .limit(1)
        .get()

    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() }
}

async function updateSubscriptionStatus(shopId, data) {
    await getDb().collection('barbershops').doc(shopId).update({
        'subscription.status': data.status,
        'subscription.updatedAt': new Date().toISOString(),
        ...(data.paidUntil && { 'subscription.paidUntil': data.paidUntil }),
        ...(data.dueDate && { 'subscription.dueDate': data.dueDate }),
    })
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

async function getPayment(paymentId) {
    return asaasRequest(`/payments/${paymentId}`)
}

// --- Main Handler ---
exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' }
    }

    // Verify webhook token
    const webhookToken = event.headers['asaas-access-token'] || event.headers['x-asaas-token']
    if (process.env.ASAAS_WEBHOOK_TOKEN && webhookToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
        console.warn('Invalid webhook token')
        return { statusCode: 401, body: 'Unauthorized' }
    }

    try {
        const payload = JSON.parse(event.body)
        const { event: eventType, payment } = payload

        console.log(`[Webhook] Event: ${eventType}`, JSON.stringify(payload, null, 2))

        if (!payment) {
            console.log('No payment data, skipping')
            return { statusCode: 200, body: 'OK' }
        }

        // Find the barbershop by Asaas customer ID
        const shop = await findBarbershopByAsaasCustomer(payment.customer)
        if (!shop) {
            console.warn(`No barbershop found for Asaas customer: ${payment.customer}`)
            return { statusCode: 200, body: 'Shop not found, skipping' }
        }

        console.log(`[Webhook] Processing for shop: ${shop.id}`)

        switch (eventType) {
            case 'PAYMENT_CONFIRMED':
            case 'PAYMENT_RECEIVED': {
                // Payment was confirmed — activate subscription
                const dueDate = payment.dueDate
                const nextDueDate = calculateNextDueDate(dueDate)

                await updateSubscriptionStatus(shop.id, {
                    status: 'active',
                    paidUntil: nextDueDate,
                    dueDate: nextDueDate,
                })
                console.log(`[Webhook] Shop ${shop.id} activated until ${nextDueDate}`)
                break
            }

            case 'PAYMENT_OVERDUE': {
                // Payment is overdue — check grace period
                const graceDays = shop.subscription?.graceDays || 3
                const dueDate = new Date(payment.dueDate)
                const now = new Date()
                const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24))

                if (daysOverdue >= graceDays) {
                    await updateSubscriptionStatus(shop.id, { status: 'overdue' })
                    console.log(`[Webhook] Shop ${shop.id} marked overdue (${daysOverdue} days)`)
                } else {
                    console.log(`[Webhook] Shop ${shop.id} within grace (${daysOverdue}/${graceDays} days)`)
                }
                break
            }

            case 'PAYMENT_DELETED':
            case 'PAYMENT_REFUNDED': {
                await updateSubscriptionStatus(shop.id, { status: 'suspended' })
                console.log(`[Webhook] Shop ${shop.id} suspended`)
                break
            }

            default:
                console.log(`[Webhook] Unhandled event: ${eventType}`)
        }

        return { statusCode: 200, body: 'OK' }
    } catch (error) {
        console.error('[Webhook] Error:', error)
        return { statusCode: 500, body: 'Internal error' }
    }
}

function calculateNextDueDate(currentDueDate) {
    const date = new Date(currentDueDate + 'T12:00:00')
    date.setMonth(date.getMonth() + 1)
    return date.toISOString().split('T')[0]
}
