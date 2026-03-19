import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LoginModal from '@/components/modals/LoginModal'
import HowToBuyModal from '@/components/modals/HowToBuyModal'
import FAQModal from '@/components/modals/FAQModal'
import StoreLocationsModal from '@/components/modals/StoreLocationsModal'
import TermsModal from '@/components/modals/TermsModal'
import PrivacyModal from '@/components/modals/PrivacyModal'
import PaymentMethodsModal from '@/components/modals/PaymentMethodsModal'
import ProtectedRoute, { RoleProtectedRoute } from '@/components/auth/ProtectedRoute'
import AdminLayout from '@/components/admin/AdminLayout'
import { ThemeProvider } from '@/contexts/ThemeContext'
import PendingPaymentBanner from '@/components/PendingPaymentBanner'
import Home from './pages/Home'
import EventDetail from './pages/EventDetail'
import SeatSelection from './pages/SeatSelection'
import Checkout from './pages/Checkout'
import MisCompras from './pages/MisCompras'
import Login from './pages/Login'
import CompleteProfile from './pages/auth/CompleteProfile'
import AuthSuccess from './pages/auth/AuthSuccess'
import AuthError from './pages/auth/AuthError'
import PurchaseSuccess from './pages/PurchaseSuccess'
import Dashboard from './pages/admin/Dashboard'
import EventList from './pages/admin/events/EventList'
import EventForm from './pages/admin/events/EventForm'
import SeatMapEditor from './pages/admin/events/SeatMapEditor'
import AdminEventDetail from './pages/admin/events/EventDetail'
import EventClientsPage from './pages/admin/EventClientsPage'
import UsersList from './pages/admin/users/UsersList'
import Reports from './pages/admin/Reports'
import Settings from './pages/admin/Settings'
import AccessManagement from './pages/admin/AccessManagement'
import Attendance from './pages/admin/Attendance'
import CertificateTemplates from './pages/admin/CertificateTemplates'
import PaymentVerificationsPage from './pages/admin/PaymentVerificationsPage'

type ModalType = 'login' | 'howToBuy' | 'faq' | 'storeLocations' | 'terms' | 'privacy' | 'paymentMethods' | null

function App() {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const initializeAuth = useAuthStore(s => s.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [])

  const openModal = (modalType: ModalType) => {
    setActiveModal(modalType)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Solo mostrar Header en rutas públicas, no en admin */}
        {!isAdminRoute && <Header onOpenModal={openModal as (modalType: string) => void} />}

      <main className={`flex-grow ${!isAdminRoute ? 'pt-12 md:pt-14' : ''}`}>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home onOpenModal={openModal as (modalType: string) => void} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/complete-profile" element={<CompleteProfile />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/auth/error" element={<AuthError />} />
          <Route path="/eventos/:id" element={<EventDetail onOpenModal={openModal as (modalType: string) => void} />} />
          <Route path="/eventos/:id/asientos" element={<SeatSelection />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/compra-exitosa" element={<PurchaseSuccess />} />
          <Route path="/mis-compras" element={<MisCompras />} />

          {/* Rutas de Administrador (Protegidas) */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<RoleProtectedRoute blockedRoles={['GESTOR_EVENTOS']}><Dashboard /></RoleProtectedRoute>} />
            <Route path="eventos" element={<RoleProtectedRoute blockedRoles={['GESTOR_EVENTOS']}><EventList /></RoleProtectedRoute>} />
            <Route path="eventos/crear" element={<RoleProtectedRoute blockedRoles={['GESTOR_EVENTOS']}><EventForm /></RoleProtectedRoute>} />
            <Route path="eventos/:id/editar" element={<RoleProtectedRoute blockedRoles={['GESTOR_EVENTOS']}><EventForm /></RoleProtectedRoute>} />
            <Route path="eventos/:id/dibujar-mapa" element={<RoleProtectedRoute blockedRoles={['GESTOR_EVENTOS']}><SeatMapEditor /></RoleProtectedRoute>} />
            <Route path="eventos/:id" element={<RoleProtectedRoute blockedRoles={['GESTOR_EVENTOS']}><AdminEventDetail /></RoleProtectedRoute>} />
            <Route path="eventos/:id/clientes" element={<RoleProtectedRoute blockedRoles={['GESTOR_EVENTOS']}><EventClientsPage /></RoleProtectedRoute>} />
            <Route path="usuarios" element={<RoleProtectedRoute blockedRoles={['GESTOR_EVENTOS']}><UsersList /></RoleProtectedRoute>} />
            <Route path="asistencia/registrar" element={<Attendance />} />
            <Route path="asistencia/plantillas" element={<RoleProtectedRoute blockedRoles={['GESTOR_EVENTOS']}><CertificateTemplates /></RoleProtectedRoute>} />
            <Route path="verificar-pagos" element={<RoleProtectedRoute blockedRoles={['GESTOR_EVENTOS']}><PaymentVerificationsPage /></RoleProtectedRoute>} />
            <Route path="reportes" element={<RoleProtectedRoute blockedRoles={['GESTOR_EVENTOS']}><Reports /></RoleProtectedRoute>} />
            <Route path="accesos" element={<RoleProtectedRoute blockedRoles={['GESTOR_EVENTOS']}><AccessManagement /></RoleProtectedRoute>} />
            <Route path="configuracion" element={<RoleProtectedRoute blockedRoles={['GESTOR_EVENTOS']}><Settings /></RoleProtectedRoute>} />
          </Route>
        </Routes>
      </main>

      {!isAdminRoute && <Footer onOpenModal={openModal as (modalType: string) => void} />}

      {/* Banner de pago pendiente — visible en todas las rutas públicas */}
      {!isAdminRoute && <PendingPaymentBanner />}

      {/* Modals */}
      <LoginModal isOpen={activeModal === 'login'} onClose={closeModal} />
      <HowToBuyModal isOpen={activeModal === 'howToBuy'} onClose={closeModal} />
      <FAQModal isOpen={activeModal === 'faq'} onClose={closeModal} />
      <StoreLocationsModal isOpen={activeModal === 'storeLocations'} onClose={closeModal} />
      <TermsModal isOpen={activeModal === 'terms'} onClose={closeModal} />
      <PrivacyModal isOpen={activeModal === 'privacy'} onClose={closeModal} />
      <PaymentMethodsModal isOpen={activeModal === 'paymentMethods'} onClose={closeModal} />
    </div>
    </ThemeProvider>
  )
}

export default App
