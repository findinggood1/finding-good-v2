import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@finding-good/shared'
import {
  HomePage,
  NewPredictionPage,
  QuickPredictPage,
  ViewPredictionPage,
  ResultsPage,
  LoginPage,
  AuthCallbackPage,
  AboutPage,
} from './pages'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/quick" element={<QuickPredictPage />} />
        <Route path="/about" element={<AboutPage />} />

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
          path="/new"
          element={
            <ProtectedRoute>
              <NewPredictionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/:id"
          element={
            <ProtectedRoute>
              <ViewPredictionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/:id/results"
          element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
