import { useEffect, useState, useTransition } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, FolderPlus, RefreshCw, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { Button, Input, Select } from "../../components/ui";
import { formatDuration, formatNumber, tagValues } from "../../lib/format";
import { api } from "../../lib/tauri";
import { useAppStore } from "../../state/app-state";
import type { Source, Track, TrackFilters } from "../../types/domain";

const initialFilters: TrackFilters = { limit: 50, offset: 0, bpmMin: 120, bpmMax: 140 };

export function LibraryView() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<TrackFilters>(initialFilters);
  const [isPending, startTransition] = useTransition();
  const { selectedTrack, setSelectedTrack, setMatches, setQueue, setStatusMessage } = useAppStore();

  async function refresh(nextFilters = filters) {
    const [summary, queueStatus, sourceList] = await Promise.all([
      api.listTracks(nextFilters),
      api.getAnalysisQueueStatus(),
      api.listSources(),
    ]);
    setTracks(summary.tracks);
    setTotal(summary.total);
    setQueue(queueStatus);
    setSources(sourceList);
    if (summary.tracks[0] && (!selectedTrack || !summary.tracks.some((track) => track.id === selectedTrack.id))) {
      await selectTrack(summary.tracks[0], false);
    } else if (summary.tracks.length === 0) {
      setSelectedTrack(null);
      setMatches([]);
    }
  }

  useEffect(() => {
    refresh().catch((error) => setStatusMessage(String(error)));
  }, []);

  async function importFolder() {
    const path = await api.selectMusicFolder();
    if (!path) return;
    setStatusMessage(`Importing ${path}`);
    const source = await api.addSource(path, true);
    const result = await api.scanSource(source.id);
    const nextFilters = { ...filters, sourceId: source.id, offset: 0 };
    setFilters(nextFilters);
    setStatusMessage(`Imported ${result.tracksImported} tracks from ${source.name}; skipped ${result.skipped}.`);
    await refresh(nextFilters);
  }

  async function rescan() {
    const targets = filters.sourceId ? sources.filter((source) => source.id === filters.sourceId) : sources;
    if (targets.length === 0) return;
    setStatusMessage(`Rescanning ${targets.length} source${targets.length === 1 ? "" : "s"}`);
    for (const source of targets) {
      await api.scanSource(source.id);
    }
    await refresh();
    setStatusMessage("Source scan complete.");
  }

  async function selectTrack(track: Track, announce = true) {
    setSelectedTrack(track);
    if (announce) setStatusMessage(`Finding matches for ${track.title ?? track.fileName}`);
    const scores = await api.findMatchesForTrack(track.id, 3);
    const recommendations = await Promise.all(scores.map(async (score) => ({ ...score, track: await api.getTrack(score.trackBId) })));
    setMatches(recommendations);
  }

  function updateFilters(next: TrackFilters) {
    startTransition(() => {
      setFilters(next);
      refresh(next).catch((error) => setStatusMessage(String(error)));
    });
  }

  function resetFilters() {
    updateFilters({ limit: 50, offset: 0 });
  }

  function updateLimit(limit: number) {
    updateFilters({ ...filters, limit, offset: 0 });
  }

  function previousPage() {
    updateFilters({ ...filters, offset: Math.max(0, (filters.offset ?? 0) - (filters.limit ?? 50)) });
  }

  function nextPage() {
    const limit = filters.limit ?? 50;
    const nextOffset = (filters.offset ?? 0) + limit;
    if (nextOffset >= total) return;
    updateFilters({ ...filters, offset: nextOffset });
  }

  const selectedSource = sources.find((source) => source.id === filters.sourceId);
  const pageStart = total === 0 ? 0 : (filters.offset ?? 0) + 1;
  const pageEnd = Math.min((filters.offset ?? 0) + tracks.length, total);

  return (
    <div className="flex h-full min-w-0 flex-col">
      <header className="border-b border-[#303437] px-5 py-5 lg:px-9 lg:py-7">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#9ba1a6]" />
            <Input
              className="h-[60px] w-full rounded-md border-[#34383b] bg-[#111516] pl-14 text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] placeholder:text-[#858b90]"
              placeholder="Search tracks, artists, tags..."
              value={filters.search ?? ""}
              onChange={(event) => updateFilters({ ...filters, search: event.target.value || undefined, offset: 0 })}
            />
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Button className="h-[60px] px-6 text-base" onClick={importFolder}><FolderPlus className="size-5" />Import Folder</Button>
            <Button className="h-[60px] px-6 text-base" onClick={rescan} disabled={sources.length === 0}><RefreshCw className="size-5" />Rescan</Button>
            <Button className="h-[60px] px-6 text-base" tone="primary" disabled title="Advanced automatic analysis is not implemented yet.">Analyze</Button>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <FilterRange label="BPM" min={filters.bpmMin} max={filters.bpmMax} onMinChange={(value) => updateFilters({ ...filters, bpmMin: value, offset: 0 })} onMaxChange={(value) => updateFilters({ ...filters, bpmMax: value, offset: 0 })} />
          <FilterText label="Key" value={filters.key ?? ""} placeholder="All" onChange={(value) => updateFilters({ ...filters, key: value || undefined, offset: 0 })} />
          <FilterSelect label="Energy" value={energyFilterValue(filters)} options={["All", "Low", "Medium", "High"]} onChange={(value) => updateFilters({ ...filters, ...energyFilter(value), offset: 0 })} />
          <FilterSelect label="Tags" value={filters.mood ?? filters.functionTag ?? ""} options={["All", "hypnotic", "driving", "industrial", "deep", "rolling", "tool", "peak-time"]} onChange={(value) => updateTagFilter(value, filters, updateFilters)} />
          <button className="inline-flex h-12 items-center gap-2 rounded-md border border-[#34383b] px-4 text-sm text-[#b9bec2] transition hover:bg-[#171b1d]" onClick={resetFilters}><RotateCcw className="size-4" />Reset</button>
        </div>

        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
          <button className={`rounded-full border px-4 py-2 text-xs transition ${!filters.sourceId ? "border-[#78c7e8] bg-[#1c333d] text-[#d9eef7]" : "border-[#303437] bg-[#111516] text-[#9da2a6] hover:text-[#f0f2f2]"}`} onClick={() => updateFilters({ ...filters, sourceId: undefined, offset: 0 })}>All folders</button>
          {sources.map((source) => (
            <button className={`max-w-64 truncate rounded-full border px-4 py-2 text-xs transition ${filters.sourceId === source.id ? "border-[#78c7e8] bg-[#1c333d] text-[#d9eef7]" : "border-[#303437] bg-[#111516] text-[#9da2a6] hover:text-[#f0f2f2]"}`} key={source.id} title={source.path} onClick={() => updateFilters({ ...filters, sourceId: source.id, offset: 0 })}>{source.name}</button>
          ))}
          <span className="ml-auto hidden min-w-0 items-center gap-2 truncate text-xs text-[#858b90] lg:flex"><SlidersHorizontal className="size-4 shrink-0" />{selectedSource ? selectedSource.path : "All imported music folders"}</span>
        </div>
      </header>

      <section className="min-h-0 flex-1 overflow-hidden bg-[#111415]">
        <div className="grid h-[66px] grid-cols-[minmax(180px,1.4fr)_minmax(130px,1fr)_72px_78px_132px_minmax(180px,1.1fr)_86px] items-center border-b border-[#303437] px-8 text-sm font-medium text-[#b6bbc0]">
          <span>Title</span><span>Artist</span><span>BPM</span><span>Key</span><span>Energy</span><span>Tags</span><span className="text-right">Duration</span>
        </div>
        <div className="h-[calc(100%-66px)] overflow-auto">
          {tracks.map((track) => {
            const active = selectedTrack?.id === track.id;
            const tags = visibleTags(track);
            return (
              <button className={`grid min-h-[66px] w-full grid-cols-[minmax(180px,1.4fr)_minmax(130px,1fr)_72px_78px_132px_minmax(180px,1.1fr)_86px] items-center border-b border-[#262b2e] px-8 text-left text-base transition ${active ? "bg-[linear-gradient(90deg,rgba(120,199,232,0.18)_0%,rgba(120,199,232,0.09)_100%)] text-[#f0f2f2] shadow-[inset_4px_0_0_#78c7e8]" : "text-[#ced2d5] hover:bg-[#171b1d]"}`} key={track.id} onClick={() => selectTrack(track)}>
                <span className="min-w-0 truncate font-medium">{track.title ?? track.fileName}</span>
                <span className="min-w-0 truncate">{track.artist ?? "Unknown"}</span>
                <span>{formatNumber(track.bpm, 0)}</span>
                <span>{track.camelot ?? track.musicalKey ?? "--"}</span>
                <EnergyBars value={track.energyScore} />
                <span className="flex min-w-0 flex-wrap gap-2 overflow-hidden py-2">
                  {tags.map((tag) => <span className="rounded bg-[#303639] px-2.5 py-1 text-sm leading-none text-[#d9dddf]" key={tag}>{tag}</span>)}
                  {tags.length === 0 && <span className="text-[#858b90]">--</span>}
                </span>
                <span className="text-right">{formatDuration(track.durationSeconds)}</span>
              </button>
            );
          })}
          {tracks.length === 0 && <div className="p-12 text-center text-sm text-[#858b90]">Import a local music folder to build the library.</div>}
        </div>
      </section>

      <div className="flex h-12 shrink-0 items-center justify-between border-t border-[#303437] bg-[#101314] px-8 text-sm text-[#858b90]">
        <span>{pageStart}-{pageEnd} of {total} tracks</span>
        <div className="flex items-center gap-4">
          <span className={isPending ? "text-[#78c7e8]" : ""}>{isPending ? "Loading" : "Ready"}</span>
          <button className="rounded border border-[#34383b] p-1 text-[#c8cccf] disabled:opacity-40" onClick={previousPage} disabled={(filters.offset ?? 0) === 0}><ChevronLeft className="size-4" /></button>
          <button className="rounded border border-[#34383b] p-1 text-[#c8cccf] disabled:opacity-40" onClick={nextPage} disabled={(filters.offset ?? 0) + tracks.length >= total}><ChevronRight className="size-4" /></button>
          <span>Rows</span>
          <Select className="h-8 w-20" value={filters.limit ?? 50} onChange={(event) => updateLimit(Number(event.target.value))}>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
          </Select>
        </div>
      </div>
    </div>
  );
}

