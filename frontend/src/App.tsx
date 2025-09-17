import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthProvider'
import LoginPage from './pages/LoginPage'
import ConversationsPage from './pages/ConversationsPage'
import ServersPage from './pages/ServersPage'
import DevicesPage from './pages/DevicesPage'
import TagsPage from './pages/TagsPage'
import ApplicationsPage from './pages/ApplicationsPage'
import QuickRepliesPage from './pages/QuickRepliesPage'

// Admin pages
import UsersPage from './pages/admin/UsersPage'
import AdminContactsPage from './pages/admin/ContactsPage'
import WhatsAppIntegrationPage from './pages/admin/WhatsAppIntegrationPage'

import ProtectedRoute from './components/auth/ProtectedRoute'
import MainLayout from './components/layout/MainLayout'
import { ToastContainer } from './components/toast'
import { ModalContainer } from './components/modal'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { useSocketInitialization } from './hooks'
import { useAuthStore } from './stores/authStore'
import './App.css'

// Role-based route protection component
function RoleProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
  const user = useAuthStore(state => state.user)

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/conversations" replace />
  }

  return <>{children}</>
}

function App() {
  // Initialize WebSocket connection and event handlers
  useSocketInitialization()

  return (
    <ErrorBoundary onError={(error, errorInfo) => {
      console.error('App Error:', error, errorInfo);
      // TODO: Send to error tracking service (Sentry, etc.)
    }}>
      <AuthProvider>
        <Router>
          <div className="h-screen">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ConversationsPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/conversations" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ConversationsPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/servers" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ServersPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/devices" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DevicesPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tags" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TagsPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/applications" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ApplicationsPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/quick-replies"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <QuickRepliesPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <RoleProtectedRoute requiredRole="admin">
                      <MainLayout>
                        <UsersPage />
                      </MainLayout>
                    </RoleProtectedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/contacts"
                element={
                  <ProtectedRoute>
                    <RoleProtectedRoute requiredRole="admin">
                      <MainLayout>
                        <AdminContactsPage />
                      </MainLayout>
                    </RoleProtectedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/whatsapp-integration"
                element={
                  <ProtectedRoute>
                    <RoleProtectedRoute requiredRole="admin">
                      <MainLayout>
                        <WhatsAppIntegrationPage />
                      </MainLayout>
                    </RoleProtectedRoute>
                  </ProtectedRoute>
                }
              />
            </Routes>
            
            {/* Global UI Components */}
            <ToastContainer />
            <ModalContainer />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
