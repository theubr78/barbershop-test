const ASAAS_BASE_URL = process.env.ASAAS_SANDBOX === 'true'
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/api/v3'

async function asaasRequest(endpoint, options = {}) {
    const response = await fetch(`${ASAAS_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'access_token': process.env.ASAAS_API_KEY,
            ...options.headers,
        },
    })

    const data = await response.json()

    if (!response.ok) {
        console.error('Asaas API error:', data)
        throw new Error(data.errors?.[0]?.description || 'Asaas API error')
    }

    return data
}

async function createCustomer({ name, email, phone, cpfCnpj }) {
    return asaasRequest('/customers', {
        method: 'POST',
        body: JSON.stringify({ name, email, mobilePhone: phone, cpfCnpj }),
    })
}

async function createSubscription({ customerId, value, description, nextDueDate, split }) {
    const body = {
        customer: customerId,
        billingType: 'UNDEFINED',
        value,
        cycle: 'MONTHLY',
        description,
        nextDueDate,
    }

    if (split && split.length > 0) {
        body.split = split.map(s => ({
            walletId: s.walletId,
            percentualValue: s.percentualValue,
        }))
    }

    return asaasRequest('/subscriptions', {
        method: 'POST',
        body: JSON.stringify(body),
    })
}

async function getSubscription(subscriptionId) {
    return asaasRequest(`/subscriptions/${subscriptionId}`)
}

async function getPayment(paymentId) {
    return asaasRequest(`/payments/${paymentId}`)
}

async function createSubAccount({ name, email, cpfCnpj }) {
    return asaasRequest('/accounts', {
        method: 'POST',
        body: JSON.stringify({
            name,
            email,
            cpfCnpj,
            companyType: 'MEI',
            loginEmail: email,
        }),
    })
}

module.exports = {
    createCustomer,
    createSubscription,
    getSubscription,
    getPayment,
    createSubAccount,
}
