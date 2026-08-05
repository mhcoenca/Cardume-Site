import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SidebarFooter() {
  return (
    <div className="flex flex-col gap-3 border-t border-border p-5">
      <Button variant="outline" className="w-full" nativeButton={false} render={<a href="/" />}>
        Check out the Cardume app
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">
        Built by{' '}
        <a
          href="https://marcelocoenca.com"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-foreground"
        >
          Marcelo Coenca
        </a>{' '}
        · Powered by the{' '}
        <a
          href="https://scryfall.com"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-foreground"
        >
          Scryfall team
        </a>
      </p>
    </div>
  )
}
