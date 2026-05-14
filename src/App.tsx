import { Navigate, Route, Routes } from 'react-router-dom'
import { FloatingNav } from './components/layout/FloatingNav'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { MemberRoute } from './routes/MemberRoute'
import { DashboardLayout } from './pages/dashboard/DashboardLayout'
import { DashboardHome } from './pages/dashboard/DashboardHome'
import { ProfilePage } from './pages/dashboard/ProfilePage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MessageThreadPage } from './pages/MessageThreadPage'
import { MessagesPage } from './pages/MessagesPage'
import { ObjetDetailPage } from './pages/ObjetDetailPage'
import { ObjetEditPage } from './pages/ObjetEditPage'
import { ObjetNewPage } from './pages/ObjetNewPage'
import { ObjetsBrowsePage } from './pages/ObjetsBrowsePage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminRoute } from './routes/AdminRoute'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminHome } from './pages/admin/AdminHome'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminSignalementsPage } from './pages/admin/AdminSignalementsPage'
import { AdminLieuxDepotPage } from './pages/admin/AdminLieuxDepotPage'

function App() {
  return (
    <div className="relative min-h-[100dvh] min-w-0 overflow-x-hidden">
      <div className="grain-overlay" aria-hidden />
      <FloatingNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />
        <Route path="/objets" element={<ObjetsBrowsePage />} />
        <Route
          path="/objets/nouveau"
          element={
            <ProtectedRoute>
              <MemberRoute>
                <ObjetNewPage />
              </MemberRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/objets/:id/modifier"
          element={
            <ProtectedRoute>
              <ObjetEditPage />
            </ProtectedRoute>
          }
        />
        <Route path="/objets/:id" element={<ObjetDetailPage />} />
        <Route
          path="/messages/thread/:userId"
          element={
            <ProtectedRoute>
              <MessageThreadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="profil" element={<ProfilePage />} />
          <Route path="messages" element={<MessagesPage />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="lieux-depot" element={<AdminLieuxDepotPage />} />
          <Route path="signalements" element={<AdminSignalementsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
