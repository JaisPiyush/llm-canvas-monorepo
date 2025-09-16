import { ResolvedViewContainerContribution } from '@llm-canvas/sdk'
import { signal } from '@preact/signals-react'

export const resolvedViewContainerContributionSignal = signal<ResolvedViewContainerContribution[]>(
  []
)
export const setResolvedViewContainerContribution = (
  contributions: ResolvedViewContainerContribution[]
): void => {
  resolvedViewContainerContributionSignal.value = contributions
}
