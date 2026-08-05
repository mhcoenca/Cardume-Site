import { Button } from '@/components/ui/button'

export function SidebarFooter() {
  return (
    <div className="flex flex-col gap-3 border-t border-border p-5">
      <Button variant="outline" className="w-full" nativeButton={false} render={<a href="/app/" />}>
        Check out the Cardume app
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

      <p className="text-center text-[11px] text-muted-foreground">
        <a
          href="https://ko-fi.com/marcelocoenca"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-foreground"
        >
          Donate
        </a>
      </p>
    </div>
  )
}
