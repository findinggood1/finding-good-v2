import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@finding-good/shared'
import {
  HomePage,
  ConfirmPage,
  AskPage,
  RespondPage,
  HistoryPage,
  LoginPage,
  AuthCallbackPage,
} from './pages'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/respond/:token" element={<RespondPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/confirm"
          element={
            <ProtectedRoute>
              <ConfirmPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ask"
          element={
            <ProtectedRoute>
              <AskPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
