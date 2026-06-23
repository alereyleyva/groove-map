import { useEffect, useMemo, useState, useTransition } from "react";
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, type SortingState, useReactTable } from "@tanstack/react-table";
import { FolderPlus, RefreshCw, Search } from "lucide-react";
import { Button, Input, Select, Stat } from "../../components/ui";
import { formatDuration, formatNumber, tagValues } from "../../lib/format";
import { api } from "../../lib/tauri";
import { useAppStore } from "../../state/app-state";
import type { Track, TrackFilters } from "../../types/domain";

const columnHelper = createColumnHelper<Track>();

export function LibraryView() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<TrackFilters>({ limit: 500, offset: 0 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isPending, startTransition] = useTransition();
  const { setSelectedTrack, setMatches, setQueue, setStatusMessage } = useAppStore();

  async function refresh(nextFilters = filters) {
    const summary = await api.listTracks(nextFilters);
    setTracks(summary.tracks);
    setTotal(summary.total);
    setQueue(await api.getAnalysisQueueStatus());
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
    setStatusMessage(`Imported ${result.tracksImported} tracks, skipped ${result.skipped}.`);
    await refresh();
  }

  async function selectTrack(track: Track) {
    setSelectedTrack(track);
    setStatusMessage(`Finding matches for ${track.title ?? track.fileName}`);
    const scores = await api.findMatchesForTrack(track.id, 10);
    const recommendations = await Promise.all(scores.map(async (score) => ({ ...score, track: await api.getTrack(score.trackBId) })));
    setMatches(recommendations);
  }

  function updateFilters(next: TrackFilters) {
    startTransition(() => {
      setFilters(next);
      refresh(next).catch((error) => setStatusMessage(String(error)));
    });
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.title ?? row.fileName, {
        id: "title",
        header: "Title",
        cell: (info) => <span className="font-medium text-zinc-100">{info.getValue()}</span>,
      }),
      columnHelper.accessor((row) => row.artist ?? "--", { id: "artist", header: "Artist" }),
      columnHelper.accessor("bpm", { header: "BPM", cell: (info) => formatNumber(info.getValue(), 1) }),
      columnHelper.accessor((row) => row.camelot ?? row.musicalKey ?? "--", { id: "key", header: "Key" }),
      columnHelper.accessor("energyScore", { header: "Energy", cell: (info) => formatNumber(info.getValue(), 2) }),
      columnHelper.accessor((row) => tagValues(row.tags, "mood").join(", ") || "--", { id: "mood", header: "Mood" }),
      columnHelper.accessor((row) => tagValues(row.tags, "function").join(", ") || "--", { id: "function", header: "Function" }),
      columnHelper.accessor((row) => tagValues(row.tags, "style").join(", ") || "--", { id: "style", header: "Style" }),
      columnHelper.accessor("durationSeconds", { header: "Duration", cell: (info) => formatDuration(info.getValue()) }),
      columnHelper.accessor("rating", { header: "Rating", cell: (info) => info.getValue() ?? "--" }),
      columnHelper.accessor("analysisStatus", { header: "Status" }),
      columnHelper.accessor("filePath", { header: "Path", cell: (info) => <span className="text-zinc-500">{info.getValue()}</span> }),
    ],
    [],
  );

  const table = useReactTable({ data: tracks, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={importFolder}><FolderPlus className="mr-2 inline size-4" />Import folder</Button>
        <Button onClick={() => refresh()}><RefreshCw className="mr-2 inline size-4" />Refresh</Button>
        <div className="relative min-w-72 flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-zinc-600" />
          <Input className="w-full pl-9" placeholder="Search title, artist or filename" value={filters.search ?? ""} onChange={(event) => updateFilters({ ...filters, search: event.target.value })} />
        </div>
        <Input className="w-24" placeholder="BPM min" type="number" onChange={(event) => updateFilters({ ...filters, bpmMin: event.target.value ? Number(event.target.value) : undefined })} />
        <Input className="w-24" placeholder="BPM max" type="number" onChange={(event) => updateFilters({ ...filters, bpmMax: event.target.value ? Number(event.target.value) : undefined })} />
        <Input className="w-24" placeholder="Key" value={filters.key ?? ""} onChange={(event) => updateFilters({ ...filters, key: event.target.value || undefined })} />
        <Input className="w-24" placeholder="E min" type="number" min="0" max="1" step="0.1" onChange={(event) => updateFilters({ ...filters, energyMin: event.target.value ? Number(event.target.value) : undefined })} />
        <Input className="w-24" placeholder="E max" type="number" min="0" max="1" step="0.1" onChange={(event) => updateFilters({ ...filters, energyMax: event.target.value ? Number(event.target.value) : undefined })} />
        <Select className="w-36" value={filters.mood ?? ""} onChange={(event) => updateFilters({ ...filters, mood: event.target.value || undefined })}>
          <option value="">Any mood</option><option value="dark">dark</option><option value="hypnotic">hypnotic</option><option value="driving">driving</option><option value="raw">raw</option><option value="industrial">industrial</option>
        </Select>
        <Select className="w-36" value={filters.functionTag ?? ""} onChange={(event) => updateFilters({ ...filters, functionTag: event.target.value || undefined })}>
          <option value="">Any function</option><option value="opener">opener</option><option value="builder">builder</option><option value="roller">roller</option><option value="tool">tool</option><option value="peak-time">peak-time</option><option value="closer">closer</option>
        </Select>
        <Select className="w-36" value={filters.status ?? ""} onChange={(event) => updateFilters({ ...filters, status: event.target.value || undefined })}>
          <option value="">Any status</option>
          <option value="pending">pending</option>
          <option value="done">done</option>
          <option value="failed">failed</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Stat label="Visible" value={tracks.length} />
        <Stat label="Total" value={total} />
        <Stat label="Mode" value="offline" />
        <Stat label="Refresh" value={isPending ? "loading" : "ready"} />
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded border border-zinc-800 bg-zinc-950/80">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 bg-zinc-950 text-[10px] uppercase tracking-wide text-zinc-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => <th key={header.id} className="cursor-pointer border-b border-zinc-800 px-3 py-2" onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header, header.getContext())}<span className="ml-1 text-cyan-500">{{ asc: "↑", desc: "↓" }[header.column.getIsSorted() as string] ?? ""}</span></th>)}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="cursor-pointer border-b border-zinc-900 hover:bg-cyan-400/5" onClick={() => selectTrack(row.original)}>
                {row.getVisibleCells().map((cell) => <td key={cell.id} className="max-w-72 truncate px-3 py-2 text-zinc-300">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {tracks.length === 0 && <div className="p-10 text-center text-sm text-zinc-500">Import a local music folder to build the library.</div>}
      </div>
    </div>
  );
}
