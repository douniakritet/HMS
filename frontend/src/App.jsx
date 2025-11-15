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