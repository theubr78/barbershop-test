// Seed script to populate Firebase with initial data
// Run this ONCE after setting up Firebase project

import dotenv from 'dotenv'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { services, barbers, customers, appointments } from '../src/data/mockData.js'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Firebase config using process.env (Node.js way)
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

const BARBERSHOP_ID = 'demo' // Change this for each barbershop

async function seedBarbershop() {
    console.log('🌱 Starting seed process...')

    try {
        // 1. Create barbershop document
        console.log('Creating barbershop document...')
        await setDoc(doc(db, 'barbershops', BARBERSHOP_ID), {
            id: BARBERSHOP_ID,
            name: 'Barbearia Demo',
            createdAt: new Date().toISOString(),
            active: true,
            settings: {
                workingHours: {
                    monday: { start: '09:00', end: '19:00' },
                    tuesday: { start: '09:00', end: '19:00' },
                    wednesday: { start: '09:00', end: '19:00' },
                    thursday: { start: '09:00', end: '19:00' },
                    friday: { start: '09:00', end: '19:00' },
                    saturday: { start: '08:00', end: '18:00' },
                    sunday: { start: '08:30', end: '12:00' }
                }
            }
        })
        console.log('✅ Barbershop created')

        // Helper to clear collection
        async function clearCollection(path) {
            console.log(`Cleaning ${path}...`)
            const snapshot = await getDocs(collection(db, path))
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
            await Promise.all(deletePromises)
            console.log(`Cleared ${snapshot.size} documents from ${path}`)
        }

        // Clear existing data
        await clearCollection(`barbershops/${BARBERSHOP_ID}/services`)
        await clearCollection(`barbershops/${BARBERSHOP_ID}/barbers`)
        await clearCollection(`barbershops/${BARBERSHOP_ID}/customers`)
        await clearCollection(`barbershops/${BARBERSHOP_ID}/appointments`)

        // 2. Seed Services
        console.log('Seeding services...')
        for (const service of services) {
            const { id, ...serviceData } = service
            await setDoc(doc(db, `barbershops/${BARBERSHOP_ID}/services`, `service-${id}`), serviceData)
        }
        console.log(`✅ ${services.length} services created`)

        // 3. Seed Barbers
        console.log('Seeding barbers...')
        for (const barber of barbers) {
            const { id, ...barberData } = barber
            await setDoc(doc(db, `barbershops/${BARBERSHOP_ID}/barbers`, `barber-${id}`), barberData)
        }
        console.log(`✅ ${barbers.length} barbers created`)

        // 4. Seed Customers
        console.log('Seeding customers...')
        for (const customer of customers) {
            const { id, ...customerData } = customer
            await setDoc(doc(db, `barbershops/${BARBERSHOP_ID}/customers`, `customer-${id}`), customerData)
        }
        console.log(`✅ ${customers.length} customers created`)

        // 5. Seed Appointments
        console.log('Seeding appointments...')
        for (const appointment of appointments) {
            const { id, ...appointmentData } = appointment
            // Map old numeric IDs to new string IDs
            const mappedAppointment = {
                ...appointmentData,
                customerId: `customer-${appointmentData.customerId}`,
                barberId: `barber-${appointmentData.barberId}`,
                serviceId: `service-${appointmentData.serviceId}`
            }
            await setDoc(doc(db, `barbershops/${BARBERSHOP_ID}/appointments`, `appointment-${id}`), mappedAppointment)
        }
        console.log(`✅ ${appointments.length} appointments created`)

        console.log('\n✨ Seed completed successfully!')
        console.log('ℹ️  Now create an admin user in Firebase Console → Authentication')
        process.exit(0)
    } catch (error) {
        console.error('❌ Error seeding database:', error)
        process.exit(1)
    }
}

seedBarbershop()
