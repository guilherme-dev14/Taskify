import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils'
import userEvent from '@testing-library/user-event'
import { ErrorNotification } from '../../UI/ErrorNotification'
import type { ErrorInfo } from '../../../utils/errorHandler'

describe('ErrorNotification', () => {
  const mockErrorInfo: ErrorInfo = {
    type: 'error',
    title: 'Test Error',
    message: 'Test error message'
  }

  it('renders error message correctly', () => {
    render(<ErrorNotification errorInfo={mockErrorInfo} onClose={vi.fn()} />)
    
    expect(screen.getByText('Test Error')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onCloseMock = vi.fn()
    
    render(<ErrorNotification errorInfo={mockErrorInfo} onClose={onCloseMock} />)
    
    const closeButton = screen.getByRole('button')
    await user.click(closeButton)
    
    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  it('applies correct styling classes for error type', () => {
    render(<ErrorNotification errorInfo={mockErrorInfo} onClose={vi.fn()} />)
    
    const titleElement = screen.getByText('Test Error')
    expect(titleElement).toHaveClass('text-red-800')
  })

  it('does not render when errorInfo is null', () => {
    render(<ErrorNotification errorInfo={null} onClose={vi.fn()} />)
    
    expect(screen.queryByText('Test Error')).not.toBeInTheDocument()
  })

  it('renders warning type correctly', () => {
    const warningInfo: ErrorInfo = {
      type: 'warning',
      title: 'Warning',
      message: 'This is a warning'
    }
    
    render(<ErrorNotification errorInfo={warningInfo} onClose={vi.fn()} />)
    
    const titleElement = screen.getByText('Warning')
    expect(titleElement).toHaveClass('text-yellow-800')
  })
})