import { type ReactNode } from 'react'
import { LoadingSpinner } from '@finding-good/shared'
import { useUserRole, type UserRole } from '../../hooks/useUserRole'

interface RoleGateProps {
  /** Roles that are allowed to see the children */
  allowedRoles: UserRole[]
  /** Content to show when user has an allowed role */
  children: ReactNode
  /** Content to show when user doesn't have an allowed role (optional) */
  fallback?: ReactNode
  /** Show loading spinner while checking role (default: true) */
  showLoading?: boolean
}

/**
 * Conditionally renders children based on user's role.
 * Shows fallback (or nothing) if user doesn't have an allowed role.
 */
export function RoleGate({
  allowedRoles,
  children,
  fallback = null,
  showLoading = true,
}: RoleGateProps) {
  const { role, isLoading } = useUserRole()

  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  if (allowedRoles.includes(role)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
