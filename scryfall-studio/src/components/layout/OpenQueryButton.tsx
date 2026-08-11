import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useQueryStore } from '@/store/useQueryStore'

export function OpenQueryButton() {
  const { hasActiveSearch, url } = useQueryStore()

  function handleOpen() {
    window.open(url, '_blank', 'noreferrer')
  }

  if (hasActiveSearch) {
    return (
      <Button variant="ghost" className="w-full" onClick={handleOpen}>
        <ExternalLink className="h-3.5 w-3.5" />
        Open Query in Scryfall
      </Button>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="block w-full" />}>
        <Button variant="ghost" className="w-full" disabled>
          <ExternalLink className="h-3.5 w-3.5" />
          Open Query in Scryfall
        </Button>
      </TooltipTrigger>
      <TooltipContent>Add at least one filter to enable this.</TooltipContent>
    </Tooltip>
  )
}
