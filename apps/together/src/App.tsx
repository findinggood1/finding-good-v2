import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@finding-good/shared'
import {
  HomePage,
  PredictionDetailPage,
  CampfirePage,
  ConnectionsPage,
  ConnectionDetailPage,
  MapsPage,
  MapPage,
  SettingsPage,
  LoginPage,
  AuthCallbackPage,
} from './pages'
import {
  ClientsPage,
  ClientDetailPage,
  PreparePage,
  MyPracticePage,
  AdminPage,
} from './pages/coach'
import { AppLayout, CoachLayout } from './components'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Protected routes with bottom nav */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout activeNav="home">
                <HomePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prediction/:id"
          element={
            <ProtectedRoute>
              <AppLayout activeNav="home">
                <PredictionDetailPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/campfire"
          element={
            <ProtectedRoute>
              <AppLayout activeNav="campfire">
                <CampfirePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/connections"
          element={
            <ProtectedRoute>
              <AppLayout activeNav="connections">
                <ConnectionsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/connection/:id"
          element={
            <ProtectedRoute>
              <AppLayout activeNav="connections">
                <ConnectionDetailPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <AppLayout activeNav="map">
                <MapPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/maps"
          element={
            <ProtectedRoute>
              <AppLayout activeNav="maps">
                <MapsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Coach routes */}
        <Route
          path="/coach"
          element={
            <ProtectedRoute>
              <CoachLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ClientsPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="client/:email" element={<ClientDetailPage />} />
          <Route path="prepare" element={<PreparePage />} />
          <Route path="practice" element={<MyPracticePage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
