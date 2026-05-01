import { Routes, Route } from 'react-router'
import Login from './pages/Login'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Toaster position='bottom-center' />
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  )
}

export default App
