import { useQuery } from '@tanstack/react-query'
import { getOne } from '../api/tournamentApi'

export function useResourceOne<T>(resource: string, id: number) {
  return useQuery({
    queryKey: [resource, id],
    queryFn: () => getOne<T>(resource, id),
    enabled: Boolean(id),
  })
}