// src/store/cartStore.ts
import { create } from 'zustand'

interface Seat {
  id: string
  fila: string
  numero: number
  precio: number
}

interface CartState {
  selectedEvent: string | null
  selectedSeat: Seat | null
  setSelectedEvent: (eventId: string) => void
  setSelectedSeat: (seat: Seat) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>((set) => ({
  selectedEvent: null,
  selectedSeat: null,
  setSelectedEvent: (eventId) => set({ selectedEvent: eventId }),
  setSelectedSeat: (seat) => set({ selectedSeat: seat }),
  clearCart: () => set({ selectedEvent: null, selectedSeat: null }),
}))
