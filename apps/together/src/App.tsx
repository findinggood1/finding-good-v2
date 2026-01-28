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
  ImpactsLandingPage,
  ImpactsSelfPage,
  ImpactsOthersPage,
  InsightsLandingPage,
  InsightsSelfPage,
  InsightsOthersPage,
  InspirationsLandingPage,
  InspirationsSelfPage,
  InspirationsOthersPage,
  InspirationsRecipientView,
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
        <Route path="/inspirations/view/:shareId" element={<InspirationsRecipientView />} />

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

        {/* Impacts */}
        <Route
          path="/impacts"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ImpactsLandingPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/impacts/self"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ImpactsSelfPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/impacts/others"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ImpactsOthersPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Insights */}
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InsightsLandingPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights/self"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InsightsSelfPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights/others"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InsightsOthersPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Inspirations */}
        <Route
          path="/inspirations"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InspirationsLandingPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspirations/self"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InspirationsSelfPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspirations/others"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InspirationsOthersPage />
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
        <Route path="/priority" element={<Navigate to="/impacts/self" replace />} />
        <Route path="/priority/*" element={<Navigate to="/impacts/self" replace />} />
        <Route path="/proof" element={<Navigate to="/insights/self" replace />} />
        <Route path="/proof/*" element={<Navigate to="/insights/self" replace />} />
        <Route path="/predict" element={<Navigate to="/inspirations/self" replace />} />
        <Route path="/predict/*" element={<Navigate to="/inspirations/self" replace />} />
        {/* Redirects from old verb routes to new noun routes */}
        <Route path="/impact" element={<Navigate to="/impacts" replace />} />
        <Route path="/impact/self" element={<Navigate to="/impacts/self" replace />} />
        <Route path="/impact/others" element={<Navigate to="/impacts/others" replace />} />
        <Route path="/improve" element={<Navigate to="/insights" replace />} />
        <Route path="/improve/self" element={<Navigate to="/insights/self" replace />} />
        <Route path="/improve/others" element={<Navigate to="/insights/others" replace />} />
        <Route path="/inspire" element={<Navigate to="/inspirations" replace />} />
        <Route path="/inspire/self" element={<Navigate to="/inspirations/self" replace />} />
        <Route path="/inspire/others" element={<Navigate to="/inspirations/others" replace />} />
        <Route path="/inspire/view/:shareId" element={<InspirationsRecipientView />} />

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
