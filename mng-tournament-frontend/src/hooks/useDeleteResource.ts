import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteOne } from '../api/tournamentApi'

export function useDeleteResource(resource: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteOne(resource, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] })
    },
  })
}