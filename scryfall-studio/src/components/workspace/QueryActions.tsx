import { useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QueryActionsProps {
  query: string
  url: string
}

export function QueryActions({ query, url }: QueryActionsProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(query)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleOpen() {
    window.open(url, '_blank', 'noreferrer')
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" className="flex-1" disabled={!query} onClick={handleCopy}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy Query'}
      </Button>
      <Button className="flex-1" disabled={!query} onClick={handleOpen}>
        <ExternalLink className="h-3.5 w-3.5" />
        Open in Scryfall
      </Button>
    </div>
  )
}
