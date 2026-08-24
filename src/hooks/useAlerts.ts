import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertService } from '../services/alertService'
import { ThreatAlert } from '../types/threat'

export function useAlerts(filters?: {
  severity?: string
  status?: string
  search?: string
  deviceId?: string
}) {
  const queryClient = useQueryClient()

  const alertsQuery = useQuery({
    queryKey: ['alerts', filters],
    queryFn: async () => {
      const res = await alertService.getAlerts(filters)
      return res.data
    },
    staleTime: 1000 * 30,        // treat data fresh for 30s
    refetchInterval: 1000 * 30,  // auto-refresh every 30s in background
    refetchIntervalInBackground: false,
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      alertId,
      status,
      analystName,
    }: {
      alertId: string
      status: ThreatAlert['status']
      analystName?: string
    }) => {
      const res = await alertService.updateStatus(alertId, status, analystName)
      if (res.error) throw new Error(res.error)
      return res.success
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })

  return {
    alerts: alertsQuery.data || [],
    isLoading: alertsQuery.isLoading,
    isError: alertsQuery.isError,
    error: alertsQuery.error instanceof Error ? alertsQuery.error.message : null,
    refetch: alertsQuery.refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
  }
}
