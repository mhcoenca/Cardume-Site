export function SidebarFooter() {
  return (
    <div className="border-t border-border p-3">
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
