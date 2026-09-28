import { useCallback } from 'react'
import { useSession } from '@/store/session'
import type { Classification } from '@/lib/types'

export const CLASSIFICATION_ORDER: readonly Classification[] = ['public', 'official', 'confidential', 'restricted', 'sealed'] as const

export function classificationRank(value: Classification): number {
  return CLASSIFICATION_ORDER.indexOf(value)
}

export function withinClearance(value: Classification, clearance: Classification): boolean {
  return classificationRank(value) <= classificationRank(clearance)
}

export function useClearance(): Classification {
  return useSession((state) => state.user.clearance)
}

export function useClearanceFilter(): <T extends { classification: Classification }>(items: readonly T[]) => T[] {
  const clearance = useClearance()
  return useCallback(<T extends { classification: Classification }>(items: readonly T[]) => items.filter((item) => withinClearance(item.classification, clearance)), [clearance])
}
