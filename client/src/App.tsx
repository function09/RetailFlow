import { Routes, Route } from 'react-router'
import Login from './pages/Login'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { DashBoard } from './pages/Dashboard'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <>
      <Toaster position='bottom-center' />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path='/dashboard' element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </>
  )
}

export default App
