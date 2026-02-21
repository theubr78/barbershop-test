import { Outlet, useParams } from 'react-router-dom'
import { BarbershopProvider } from '../contexts/BarbershopContext'
import { SubscriptionProvider } from '../contexts/SubscriptionContext'
import { AppProvider } from '../contexts/AppContext'
import ToastContainer from '../components/ui/ToastContainer'

export default function ShopLayout() {
    return (
        <BarbershopProvider>
            <SubscriptionProvider>
                <AppProvider>
                    <Outlet />
                    <ToastContainer />
                </AppProvider>
            </SubscriptionProvider>
        </BarbershopProvider>
    )
}
