import { getQueryClause } from '@/clauses/registry'
import { EmptyState } from '@/components/shared/EmptyState'
import { useQueryStore } from '@/store/useQueryStore'
import { ClauseCard } from './ClauseCard'

export function BuilderCanvas() {
  const { instances, updateInstanceValue, removeInstance, moveInstance } = useQueryStore()

  if (!instances.length) {
    return (
      <EmptyState
        title="Start building your query"
        description="Pick a clause from the left sidebar to add it to your query."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {instances.map((instance, index) => {
        const clause = getQueryClause(instance.clauseId)
        if (!clause) return null
        return (
          <ClauseCard
            key={instance.instanceId}
            clause={clause}
            value={instance.value}
            onChange={(value) => updateInstanceValue(instance.instanceId, value)}
            onRemove={() => removeInstance(instance.instanceId)}
            onMoveUp={() => moveInstance(instance.instanceId, 'up')}
            onMoveDown={() => moveInstance(instance.instanceId, 'down')}
            canMoveUp={index > 0}
            canMoveDown={index < instances.length - 1}
          />
        )
      })}
    </div>
  )
}
