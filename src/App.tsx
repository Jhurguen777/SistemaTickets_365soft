import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Más rutas se agregarán aquí */}
      </Routes>
    </div>
  )
}

export default App
