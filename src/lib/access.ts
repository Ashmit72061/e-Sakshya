import { useCallback, useMemo } from 'react'
import { withinClearance, useClearance } from '@/lib/clearance'
import { can } from '@/lib/permissions'
import { useData } from '@/store/data'
import { useRbac } from '@/store/rbac'
import { useSession } from '@/store/session'
import type { ApprovalRequest, CaseRecord, Classification, DocumentRecord, User } from '@/lib/types'

export type AccessDenied = { status: 'denied'; required: Classification; actual: Classification }
export type CaseAccess = { status: 'ok'; record: CaseRecord } | { status: 'missing' } | AccessDenied
export type DocumentAccess = { status: 'ok'; record: DocumentRecord } | { status: 'missing' } | AccessDenied

export function isCaseVisible(record: CaseRecord, user: User, clearance: Classification): boolean {
  return can(user, 'case:view') && withinClearance(record.classification, clearance)
}

export function isDocumentVisible(record: DocumentRecord, ctx: { cases: readonly CaseRecord[]; user: User; clearance: Classification }): boolean {
  const parentCase = ctx.cases.find((item) => item.id === record.caseId)
  return can(ctx.user, 'doc:view') && withinClearance(record.classification, ctx.clearance) && Boolean(parentCase && withinClearance(parentCase.classification, ctx.clearance))
}

export function useVisibleCases(): CaseRecord[] {
  const cases = useData((state) => state.cases)
  const user = useSession((state) => state.user)
  const clearance = useClearance()
  const matrix = useRbac((state) => state.matrix)
  return useMemo(() => {
    if (!matrix.some((entry) => entry.role === user.role && entry.permissions.includes('case:view'))) return []
    return cases.filter((record) => isCaseVisible(record, user, clearance))
  }, [cases, clearance, matrix, user])
}

export function useVisibleDocuments(): DocumentRecord[] {
  const cases = useData((state) => state.cases)
  const documents = useData((state) => state.documents)
  const user = useSession((state) => state.user)
  const clearance = useClearance()
  const matrix = useRbac((state) => state.matrix)
  return useMemo(() => {
    if (!matrix.some((entry) => entry.role === user.role && entry.permissions.includes('doc:view'))) return []
    return documents.filter((record) => isDocumentVisible(record, { cases, user, clearance }))
  }, [cases, clearance, documents, matrix, user])
}

export function useVisibleApprovals(): ApprovalRequest[] {
  const approvals = useData((state) => state.approvals)
  const documents = useVisibleDocuments()
  const visibleDocumentIds = useMemo(() => new Set(documents.map((document) => document.id)), [documents])
  return useMemo(() => approvals.filter((approval) => visibleDocumentIds.has(approval.docId)), [approvals, visibleDocumentIds])
}

export function useCaseAccess(id: string | undefined): CaseAccess {
  const cases = useData((state) => state.cases)
  const user = useSession((state) => state.user)
  const clearance = useClearance()
  const matrix = useRbac((state) => state.matrix)
  return useMemo(() => {
    const record = cases.find((item) => item.id === id)
    if (!record) return { status: 'missing' }
    if (!matrix.some((entry) => entry.role === user.role && entry.permissions.includes('case:view')) || !isCaseVisible(record, user, clearance)) return { status: 'denied', required: record.classification, actual: clearance }
    return { status: 'ok', record }
  }, [cases, clearance, id, matrix, user])
}

export function useDocumentAccess(id: string | undefined): DocumentAccess {
  const cases = useData((state) => state.cases)
  const documents = useData((state) => state.documents)
  const user = useSession((state) => state.user)
  const clearance = useClearance()
  const matrix = useRbac((state) => state.matrix)
  return useMemo(() => {
    const record = documents.find((item) => item.id === id)
    if (!record) return { status: 'missing' }
    const parentCase = cases.find((item) => item.id === record.caseId)
    if (!matrix.some((entry) => entry.role === user.role && entry.permissions.includes('doc:view')) || !can(user, 'doc:view')) return { status: 'denied', required: record.classification, actual: clearance }
    if (!withinClearance(record.classification, clearance)) return { status: 'denied', required: record.classification, actual: clearance }
    if (!parentCase || !withinClearance(parentCase.classification, clearance)) return { status: 'denied', required: parentCase?.classification ?? record.classification, actual: clearance }
    return { status: 'ok', record }
  }, [cases, clearance, documents, id, matrix, user])
}

export function useCanSeeDocument(): (record: DocumentRecord) => boolean {
  const cases = useData((state) => state.cases)
  const user = useSession((state) => state.user)
  const clearance = useClearance()
  const matrix = useRbac((state) => state.matrix)
  return useCallback((record) => matrix.some((entry) => entry.role === user.role && entry.permissions.includes('doc:view')) && isDocumentVisible(record, { cases, user, clearance }), [cases, clearance, matrix, user])
}
