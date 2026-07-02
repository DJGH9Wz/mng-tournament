import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createOne, deleteOne, getList, getOne, updateOne } from '../api/tournamentApi'

export function useResourceList<T>(resource: string) {
  return useQuery({
    queryKey: [resource],
    queryFn: () => getList<T>(resource),
  })
}

export function useResourceOne<T>(resource: string, id: number) {
  return useQuery({
    queryKey: [resource, id],
    queryFn: () => getOne<T>(resource, id),
    enabled: Boolean(id),
  })
}

export function useCreateResource<T>(resource: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<T>) => createOne<T>(resource, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] })
    },
  })
}

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

export function useDeleteResource(resource: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteOne(resource, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] })
    },
  })
}