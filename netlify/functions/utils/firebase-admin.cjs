const { initializeApp, cert, getApps } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

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

async function getBarbershop(shopId) {
    const doc = await getDb().collection('barbershops').doc(shopId).get()
    if (!doc.exists) return null
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

module.exports = {
    getDb,
    getBarbershop,
    updateSubscriptionStatus,
    createBarbershop,
    findBarbershopByAsaasCustomer,
}
