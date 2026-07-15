import { useQuery } from '@tanstack/react-query'
import { getList } from '../api/tournamentApi'

export function useResourceList<T>(resource: string) {
  return useQuery({
    queryKey: [resource],
    queryFn: () => getList<T>(resource),
  })
}