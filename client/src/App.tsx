import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Routes, Route } from 'react-router'
import Login from './pages/Login'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { DashBoard } from './pages/Dashboard'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SidebarProvider } from './components/ui/sidebar'
import Layout from './components/Layout'
import Products from './pages/Products'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Orders from './pages/Orders'

const queryClient = new QueryClient()

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Toaster position='bottom-center' />
        <AuthProvider>
          <SidebarProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path='/dashboard' element={<DashBoard />} />
                  <Route path='/orders' element={<div />} />
                  <Route path='/customers' element={<Customers />} />
                  <Route path='/customers/:customerID' element={<CustomerDetail />} />
                  <Route path='/products' element={<Products />} />
                  <Route path='/orders/' element={<Orders />} />
                </Route>
              </Route>

            </Routes>
          </SidebarProvider>
        </AuthProvider >
      </QueryClientProvider>
    </>
  )
}

export default App
