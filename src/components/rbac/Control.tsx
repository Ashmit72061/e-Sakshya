import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCan } from '@/lib/permissions'
import type { ControlArea } from '@/lib/types'
import { BUILTIN_CONTROLS, useRbac } from '@/store/rbac'

export function useControl(id: string): boolean {
  const controls = useRbac((state) => state.controls)
  const customControls = useRbac((state) => state.customControls)
  const can = useCan()
  const definition = BUILTIN_CONTROLS.find((control) => control.id === id) ?? customControls.find((control) => control.id === id)
  if (!definition) return false
  return (definition.builtin ? controls[id] ?? true : true) && (!definition.permission || can(definition.permission))
}

export function Control({ id, children, fallback = null }: { id: string; children: ReactNode; fallback?: ReactNode }): ReactNode {
  return useControl(id) ? children : fallback
}

export function CustomControlsDock({ area }: { area: ControlArea }): ReactNode {
  const customControls = useRbac((state) => state.customControls)
  const controls = customControls.filter((control) => control.area === area)
  if (!controls.length) return null
  return <div className="flex gap-2">{controls.map((control) => <Button key={control.id} size="sm" variant="outline" onClick={() => runControl(control.id)}>{control.label}</Button>)}</div>
}

export function runControl(id: string, handlers?: Record<string, () => void>): void {
  const { controls, customControls } = useRbac.getState()
  const definition = BUILTIN_CONTROLS.find((control) => control.id === id) ?? customControls.find((control) => control.id === id)
  if (!definition || (definition.builtin && !(controls[id] ?? true))) return
  if (handlers?.[id]) {
    handlers[id]()
    return
  }
  toast.info(`${definition.label} — display-only control (no-op)`)
}
