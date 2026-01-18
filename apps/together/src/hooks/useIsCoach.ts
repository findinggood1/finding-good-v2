import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export function useIsCoach() {
  const { user } = useAuth()
  const [isCoach, setIsCoach] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.email) {
      setIsCoach(false)
      setLoading(false)
      return
    }

    const checkCoach = async () => {
      try {
        setLoading(true)
        const supabase = getSupabase()

        const { data, error } = await supabase
          .from('coaches')
          .select('id')
          .eq('email', user.email)
          .maybeSingle()

        setIsCoach(!error && !!data)
      } catch (err) {
        console.error('Error checking coach status:', err)
        setIsCoach(false)
      } finally {
        setLoading(false)
      }
    }

    checkCoach()
  }, [user?.email])

  return { isCoach, loading }
}
