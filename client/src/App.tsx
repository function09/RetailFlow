import { Routes, Route } from 'react-router'
import Login from './pages/Login'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { DashBoard } from './pages/Dashboard'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SidebarProvider } from './components/ui/sidebar'
import Layout from './components/Layout'

function App() {
  return (
    <>
      <Toaster position='bottom-center' />
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path='/dashboard' element={
              <ProtectedRoute>
                <Layout>
                  <DashBoard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path='/orders' element={
              <ProtectedRoute>
                <Layout>
                  <div>Orders coming soon</div>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path='/customers' element={
              <ProtectedRoute>
                <Layout>
                  <div>Customers coming soon</div>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path='/products' element={
              <ProtectedRoute>
                <Layout>
                  <div>Products coming soon</div>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </>
  )
}

export default App
