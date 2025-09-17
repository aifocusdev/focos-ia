import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthProvider'
import LoginPage from './pages/LoginPage'
import UsersPage from './pages/UsersPage'
import ContactsPage from './pages/ContactsPage'
import WhatsAppIntegrationPage from './pages/WhatsAppIntegrationPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/ui/ErrorBoundary'
import './App.css'

function App() {
  return (
    <ErrorBoundary onError={(error, errorInfo) => {
      console.error('App Error:', error, errorInfo);
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
                    <Layout>
                      <UsersPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <UsersPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/contacts" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ContactsPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/whatsapp-integration" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <WhatsAppIntegrationPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
