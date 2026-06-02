export function WebPlannerSkeleton() {
  return (
    <div className="flex h-dvh flex-col bg-cream">
      <header className="h-14 shrink-0 bg-cream border-b border-charcoal-15 flex items-center px-md gap-md">
        <span className="font-serif text-lede text-charcoal">Tarmil</span>
        <div className="flex-1 flex flex-col items-center gap-xs">
          <div className="h-2 w-20 rounded-full bg-charcoal-8 animate-pulse" />
          <div className="h-3 w-48 rounded-full bg-sand animate-pulse" />
        </div>
        <div className="flex items-center gap-md">
          <div className="h-3 w-12 rounded-full bg-sand animate-pulse" />
          <div className="h-3 w-16 rounded-full bg-sand animate-pulse" />
          <div className="h-8 w-8 rounded-full bg-sand animate-pulse" />
        </div>
      </header>
      <div className="flex-1 flex min-h-0 flex-col md:flex-row">
        <aside className="w-full md:w-96 md:shrink-0 max-h-[45dvh] md:max-h-none border-b md:border-b-0 md:border-e border-charcoal-15 bg-cream p-md flex flex-col gap-md">
          <div className="h-36 rounded-2xl bg-sand animate-pulse" />
          <div className="h-3 w-20 rounded-full bg-charcoal-8 animate-pulse" />
          <div className="flex flex-col gap-md">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-sm">
                <div className="h-8 w-8 rounded-full bg-clay animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col gap-xs">
                  <div className="h-3 w-32 rounded-full bg-sand animate-pulse" />
                  <div className="h-2 w-24 rounded-full bg-sand animate-pulse" />
                  <div className="h-2 w-40 rounded-full bg-sand animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </aside>
        <div className="flex-1 min-h-0 bg-gradient-to-br from-clay to-sand animate-pulse" />
      </div>
    </div>
  );
}
