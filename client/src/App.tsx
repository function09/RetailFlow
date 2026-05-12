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

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path='/dashboard' element={<DashBoard />} />
                <Route path='/orders' element={<div />} />
                <Route path='/customers' element={<div />} />
                <Route path='/products' element={<div />} />
              </Route>
            </Route>

          </Routes>
        </SidebarProvider>
      </AuthProvider >
    </>
  )
}

export default App
