import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createOne } from '../api/tournamentApi'

export function useCreateResource<T>(resource: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<T>) => createOne<T>(resource, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] })
    },
  })
}