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