function FilterRange({ label, min, max, onMinChange, onMaxChange }: { label: string; min?: number; max?: number; onMinChange: (value?: number) => void; onMaxChange: (value?: number) => void }) {
  return (
    <label className="grid h-12 w-40 grid-cols-[auto_1fr] items-center gap-3 rounded-md border border-[#34383b] bg-[#111516] px-4 text-sm">
      <span className="text-[#d3d7da]">{label}</span>
      <span className="grid min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-1">
        <input className="min-w-0 bg-transparent text-right text-[#9da2a6] outline-none placeholder:text-[#747a80]" placeholder="Min" type="number" value={min ?? ""} onChange={(event) => onMinChange(event.target.value ? Number(event.target.value) : undefined)} />
        <span className="text-[#5c6368]">-</span>
        <input className="min-w-0 bg-transparent text-[#9da2a6] outline-none placeholder:text-[#747a80]" placeholder="Max" type="number" value={max ?? ""} onChange={(event) => onMaxChange(event.target.value ? Number(event.target.value) : undefined)} />
      </span>
    </label>
  );
}

function FilterText({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return <label className="grid h-12 w-36 grid-cols-[auto_1fr] items-center gap-3 rounded-md border border-[#34383b] bg-[#111516] px-4 text-sm"><span className="text-[#d3d7da]">{label}</span><input className="min-w-0 bg-transparent text-[#9da2a6] outline-none placeholder:text-[#747a80]" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="relative grid h-12 w-36 grid-cols-[auto_1fr] items-center gap-3 rounded-md border border-[#34383b] bg-[#111516] px-4 text-sm"><span className="text-[#d3d7da]">{label}</span><select className="min-w-0 appearance-none bg-transparent pr-5 text-[#9da2a6] outline-none" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option className="bg-[#111516]" value={option === "All" ? "" : option} key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#9da2a6]" /></label>;
}

function energyFilterValue(filters: TrackFilters) {
  if (filters.energyMin === 0.66 && filters.energyMax === 1) return "High";
  if (filters.energyMin === 0.33 && filters.energyMax === 0.66) return "Medium";
  if (filters.energyMin === 0 && filters.energyMax === 0.33) return "Low";
  return "";
}

function energyFilter(value: string): Pick<TrackFilters, "energyMin" | "energyMax"> {
  if (value === "High") return { energyMin: 0.66, energyMax: 1 };
  if (value === "Medium") return { energyMin: 0.33, energyMax: 0.66 };
  if (value === "Low") return { energyMin: 0, energyMax: 0.33 };
  return { energyMin: undefined, energyMax: undefined };
}

function updateTagFilter(value: string, filters: TrackFilters, updateFilters: (next: TrackFilters) => void) {
  const functionTags = new Set(["tool", "peak-time"]);
  updateFilters({
    ...filters,
    mood: value && !functionTags.has(value) ? value : undefined,
    functionTag: value && functionTags.has(value) ? value : undefined,
    offset: 0,
  });
}

function visibleTags(track: Track) {
  return [...tagValues(track.tags, "mood"), ...tagValues(track.tags, "groove"), ...tagValues(track.tags, "function"), ...track.freeTags].slice(0, 3);
}

function EnergyBars({ value }: { value?: number | null }) {
  const level = Math.max(1, Math.round((value ?? 0.65) * 10));
  return <span className="flex gap-1">{Array.from({ length: 10 }).map((_, index) => <span className={`h-5 w-1 ${index < level ? "bg-[#d8f1fb]" : "bg-[#42484c]"}`} key={index} />)}</span>;
}
