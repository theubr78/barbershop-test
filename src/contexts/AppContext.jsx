import { createContext, useContext, useState, useEffect } from 'react'
import { useBarbershop } from './BarbershopContext'
import {
    servicesService,
    barbersService,
    customersService,
    appointmentsService
} from '../services/firebaseService'
import { loyaltyConfig } from '../data/mockData' // Keep loyalty config as constant

const AppContext = createContext()

export const useApp = () => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useApp must be used within AppProvider')
    }
    return context
}

export const AppProvider = ({ children }) => {
    const { barbershopId } = useBarbershop()

    // State
    const [services, setServices] = useState([])
    const [barbers, setBarbers] = useState([])
    const [customers, setCustomers] = useState([])
    const [appointments, setAppointments] = useState([])
    const [statistics, setStatistics] = useState({ today: {}, week: {}, month: {} })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Load initial data from Firebase
    useEffect(() => {
        if (!barbershopId) {
            console.log('No barbershopId, skipping data load')
            setLoading(false)
            return
        }

        const loadData = async () => {
            try {
                console.log('Loading data for barbershop:', barbershopId)
                setLoading(true)
                setError(null)

                // Load all data in parallel
                const [servicesData, barbersData, customersData, appointmentsData] = await Promise.all([
                    servicesService.getAll(barbershopId).catch(err => {
                        console.error('Error loading services:', err)
                        return []
                    }),
                    barbersService.getAll(barbershopId).catch(err => {
                        console.error('Error loading barbers:', err)
                        return []
                    }),
                    customersService.getAll(barbershopId).catch(err => {
                        console.error('Error loading customers:', err)
                        return []
                    }),
                    appointmentsService.getAll(barbershopId).catch(err => {
                        console.error('Error loading appointments:', err)
                        return []
                    })
                ])

                console.log('Data loaded:', {
                    services: servicesData.length,
                    barbers: barbersData.length,
                    customers: customersData.length,
                    appointments: appointmentsData.length
                })

                setServices(servicesData)
                setBarbers(barbersData.map(b => {
                    if (b.name === 'Samuel Rodrigues') {
                        return { ...b, photo: '/barbers/samuel.jpeg' }
                    }
                    return b
                }))
                setCustomers(customersData)
                setAppointments(appointmentsData)

                // Calculate statistics
                calculateStatistics(appointmentsData, servicesData)
            } catch (err) {
                console.error('Error loading data:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [barbershopId])

    // Real-time listeners for appointments (most critical for live updates)
    useEffect(() => {
        if (!barbershopId) return

        const unsubscribe = appointmentsService.subscribe(barbershopId, (updatedAppointments) => {
            setAppointments(updatedAppointments)

            // Recalculate statistics when appointments change
            if (services.length > 0) {
                calculateStatistics(updatedAppointments, services)
            }
        })

        return unsubscribe
    }, [barbershopId, services])

    // Calculate statistics helper
    const calculateStatistics = (appointmentsData, servicesData) => {
        const today = new Date().toISOString().split('T')[0]
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        const getStats = (startDate, endDate = today) => {
            const filtered = appointmentsData.filter(apt => {
                const aptDate = apt.date
                return aptDate >= startDate && aptDate <= endDate && apt.status !== 'cancelled'
            })

            // Calculate metrics using simple logic for now, utilizing the raw data but applying the business rule:
            // Revenue is only REALIZED if status is 'completed'

            const realizedRevenue = filtered.reduce((sum, apt) => {
                if (apt.status === 'completed' && !apt.redeemed) {
                    const service = servicesData.find(s => s.id === apt.serviceId)
                    return sum + (service?.price || 0)
                }
                return sum
            }, 0)

            const projectedRevenue = filtered.reduce((sum, apt) => {
                if (apt.status !== 'cancelled' && !apt.redeemed) {
                    const service = servicesData.find(s => s.id === apt.serviceId)
                    return sum + (service?.price || 0)
                }
                return sum
            }, 0)

            return {
                appointments: filtered.length,
                revenue: realizedRevenue, // Primary metric is now Realized Revenue
                projectedRevenue: projectedRevenue,
                newCustomers: 0
            }
        }

        setStatistics({
            today: getStats(today),
            week: getStats(weekAgo),
            month: getStats(monthAgo)
        })
    }

    // ==================== SERVICES CRUD ====================

    const addService = async (service) => {
        try {
            const newService = await servicesService.add(barbershopId, service)
            setServices([...services, newService])
            return newService
        } catch (err) {
            console.error('Error adding service:', err)
            throw err
        }
    }

    const updateService = async (id, updates) => {
        try {
            await servicesService.update(barbershopId, id, updates)
            setServices(services.map(s => s.id === id ? { ...s, ...updates } : s))
        } catch (err) {
            console.error('Error updating service:', err)
            throw err
        }
    }

    const deleteService = async (id) => {
        try {
            await servicesService.delete(barbershopId, id)
            setServices(services.filter(s => s.id !== id))
        } catch (err) {
            console.error('Error deleting service:', err)
            throw err
        }
    }

    // ==================== BARBERS CRUD ====================

    const addBarber = async (barber) => {
        try {
            const newBarber = await barbersService.add(barbershopId, barber)
            setBarbers([...barbers, newBarber])
            return newBarber
        } catch (err) {
            console.error('Error adding barber:', err)
            throw err
        }
    }

    const updateBarber = async (id, updates) => {
        try {
            await barbersService.update(barbershopId, id, updates)
            setBarbers(barbers.map(b => b.id === id ? { ...b, ...updates } : b))
        } catch (err) {
            console.error('Error updating barber:', err)
            throw err
        }
    }

    const deleteBarber = async (id) => {
        try {
            await barbersService.delete(barbershopId, id)
            setBarbers(barbers.filter(b => b.id !== id))
        } catch (err) {
            console.error('Error deleting barber:', err)
            throw err
        }
    }

    // ==================== CUSTOMERS CRUD ====================

    const addCustomer = async (customer) => {
        try {
            // Check if customer already exists by phone
            const existing = await customersService.findByPhone(barbershopId, customer.phone)
            if (existing) {
                return existing
            }

            const newCustomer = await customersService.add(barbershopId, customer)
            setCustomers([...customers, newCustomer])
            return newCustomer
        } catch (err) {
            console.error('Error adding customer:', err)
            throw err
        }
    }

    const updateCustomer = async (id, updates) => {
        try {
            await customersService.update(barbershopId, id, updates)
            setCustomers(customers.map(c => c.id === id ? { ...c, ...updates } : c))
        } catch (err) {
            console.error('Error updating customer:', err)
            throw err
        }
    }

    const deleteCustomer = async (id) => {
        try {
            await customersService.delete(barbershopId, id)
            setCustomers(customers.filter(c => c.id !== id))
        } catch (err) {
            console.error('Error deleting customer:', err)
            throw err
        }
    }

    // ==================== APPOINTMENTS CRUD ====================

    const addAppointment = async (appointment) => {
        try {
            const newAppointment = await appointmentsService.add(barbershopId, appointment)

            // Update customer stats if they exist
            if (appointment.customerId) {
                const customer = customers.find(c => c.id === appointment.customerId)
                if (customer) {
                    const service = services.find(s => s.id === appointment.serviceId)
                    if (service) {
                        await updateCustomer(customer.id, {
                            lastVisit: appointment.date,
                            totalSpent: customer.totalSpent + service.price,
                            loyaltyPoints: customer.loyaltyPoints + Math.floor(service.price * loyaltyConfig.pointsPerReal),
                            visits: customer.visits + 1,
                        })
                    }
                }
            }

            // Real-time listener will update state automatically
            return newAppointment
        } catch (err) {
            console.error('Error adding appointment:', err)
            throw err
        }
    }

    const updateAppointment = async (id, updates) => {
        try {
            await appointmentsService.update(barbershopId, id, updates)
            // Real-time listener will update state automatically
        } catch (err) {
            console.error('Error updating appointment:', err)
            throw err
        }
    }

    const deleteAppointment = async (id) => {
        try {
            await appointmentsService.delete(barbershopId, id)
            // Real-time listener will update state automatically
        } catch (err) {
            console.error('Error deleting appointment:', err)
            throw err
        }
    }

    const cancelAppointment = (id) => updateAppointment(id, { status: 'cancelled' })
    const confirmAppointment = (id) => updateAppointment(id, { status: 'confirmed' })
    const completeAppointment = (id) => updateAppointment(id, { status: 'completed' })

    // ==================== HELPER FUNCTIONS ====================

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

    // ==================== LOYALTY PROGRAM ====================

    const completeService = async (appointmentId) => {
        const apt = appointments.find(a => a.id === appointmentId)
        if (!apt) return null

        const customerData = customers.find(c => c.id === apt.customerId)
        if (!customerData) return null

        // Instantiate Customer model
        const { Customer } = await import('../models/Customer')
        const customerModel = new Customer(customerData)

        const service = services.find(s => s.id === apt.serviceId)
        const price = service?.price || 0

        // Update appointment status
        await updateAppointment(appointmentId, { status: 'completed' })

        // Use model logic for visit and loyalty
        const result = customerModel.addVisit(price, apt.date)

        // Persist changes
        await updateCustomer(customerData.id, {
            visits: customerModel.visits,
            totalSpent: customerModel.totalSpent,
            lastVisit: customerModel.lastVisit,
            loyaltyCuts: customerModel.loyaltyCuts,
            freeCutsAvailable: customerModel.freeCutsAvailable,
            totalCutsCompleted: customerModel.totalCutsCompleted
        })

        return {
            reward: result.reward,
            customer: customerModel,
            progress: customerModel.loyaltyCuts
        }
    }

    const redeemFreeCut = async (customerId, appointmentId) => {
        const customerData = customers.find(c => c.id === customerId)
        if (!customerData) return false

        // Instantiate Customer model
        const { Customer } = await import('../models/Customer')
        const customerModel = new Customer(customerData)

        if (!customerModel.redeemFreeCut()) return false

        // Persist changes
        await updateCustomer(customerId, {
            freeCutsAvailable: customerModel.freeCutsAvailable,
        })

        // Mark appointment as completed without incrementing cuts
        if (appointmentId) {
            await updateAppointment(appointmentId, {
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
        loading,
        error,

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
