import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LoginModal from '@/components/modals/LoginModal'
import HowToBuyModal from '@/components/modals/HowToBuyModal'
import FAQModal from '@/components/modals/FAQModal'
import StoreLocationsModal from '@/components/modals/StoreLocationsModal'
import TermsModal from '@/components/modals/TermsModal'
import PrivacyModal from '@/components/modals/PrivacyModal'
import PaymentMethodsModal from '@/components/modals/PaymentMethodsModal'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAuthStore } from '@/store/authStore'
import Home from './pages/Home'
import EventDetail from './pages/EventDetail'
import SeatSelection from './pages/SeatSelection'
import Checkout from './pages/Checkout'
import MisCompras from './pages/MisCompras'
import Login from './pages/Login'
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

type ModalType = 'login' | 'howToBuy' | 'faq' | 'storeLocations' | 'terms' | 'privacy' | 'paymentMethods' | null

function App() {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const { isAdmin } = useAuthStore()

  const openModal = (modalType: ModalType) => {
    setActiveModal(modalType)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isAdmin && <Header onOpenModal={openModal} />}

      <main className="flex-grow">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home onOpenModal={openModal} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/eventos/:id" element={<EventDetail onOpenModal={openModal} />} />
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
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="eventos" element={<EventList />} />
            <Route path="eventos/crear" element={<EventForm />} />
            <Route path="eventos/:id/editar" element={<EventForm />} />
            <Route path="eventos/:id/dibujar-mapa" element={<SeatMapEditor />} />
            <Route path="eventos/:id" element={<AdminEventDetail />} />
            <Route path="eventos/:id/clientes" element={<EventClientsPage />} />
            <Route path="usuarios" element={<UsersList />} />
            <Route path="reportes" element={<Reports />} />
            <Route path="accesos" element={<AccessManagement />} />
            <Route path="configuracion" element={<Settings />} />
          </Route>
        </Routes>
      </main>

      {!isAdmin && <Footer onOpenModal={openModal} />}

      {/* Modals */}
      <LoginModal isOpen={activeModal === 'login'} onClose={closeModal} />
      <HowToBuyModal isOpen={activeModal === 'howToBuy'} onClose={closeModal} />
      <FAQModal isOpen={activeModal === 'faq'} onClose={closeModal} />
      <StoreLocationsModal isOpen={activeModal === 'storeLocations'} onClose={closeModal} />
      <TermsModal isOpen={activeModal === 'terms'} onClose={closeModal} />
      <PrivacyModal isOpen={activeModal === 'privacy'} onClose={closeModal} />
      <PaymentMethodsModal isOpen={activeModal === 'paymentMethods'} onClose={closeModal} />
    </div>
  )
}

export default App
