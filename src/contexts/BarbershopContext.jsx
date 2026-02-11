import { createContext, useContext, useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebaseService'

const BarbershopContext = createContext()

export const useBarbershop = () => {
    const context = useContext(BarbershopContext)
    if (!context) {
        throw new Error('useBarbershop must be used within BarbershopProvider')
    }
    return context
}

export const BarbershopProvider = ({ children }) => {
    const { shopSlug } = useParams()
    const location = useLocation()

    const activeBarbershopId = shopSlug || extractBarbershopIdFromPath(location.pathname) || 'demo'

    const [barbershop, setBarbershop] = useState({ id: activeBarbershopId, name: 'Barbearia', active: true })
    const [loading, setLoading] = useState(activeBarbershopId !== 'demo')
    const [error, setError] = useState(null)

    useEffect(() => {
        if (activeBarbershopId === 'demo') {
            setBarbershop({ id: 'demo', name: 'Barbearia Demo', active: true })
            setLoading(false)
            return
        }

        const loadBarbershop = async () => {
            try {
                setLoading(true)
                const docRef = doc(db, 'barbershops', activeBarbershopId)
                const snapshot = await getDoc(docRef)

                if (snapshot.exists()) {
                    setBarbershop({ id: snapshot.id, ...snapshot.data() })
                } else {
                    setBarbershop({ id: activeBarbershopId, name: 'Barbearia', active: true })
                }
            } catch (err) {
                console.error('Error loading barbershop:', err)
                setError(err.message)
                setBarbershop({ id: activeBarbershopId, name: 'Barbearia', active: true })
            } finally {
                setLoading(false)
            }
        }

        loadBarbershop()
    }, [activeBarbershopId])

    const value = {
        barbershopId: activeBarbershopId,
        barbershop,
        loading,
        error,
    }

    return <BarbershopContext.Provider value={value}>{children}</BarbershopContext.Provider>
}

function extractBarbershopIdFromPath(pathname) {
    // Match patterns: /b/:shopSlug/* or /:shopSlug/admin/*
    const matchB = pathname.match(/^\/b\/([^/]+)/)
    if (matchB) return matchB[1]

    const matchShop = pathname.match(/^\/([^/]+)\/(admin|agendar|confirmacao)/)
    if (matchShop) return matchShop[1]

    return null
}
