const groups = {
  Mood: ["dark", "hypnotic", "driving", "raw", "industrial", "mental", "deep", "trippy", "emotional", "cold", "warm", "aggressive", "elegant"],
  Energy: ["warmup", "low", "medium", "high", "peak", "afterhours"],
  Function: ["opener", "builder", "roller", "tool", "transition", "peak-time", "reset", "closer", "bridge", "weapon"],
  Style: ["hypnotic techno", "raw techno", "dub techno", "industrial techno", "hardgroove", "tribal techno", "minimal techno", "acid techno", "detroit", "warehouse"],
  Groove: ["straight", "swing", "rolling", "broken", "tribal", "loopy", "stomping", "syncopated"],
};

export function TagsView() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold text-zinc-100">Structured Tags</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(groups).map(([name, values]) => (
          <section className="rounded border border-zinc-800 bg-zinc-950 p-4" key={name}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">{name}</h2>
            <div className="flex flex-wrap gap-2">{values.map((value) => <span className="rounded border border-zinc-800 px-2 py-1 text-xs text-zinc-300" key={value}>{value}</span>)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
