import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth, RequireAdmin } from './components/ProtectedRoute'

import LandingPage           from './pages/LandingPage'
import LoginPage             from './pages/LoginPage'
import FormulaDeclPage       from './pages/FormulaDeclPage'
import FeedbackPage          from './pages/FeedbackPage'
import CustomerExperiencePage from './pages/CustomerExperiencePage'
import CreateProductPage     from './pages/CreateProductPage'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/"      element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin-only routes */}
          <Route path="/formula-decl" element={
            <RequireAdmin><FormulaDeclPage /></RequireAdmin>
          } />
          <Route path="/feedback" element={
            <RequireAdmin><FeedbackPage /></RequireAdmin>
          } />
          <Route path="/new-product" element={
            <RequireAdmin><CreateProductPage /></RequireAdmin>
          } />

          {/* Authenticated routes (admin + customer) */}
          <Route path="/experience" element={
            <RequireAuth><CustomerExperiencePage /></RequireAuth>
          } />

          {/* Redirects */}
          <Route path="/dashboard" element={<Navigate to="/formula-decl" replace />} />
          <Route path="/formula"   element={<Navigate to="/formula-decl" replace />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
