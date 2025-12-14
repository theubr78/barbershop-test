import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now()
        const toast = { id, message, type, duration }

        setToasts(prev => [...prev, toast])

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)

        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const showSuccess = useCallback((message) => {
        return addToast(message, 'success', 4000)
    }, [addToast])

    const showError = useCallback((message) => {
        return addToast(message, 'error', 5000)
    }, [addToast])

    const showReward = useCallback((message) => {
        return addToast(message, 'reward', 6000)
    }, [addToast])

    const showInfo = useCallback((message) => {
        return addToast(message, 'info', 3000)
    }, [addToast])

    const value = {
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showReward,
        showInfo,
    }

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
