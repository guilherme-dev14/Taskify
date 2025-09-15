import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'

// Mock the stores
vi.mock('../services/auth.store', () => ({
  useAuthStore: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
    },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))

vi.mock('../stores/navigation.store', () => ({
  useNavigationStore: () => ({
    currentView: 'dashboard',
    setCurrentView: vi.fn(),
  }),
}))

// Mock theme context
vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}))

// Mock language context
vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
  }),
}))

// Mock WebSocket hooks
vi.mock('../hooks/useWebSocket', () => ({
  useWebSocketEvent: vi.fn(),
  useWebSocketConnection: () => ({
    isConnected: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
}))

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }