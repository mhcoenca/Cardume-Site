import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useQueryStore } from '@/store/useQueryStore'

export function OpenQueryButton() {
  const { query, url } = useQueryStore()
  const hasQuery = query.trim().length > 0

  function handleOpen() {
    window.open(url, '_blank', 'noreferrer')
  }

  if (hasQuery) {
    return (
      <Button variant="outline" className="w-full" onClick={handleOpen}>
        <ExternalLink className="h-3.5 w-3.5" />
        Open Query in Scryfall
      </Button>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="block w-full" />}>
        <Button variant="outline" className="w-full" disabled>
          <ExternalLink className="h-3.5 w-3.5" />
          Open Query in Scryfall
        </Button>
      </TooltipTrigger>
      <TooltipContent>Add at least one filter to enable this.</TooltipContent>
    </Tooltip>
  )
}
