import { useState } from 'react'
import { Check, Copy, ExternalLink, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QueryActionsProps {
  query: string
  url: string
}

export function QueryActions({ query, url }: QueryActionsProps) {
  const [copiedField, setCopiedField] = useState<'query' | 'url' | null>(null)

  async function handleCopy(field: 'query' | 'url', text: string) {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }

  function handleOpen() {
    window.open(url, '_blank', 'noreferrer')
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          disabled={!query}
          onClick={() => handleCopy('query', query)}
        >
          {copiedField === 'query' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copiedField === 'query' ? 'Copied' : 'Copy Query'}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          disabled={!query}
          onClick={() => handleCopy('url', url)}
        >
          {copiedField === 'url' ? <Check className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
          {copiedField === 'url' ? 'Copied' : 'Copy URL'}
        </Button>
      </div>
      <Button className="w-full" disabled={!query} onClick={handleOpen}>
        <ExternalLink className="h-3.5 w-3.5" />
        Open in Scryfall
      </Button>
    </div>
  )
}
