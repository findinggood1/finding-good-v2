import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export type UserRole = 'user' | 'client' | 'coach' | 'admin'

interface UseUserRoleReturn {
  role: UserRole
  isLoading: boolean
  coachId: string | null
}

/**
 * Determines the user's role based on database records:
 * - 'admin': has is_admin flag in clients table
 * - 'coach': exists in coaches table
 * - 'client': has coach_id in clients table (working with a coach)
 * - 'user': default - authenticated but no special status
 *
 * Uses clients.email and coaches.email for lookups.
 */
export function useUserRole(): UseUserRoleReturn {
  const { user } = useAuth()
  const [role, setRole] = useState<UserRole>('user')
  const [isLoading, setIsLoading] = useState(true)
  const [coachId, setCoachId] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setRole('user')
      setCoachId(null)
      setIsLoading(false)
      return
    }

    const checkRole = async () => {
      try {
        setIsLoading(true)
        const supabase = getSupabase()
        const email = user.email

        // Check all role conditions in parallel
        const [clientResult, coachResult] = await Promise.all([
          // Check clients table for admin status and coach_id
          supabase
            .from('clients')
            .select('coach_id, is_admin')
            .eq('email', email)
            .maybeSingle(),
          // Check coaches table
          supabase
            .from('coaches')
            .select('id')
            .eq('email', email)
            .maybeSingle(),
        ])

        // Determine role based on results (priority: admin > coach > client > user)
        if (clientResult.data?.is_admin) {
          setRole('admin')
          setCoachId(clientResult.data.coach_id || null)
        } else if (coachResult.data) {
          setRole('coach')
          setCoachId(null)
        } else if (clientResult.data?.coach_id) {
          setRole('client')
          setCoachId(clientResult.data.coach_id)
        } else {
          setRole('user')
          setCoachId(null)
        }
      } catch (err) {
        console.error('Error checking user role:', err)
        setRole('user')
        setCoachId(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkRole()
  }, [user?.email])

  return { role, isLoading, coachId }
}
