import { createContext, useContext, useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebaseService'
import { useBarbershop } from './BarbershopContext'

const SubscriptionContext = createContext()

export const useSubscription = () => {
    const context = useContext(SubscriptionContext)
    if (!context) {
        throw new Error('useSubscription must be used within SubscriptionProvider')
    }
    return context
}

export const SubscriptionProvider = ({ children }) => {
    const { barbershopId } = useBarbershop()
    const [subscription, setSubscription] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!barbershopId || barbershopId === 'demo') {
            setSubscription({ status: 'active' }) // demo mode
            setLoading(false)
            return
        }

        const docRef = doc(db, 'barbershops', barbershopId)
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data()
                const sub = data.subscription || { status: 'active' }

                // Check grace period for overdue
                if (sub.status === 'overdue' || isOverdueWithGrace(sub)) {
                    setSubscription({ ...sub, status: 'overdue' })
                } else {
                    setSubscription(sub)
                }
            } else {
                setSubscription({ status: 'not_found' })
            }
            setLoading(false)
        }, (error) => {
            console.error('Subscription listener error:', error)
            setSubscription({ status: 'active' }) // Fail open for now
            setLoading(false)
        })

        return unsubscribe
    }, [barbershopId])

    const isActive = subscription?.status === 'active'
    const isOverdue = subscription?.status === 'overdue'
    const isSuspended = subscription?.status === 'suspended' || subscription?.status === 'cancelled'
    const isBlocked = isOverdue || isSuspended

    const value = {
        subscription,
        loading,
        isActive,
        isOverdue,
        isSuspended,
        isBlocked,
    }

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    )
}

function isOverdueWithGrace(sub) {
    if (!sub.dueDate || sub.status === 'active') return false

    const dueDate = new Date(sub.dueDate + 'T12:00:00')
    const graceDays = sub.graceDays || 3
    const graceEnd = new Date(dueDate)
    graceEnd.setDate(graceEnd.getDate() + graceDays)

    return new Date() > graceEnd
}
