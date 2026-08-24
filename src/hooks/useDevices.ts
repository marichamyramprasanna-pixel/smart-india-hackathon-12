import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deviceService, DeviceCreateInput, DeviceUpdateInput } from '../services/deviceService'
import { DeviceTelemetry } from '../types/device'

export function useDevices(filters?: {
  search?: string
  status?: string
  deviceType?: string
}) {
  const queryClient = useQueryClient()

  const devicesQuery = useQuery({
    queryKey: ['devices', filters],
    queryFn: async () => {
      const res = await deviceService.getDevices(filters)
      return res.data
    },
    staleTime: 1000 * 30,        // treat data fresh for 30s
    refetchInterval: 1000 * 30,  // auto-refresh every 30s in background
    refetchIntervalInBackground: false,
  })

  const createDeviceMutation = useMutation({
    mutationFn: async (input: DeviceCreateInput) => {
      const res = await deviceService.createDevice(input)
      if (res.error) throw new Error(res.error)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
  })

  const updateDeviceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: DeviceUpdateInput }) => {
      const res = await deviceService.updateDevice(id, updates)
      if (res.error) throw new Error(res.error)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
  })

  const isolateDeviceMutation = useMutation({
    mutationFn: async ({
      deviceId,
      isIsolated,
      reason,
      analystName,
    }: {
      deviceId: string
      isIsolated: boolean
      reason?: string
      analystName?: string
    }) => {
      const res = await deviceService.setIsolation(deviceId, isIsolated, reason, analystName)
      if (res.error) throw new Error(res.error)
      return res.success
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
  })

  const deleteDeviceMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await deviceService.deleteDevice(id)
      if (res.error) throw new Error(res.error)
      return res.success
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
  })

  return {
    devices: devicesQuery.data || [],
    isLoading: devicesQuery.isLoading,
    isError: devicesQuery.isError,
    error: devicesQuery.error instanceof Error ? devicesQuery.error.message : null,
    refetch: devicesQuery.refetch,
    createDevice: createDeviceMutation.mutateAsync,
    isCreating: createDeviceMutation.isPending,
    updateDevice: updateDeviceMutation.mutateAsync,
    isUpdating: updateDeviceMutation.isPending,
    setIsolation: isolateDeviceMutation.mutateAsync,
    isIsolating: isolateDeviceMutation.isPending,
    deleteDevice: deleteDeviceMutation.mutateAsync,
    isDeleting: deleteDeviceMutation.isPending,
  }
}
