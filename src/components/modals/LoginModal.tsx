import React, { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement login logic
    console.log('Login:', { username, password })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre de usuario"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Tu nombre de usuario"
          required
        />

        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tu contraseña"
          required
        />

        <div className="flex items-center justify-between text-sm">
          <a href="/forgot-password" className="text-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1">
            Acceder
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default LoginModal
