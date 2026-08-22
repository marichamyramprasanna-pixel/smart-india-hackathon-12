import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { alertService } from '../services/alertService'
import { ThreatAlert } from '../types/threat'

export function useRealtimeAlerts(onAlertReceived?: (alert: ThreatAlert) => void) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = alertService.subscribeToAlerts((newAlert) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      if (onAlertReceived) {
        onAlertReceived(newAlert)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [queryClient, onAlertReceived])
}
