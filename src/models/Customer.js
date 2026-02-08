export class Customer {
    constructor(data) {
        this.id = data.id
        this.name = data.name
        this.phone = data.phone
        // Email removed as per requirement
        this.loyaltyCuts = data.loyaltyCuts || 0
        this.freeCutsAvailable = data.freeCutsAvailable || 0
        this.totalCutsCompleted = data.totalCutsCompleted || 0
        this.totalSpent = data.totalSpent || 0
        this.visits = data.visits || 0
        this.lastVisit = data.lastVisit || null
    }

    addVisit(price, date) {
        this.visits += 1
        this.totalSpent += price
        this.lastVisit = date
        this.totalCutsCompleted += 1

        // Loyalty Logic: Every 10 cuts = 1 free cut
        // We increment loyaltyCuts. If it reaches 10, reset and add a free cut.
        // NOTE: The previous logic was: increment, check if >= 10.

        this.loyaltyCuts += 1

        if (this.loyaltyCuts >= 10) {
            this.loyaltyCuts = 0
            this.freeCutsAvailable += 1
            return { reward: true }
        }

        return { reward: false, progress: this.loyaltyCuts }
    }

    redeemFreeCut() {
        if (this.freeCutsAvailable > 0) {
            this.freeCutsAvailable -= 1
            return true
        }
        return false
    }

    get hasFreeCut() {
        return this.freeCutsAvailable > 0
    }
}
