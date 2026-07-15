import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateOne } from '../api/tournamentApi'

export function useUpdateResource<T>(resource: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<T> }) =>
      updateOne<T>(resource, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] })
    },
  })
}