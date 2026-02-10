// src/pages/Home.tsx
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎫 Sistema de Tickets
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          365soft - Sistema de venta de tickets con certificados
        </p>
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
          <p className="text-gray-700 mb-4">
            Bienvenido al sistema de gestión de tickets.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>✅ React + Vite + TypeScript</p>
            <p>✅ TailwindCSS</p>
            <p>✅ React Router</p>
            <p>✅ Socket.IO Client</p>
            <p>✅ Zustand State Management</p>
            <p>✅ TanStack Query</p>
          </div>
        </div>
      </div>
    </div>
  )
}
