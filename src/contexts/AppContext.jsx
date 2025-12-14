import { createContext, useContext, useState, useEffect } from 'react'
import {
    services as initialServices,
    barbers as initialBarbers,
    customers as initialCustomers,
    appointments as initialAppointments,
    loyaltyConfig,
    statistics as initialStatistics,
} from '../data/mockData'

const AppContext = createContext()

export const useApp = () => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useApp must be used within AppProvider')
    }
    return context
}

export const AppProvider = ({ children }) => {
    // State
    const [services, setServices] = useState(initialServices)
    const [barbers, setBarbers] = useState(initialBarbers)
    const [customers, setCustomers] = useState(initialCustomers)
    const [appointments, setAppointments] = useState(initialAppointments)
    const [statistics, setStatistics] = useState(initialStatistics)

    // Services CRUD
    const addService = (service) => {
        const newService = {
            ...service,
            id: Math.max(...services.map(s => s.id), 0) + 1,
        }
        setServices([...services, newService])
        return newService
    }

    const updateService = (id, updates) => {
        setServices(services.map(s => s.id === id ? { ...s, ...updates } : s))
    }

    const deleteService = (id) => {
        setServices(services.filter(s => s.id !== id))
    }

    // Barbers CRUD
    const addBarber = (barber) => {
        const newBarber = {
            ...barber,
            id: Math.max(...barbers.map(b => b.id), 0) + 1,
        }
        setBarbers([...barbers, newBarber])
        return newBarber
    }

    const updateBarber = (id, updates) => {
        setBarbers(barbers.map(b => b.id === id ? { ...b, ...updates } : b))
    }

    const deleteBarber = (id) => {
        setBarbers(barbers.filter(b => b.id !== id))
    }

    // Customers CRUD
    const addCustomer = (customer) => {
        const newCustomer = {
            ...customer,
            id: Math.max(...customers.map(c => c.id), 0) + 1,
            registeredAt: new Date().toISOString().split('T')[0],
            totalSpent: 0,
            loyaltyPoints: 0,
            tier: 'Bronze',
            visits: 0,
        }
        setCustomers([...customers, newCustomer])
        return newCustomer
    }

    const updateCustomer = (id, updates) => {
        setCustomers(customers.map(c => c.id === id ? { ...c, ...updates } : c))
    }

    const deleteCustomer = (id) => {
        setCustomers(customers.filter(c => c.id !== id))
    }

    // Appointments CRUD
    const addAppointment = (appointment) => {
        const newAppointment = {
            ...appointment,
            id: Math.max(...appointments.map(a => a.id), 0) + 1,
            createdAt: new Date().toISOString().split('T')[0],
            status: appointment.status || 'pending',
        }
        setAppointments([...appointments, newAppointment])

        // Update customer if exists
        if (appointment.customerId) {
            const customer = customers.find(c => c.id === appointment.customerId)
            if (customer) {
                const service = services.find(s => s.id === appointment.serviceId)
                if (service) {
                    updateCustomer(customer.id, {
                        lastVisit: appointment.date,
                        totalSpent: customer.totalSpent + service.price,
                        loyaltyPoints: customer.loyaltyPoints + Math.floor(service.price * loyaltyConfig.pointsPerReal),
                        visits: customer.visits + 1,
                    })
                }
            }
        }

        return newAppointment
    }

    const updateAppointment = (id, updates) => {
        setAppointments(appointments.map(a => a.id === id ? { ...a, ...updates } : a))
    }

    const deleteAppointment = (id) => {
        setAppointments(appointments.filter(a => a.id !== id))
    }

    const cancelAppointment = (id) => {
        updateAppointment(id, { status: 'cancelled' })
    }

    const confirmAppointment = (id) => {
        updateAppointment(id, { status: 'confirmed' })
    }

    const completeAppointment = (id) => {
        updateAppointment(id, { status: 'completed' })
    }

    // Helper functions
    const getServiceById = (id) => services.find(s => s.id === id)
    const getBarberById = (id) => barbers.find(b => b.id === id)
    const getCustomerById = (id) => customers.find(c => c.id === id)
    const getAppointmentById = (id) => appointments.find(a => a.id === id)

    const getAppointmentsByDate = (date) => {
        return appointments.filter(a => a.date === date && a.status !== 'cancelled')
    }

    const getAppointmentsByBarber = (barberId) => {
        return appointments.filter(a => a.barberId === barberId && a.status !== 'cancelled')
    }

    const getAppointmentsByCustomer = (customerId) => {
        return appointments.filter(a => a.customerId === customerId)
    }

    const getActiveBarbers = () => barbers.filter(b => b.active)
    const getActiveServices = () => services.filter(s => s.active)

    // Loyalty Program Functions
    const completeService = (appointmentId) => {
        const apt = appointments.find(a => a.id === appointmentId)
        if (!apt) return null

        const customer = customers.find(c => c.id === apt.customerId)
        if (!customer) return null

        // Update appointment status
        updateAppointment(appointmentId, { status: 'completed' })

        // Increment loyalty cuts
        const newCuts = (customer.loyaltyCuts || 0) + 1
        const newTotalCompleted = (customer.totalCutsCompleted || 0) + 1

        if (newCuts >= 10) {
            // Ganhou corte grátis!
            updateCustomer(customer.id, {
                loyaltyCuts: 0,  // Reseta contador
                freeCutsAvailable: (customer.freeCutsAvailable || 0) + 1,
                totalCutsCompleted: newTotalCompleted,
                lastVisit: apt.date,
            })
            return { reward: true, customer: { ...customer, loyaltyCuts: 0, freeCutsAvailable: (customer.freeCutsAvailable || 0) + 1 } }
        } else {
            updateCustomer(customer.id, {
                loyaltyCuts: newCuts,
                totalCutsCompleted: newTotalCompleted,
                lastVisit: apt.date,
            })
            return { reward: false, customer: { ...customer, loyaltyCuts: newCuts }, progress: newCuts }
        }
    }

    const redeemFreeCut = (customerId, appointmentId) => {
        const customer = customers.find(c => c.id === customerId)
        if (!customer || customer.freeCutsAvailable <= 0) return false

        // Decrement free cuts
        updateCustomer(customerId, {
            freeCutsAvailable: customer.freeCutsAvailable - 1,
        })

        // Mark appointment as completed without incrementing cuts
        if (appointmentId) {
            updateAppointment(appointmentId, {
                status: 'completed',
                redeemed: true  // Flag to identify this was a free cut
            })
        }

        return true
    }

    // Context value
    const value = {
        // Data
        services,
        barbers,
        customers,
        appointments,
        statistics,
        loyaltyConfig,

        // Services
        addService,
        updateService,
        deleteService,
        getServiceById,
        getActiveServices,

        // Barbers
        addBarber,
        updateBarber,
        deleteBarber,
        getBarberById,
        getActiveBarbers,

        // Customers
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,

        // Appointments
        addAppointment,
        updateAppointment,
        deleteAppointment,
        cancelAppointment,
        confirmAppointment,
        completeAppointment,
        getAppointmentById,
        getAppointmentsByDate,
        getAppointmentsByBarber,
        getAppointmentsByCustomer,

        // Loyalty Program
        completeService,
        redeemFreeCut,
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
