import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@finding-good/shared'
import {
  HomePage,
  PredictionDetailPage,
  CampfirePage,
  ExchangePage,
  ConnectionsPage,
  ConnectionDetailPage,
  MapsPage,
  MapPage,
  SettingsPage,
  LoginPage,
  AuthCallbackPage,
  ProfilePage,
  LearnPage,
  ChatPage,
  ImpactLandingPage,
  ImpactSelfPage,
  ImpactOthersPage,
  ImproveLandingPage,
  ImproveSelfPage,
  ImproveOthersPage,
  InspireLandingPage,
  InspireSelfPage,
  InspireOthersPage,
  InspireRecipientView,
  PartnershipViewPage,
} from './pages'
import {
  ClientsPage,
  ClientDetailPage,
  PreparePage,
  MyPracticePage,
  AdminPage,
} from './pages/coach'
import { AppLayout, CoachLayout, RoleGate, LockedFeature } from './components'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/inspire/view/:shareId" element={<InspireRecipientView />} />

        {/* Home (Influence) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HomePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* Campfire */}
        <Route
          path="/campfire"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CampfirePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Exchange */}
        <Route
          path="/exchange"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ExchangePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exchange/:partnerId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PartnershipViewPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Impact (was Priority) */}
        <Route
          path="/impact"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ImpactLandingPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/impact/self"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ImpactSelfPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/impact/others"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ImpactOthersPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Improve (was Proof) */}
        <Route
          path="/improve"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ImproveLandingPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/improve/self"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ImproveSelfPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/improve/others"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ImproveOthersPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Inspire (was Predict) */}
        <Route
          path="/inspire"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InspireLandingPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspire/self"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InspireSelfPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspire/others"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InspireOthersPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Direction (locked for non-clients) */}
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <AppLayout>
                <RoleGate
                  allowedRoles={['client', 'coach', 'admin']}
                  fallback={
                    <LockedFeature
                      featureName="Map"
                      description="Track your trajectory and see how your FIRES scores evolve over time."
                      icon="🧭"
                    />
                  }
                >
                  <MapPage />
                </RoleGate>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <AppLayout>
                <RoleGate
                  allowedRoles={['client', 'coach', 'admin']}
                  fallback={
                    <LockedFeature
                      featureName="Chat"
                      description="Connect directly with your coach for guidance and reflection."
                      icon="💬"
                    />
                  }
                >
                  <ChatPage />
                </RoleGate>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Utility */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <AppLayout>
                <LearnPage />
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

        {/* Redirects for old routes */}
        <Route path="/today" element={<Navigate to="/" replace />} />
        <Route path="/focus" element={<Navigate to="/" replace />} />
        <Route path="/priority" element={<Navigate to="/impact/self" replace />} />
        <Route path="/priority/*" element={<Navigate to="/impact/self" replace />} />
        <Route path="/proof" element={<Navigate to="/improve/self" replace />} />
        <Route path="/proof/*" element={<Navigate to="/improve/self" replace />} />
        <Route path="/predict" element={<Navigate to="/inspire/self" replace />} />
        <Route path="/predict/*" element={<Navigate to="/inspire/self" replace />} />

        {/* Legacy routes kept for compatibility */}
        <Route
          path="/prediction/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PredictionDetailPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/connections"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ConnectionsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/connection/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ConnectionDetailPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/maps"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MapsPage />
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
