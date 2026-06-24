import { useEffect, useState, useTransition } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, FolderPlus, MoreVertical, RefreshCw, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
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
    <div className="flex h-full min-w-0 flex-col px-5 py-6">
      <div className="mb-5 flex items-center justify-between gap-6">
        <div className="relative max-w-[650px] flex-1">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-500" />
          <Input className="h-[60px] w-full rounded border-zinc-800 bg-[#111518] pl-12 text-base shadow-inner shadow-black/30 placeholder:text-zinc-500" placeholder="Search tracks, artists, labels, tags..." value={filters.search ?? ""} onChange={(event) => updateFilters({ ...filters, search: event.target.value || undefined, offset: 0 })} />
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-[60px] rounded border-zinc-800 bg-[#111518] px-6 text-sm normal-case tracking-normal text-zinc-200 hover:bg-zinc-900" onClick={importFolder}><FolderPlus className="mr-2 inline size-5" />Import Folder</Button>
          <Button className="h-[60px] rounded border-zinc-800 bg-[#111518] px-6 text-sm normal-case tracking-normal text-zinc-200 hover:bg-zinc-900" onClick={rescan} disabled={sources.length === 0}><RefreshCw className="mr-2 inline size-5" />Rescan</Button>
        </div>
      </div>

      <div className="mb-5 overflow-hidden rounded border border-zinc-800 bg-[#101417]">
        <div className="grid grid-cols-7 divide-x divide-zinc-800 text-sm">
          <FilterRange label="BPM" min={filters.bpmMin} max={filters.bpmMax} onMinChange={(value) => updateFilters({ ...filters, bpmMin: value, offset: 0 })} onMaxChange={(value) => updateFilters({ ...filters, bpmMax: value, offset: 0 })} />
          <FilterText label="Key" value={filters.key ?? ""} placeholder="All" onChange={(value) => updateFilters({ ...filters, key: value || undefined, offset: 0 })} />
          <FilterSelect label="Energy" value={energyFilterValue(filters)} options={["All", "Low", "Medium", "High"]} onChange={(value) => updateFilters({ ...filters, ...energyFilter(value), offset: 0 })} />
          <FilterSelect label="Mood" value={filters.mood ?? ""} options={["All", "dark", "hypnotic", "driving", "raw", "industrial", "deep", "warm"]} onChange={(value) => updateFilters({ ...filters, mood: value || undefined, offset: 0 })} />
          <FilterSelect label="Function" value={filters.functionTag ?? ""} options={["All", "opener", "builder", "roller", "tool", "peak-time", "closer"]} onChange={(value) => updateFilters({ ...filters, functionTag: value || undefined, offset: 0 })} />
          <FilterSelect label="Style" value={filters.style ?? ""} options={["All", "hypnotic techno", "raw techno", "dub techno", "industrial techno", "hardgroove", "tribal techno", "minimal techno"]} onChange={(value) => updateFilters({ ...filters, style: value || undefined, offset: 0 })} />
          <button className="flex items-center justify-center gap-2 px-5 py-4 text-zinc-300" onClick={resetFilters}><RotateCcw className="size-4" />Reset</button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
        <button className={`rounded-full border px-4 py-2 text-xs ${!filters.sourceId ? "border-cyan-400 bg-cyan-400/10 text-cyan-100" : "border-zinc-800 bg-zinc-950 text-zinc-400"}`} onClick={() => updateFilters({ ...filters, sourceId: undefined, offset: 0 })}>All folders</button>
        {sources.map((source) => (
          <button className={`max-w-64 truncate rounded-full border px-4 py-2 text-xs ${filters.sourceId === source.id ? "border-cyan-400 bg-cyan-400/10 text-cyan-100" : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-100"}`} key={source.id} title={source.path} onClick={() => updateFilters({ ...filters, sourceId: source.id, offset: 0 })}>{source.name}</button>
        ))}
        <span className="ml-auto flex items-center gap-2 text-xs text-zinc-500"><SlidersHorizontal className="size-4" />{selectedSource ? selectedSource.path : "All imported music folders"}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded border border-zinc-800 bg-[#101312]">
        <div className="grid h-12 grid-cols-[44px_1.35fr_1.05fr_80px_85px_130px_130px_100px_120px_36px] items-center border-b border-zinc-800 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <span className="size-5 rounded border border-zinc-700" />
          <span>Title</span><span>Artist</span><span>BPM</span><span>Key</span><span>Energy</span><span>Mood</span><span>Function</span><span>Duration</span><span />
        </div>
        <div className="h-[calc(100%-48px)] overflow-auto">
          {tracks.map((track) => {
            const active = selectedTrack?.id === track.id;
            return (
              <button className={`grid w-full grid-cols-[44px_1.35fr_1.05fr_80px_85px_130px_130px_100px_120px_36px] items-center border-b border-zinc-800/80 px-3 py-3 text-left text-sm transition ${active ? "bg-cyan-400/15 text-zinc-100" : "text-zinc-300 hover:bg-zinc-900/80"}`} key={track.id} onClick={() => selectTrack(track)}>
                <span className={`grid size-5 place-items-center rounded border ${active ? "border-cyan-400 bg-cyan-400 text-[#071014]" : "border-zinc-700"}`}>{active ? "✓" : ""}</span>
                <span className="truncate font-medium">{track.title ?? track.fileName}</span>
                <span className="truncate text-zinc-300">{track.artist ?? "Unknown"}</span>
                <span>{formatNumber(track.bpm, 0)}</span>
                <span className="font-medium text-sky-400">{track.camelot ?? track.musicalKey ?? "--"}</span>
                <EnergyBars value={track.energyScore} />
                <span className="truncate">{tagValues(track.tags, "mood")[0] ?? "--"}</span>
                <span className="truncate text-cyan-300">{tagValues(track.tags, "function")[0] ?? "--"}</span>
                <span>{formatDuration(track.durationSeconds)}</span>
                <MoreVertical className="size-5 text-zinc-500" />
              </button>
            );
          })}
          {tracks.length === 0 && <div className="p-12 text-center text-sm text-zinc-500">Import a local music folder to build the library.</div>}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-zinc-500">
        <span>{pageStart}-{pageEnd} of {total} tracks</span>
        <div className="flex items-center gap-4">
          <span className={isPending ? "text-cyan-300" : ""}>{isPending ? "Loading" : "Ready"}</span>
          <button className="rounded border border-zinc-800 p-1 text-zinc-300 disabled:opacity-40" onClick={previousPage} disabled={(filters.offset ?? 0) === 0}><ChevronLeft className="size-4" /></button>
          <button className="rounded border border-zinc-800 p-1 text-zinc-300 disabled:opacity-40" onClick={nextPage} disabled={(filters.offset ?? 0) + tracks.length >= total}><ChevronRight className="size-4" /></button>
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
  return <label className="px-5 py-3"><span className="mb-1 block text-xs text-zinc-500">{label}</span><span className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"><input className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600" placeholder="Min" type="number" value={min ?? ""} onChange={(event) => onMinChange(event.target.value ? Number(event.target.value) : undefined)} /><span className="text-zinc-600">-</span><input className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600" placeholder="Max" type="number" value={max ?? ""} onChange={(event) => onMaxChange(event.target.value ? Number(event.target.value) : undefined)} /></span></label>;
}

function FilterText({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return <label className="px-5 py-3"><span className="mb-1 block text-xs text-zinc-500">{label}</span><input className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="relative px-5 py-3"><span className="mb-1 block text-xs text-zinc-500">{label}</span><select className="w-full appearance-none bg-transparent text-sm text-zinc-200 outline-none" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option className="bg-zinc-950" value={option === "All" ? "" : option} key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-5 top-8 size-4 text-zinc-500" /></label>;
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

function EnergyBars({ value }: { value?: number | null }) {
  const level = Math.max(1, Math.round((value ?? 0.65) * 9));
  return <span className="flex gap-1">{Array.from({ length: 9 }).map((_, index) => <span className={`h-4 w-1.5 ${index < level ? "bg-cyan-300" : "bg-zinc-700"}`} key={index} />)}</span>;
}
