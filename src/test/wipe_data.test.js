
import { describe, it } from 'vitest'
import { db, auth } from '../services/firebaseService'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'

describe('Manual Data Wipe', () => {
    it('should delete all customers and appointments', async () => {
        const barbershopId = 'demo'
        console.log(`Starting database cleanup for ${barbershopId}...`)

        // Try to auth if needed. 
        // We don't have the password for 'admin@barber.com' readily available in code (it's in the user's head or DB).
        // However, if the rules are 'allow write: if isAdmin(barbershopId)', we NEED to be authenticated.
        // Let's try to list first. If listing fails, we know we are blocked.

        try {
            // Appointments
            const appointmentsRef = collection(db, `barbershops/${barbershopId}/appointments`)
            const aptSnapshot = await getDocs(appointmentsRef)
            console.log(`Found ${aptSnapshot.size} appointments. Deleting...`)

            const aptPromises = aptSnapshot.docs.map(doc => deleteDoc(doc.ref))
            await Promise.all(aptPromises)
            console.log(`Deleted all appointments.`)

            // Customers
            const customersRef = collection(db, `barbershops/${barbershopId}/customers`)
            const custSnapshot = await getDocs(customersRef)
            console.log(`Found ${custSnapshot.size} customers. Deleting...`)

            const custPromises = custSnapshot.docs.map(doc => deleteDoc(doc.ref))
            await Promise.all(custPromises)
            console.log(`Deleted all customers.`)

        } catch (error) {
            console.error('Error during wipe:', error)
            // If code is permission-denied, we can't do anything without creds.
            if (error.code === 'permission-denied') {
                console.error('PERMISSION DENIED. You need to be an admin.')
            }
            throw error;
        }
    }, 60000) // 60s timeout
})
