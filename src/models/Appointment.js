export class Appointment {
    constructor(data) {
        this.id = data.id
        this.customerId = data.customerId
        this.barberId = data.barberId
        this.serviceId = data.serviceId
        this.date = data.date
        this.time = data.time
        this.status = data.status || 'pending'
        this.price = data.price || 0 // Store price snapshot if available, otherwise 0
        this.redeemed = data.redeemed || false
    }

    get isCompleted() {
        return this.status === 'completed'
    }

    get isCancelled() {
        return this.status === 'cancelled'
    }

    get isConfirmed() {
        return this.status === 'confirmed'
    }

    get isPending() {
        return this.status === 'pending'
    }

    // Revenue is only realized when completed and not redeemed (free cut)
    get revenue() {
        if (!this.isCompleted) return 0
        if (this.redeemed) return 0
        return this.price
    }

    // Projected revenue includes confirmed/pending/completed, excluding free cuts
    get projectedRevenue() {
        if (this.isCancelled) return 0
        if (this.redeemed) return 0
        return this.price
    }
}
