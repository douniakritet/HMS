<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
    return (
        <BrowserRouter>
            <div style={{ padding: '20px' }}>
                <h1>HMS - Hospital Management System</h1>
                <Routes>
                    <Route path="/" element={<div>HOME PAGE</div>} />
                    <Route path="/login" element={<div>LOGIN PAGE</div>} />
                    <Route path="/dashboard" element={<div>DASHBOARD PAGE</div>} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default App
=======
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from './components/ui/button'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from './pages/auth/AuthPage'
import Dashboard from './pages/dashboard/Dashboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthPage/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
>>>>>>> main
