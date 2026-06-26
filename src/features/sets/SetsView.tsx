import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button, Input, Select, Stat } from "../../components/ui";
import { formatDuration, formatNumber } from "../../lib/format";
import { api } from "../../lib/tauri";
import { useAppStore } from "../../state/app-state";
import type { SetRecord } from "../../types/domain";

const setSchema = z.object({
  name: z.string().min(1),
  context: z.string().optional(),
  durationTargetMinutes: z.coerce.number().min(1).optional(),
  energyArc: z.string().optional(),
  bpmMin: z.coerce.number().optional(),
  bpmMax: z.coerce.number().optional(),
});

type SetForm = z.infer<typeof setSchema>;

export function SetsView() {
  const { sets, setSets, setStatusMessage } = useAppStore();
  const [selectedSet, setSelectedSet] = useState<SetRecord | null>(null);
  const { register, handleSubmit, reset } = useForm<SetForm>({ defaultValues: { name: "New techno set", durationTargetMinutes: 90, energyArc: "slow build" } });

  async function refresh() {
    const nextSets = await api.listSets();
    setSets(nextSets);
    setSelectedSet(nextSets[0] ?? null);
  }

  useEffect(() => {
    refresh().catch((error) => setStatusMessage(String(error)));
  }, []);

  async function onSubmit(values: SetForm) {
    const parsed = setSchema.parse(values);
    const set = await api.createSet({ ...parsed, description: null, notes: null });
    reset({ name: "New techno set", durationTargetMinutes: 90, energyArc: "slow build" });
    await refresh();
    setSelectedSet(set);
  }

  async function exportSet(format: "csv" | "json" | "m3u") {
    if (!selectedSet) return;
    const content = format === "csv" ? await api.exportSetCsv(selectedSet.id) : format === "json" ? await api.exportSetJson(selectedSet.id) : await api.exportSetM3u(selectedSet.id);
    await navigator.clipboard.writeText(content);
    setStatusMessage(`Copied ${format.toUpperCase()} export to clipboard.`);
  }

  const totalSeconds = selectedSet?.tracks.reduce((sum, item) => sum + (item.track?.durationSeconds ?? 0), 0) ?? 0;

  return (
    <div className="grid h-full min-w-0 grid-cols-1 gap-5 p-5 lg:grid-cols-[360px_1fr] lg:p-8">
      <section className="min-h-0 space-y-4 overflow-auto">
        <form className="space-y-3 rounded-md border border-[#303437] bg-[#111516] p-5" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-lg font-medium text-[#f0f2f2]">Create Set</h2>
          <Input placeholder="Name" {...register("name")} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Minutes" type="number" {...register("durationTargetMinutes")} />
            <Select {...register("context")}>
              <option value="club">club</option><option value="festival">festival</option><option value="podcast">podcast</option><option value="warmup">warmup</option><option value="afterhours">afterhours</option>
            </Select>
          </div>
          <Select {...register("energyArc")}>
            <option value="flat">flat</option><option value="slow build">slow build</option><option value="wave">wave</option><option value="peak late">peak late</option><option value="dark journey">dark journey</option>
          </Select>
          <div className="grid grid-cols-2 gap-2"><Input placeholder="BPM min" type="number" {...register("bpmMin")} /><Input placeholder="BPM max" type="number" {...register("bpmMax")} /></div>
          <Button className="w-full" tone="primary" type="submit">Create</Button>
        </form>

        <div className="space-y-2">
          {sets.map((set) => (
            <button key={set.id} className={`w-full rounded-md border p-4 text-left transition ${selectedSet?.id === set.id ? "border-[#78c7e8] bg-[#1c333d]" : "border-[#303437] bg-[#111516] hover:border-[#464b4f] hover:bg-[#171b1d]"}`} onClick={() => setSelectedSet(set)}>
              <div className="font-medium text-[#f0f2f2]">{set.name}</div>
              <div className="mt-1 text-xs text-[#858b90]">{set.tracks.length} tracks · {set.energyArc ?? "no arc"}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="min-h-0 min-w-0 overflow-hidden rounded-md border border-[#303437] bg-[#111516]">
        {selectedSet ? (
          <div className="flex h-full flex-col">
            <header className="border-b border-[#303437] p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div><h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#f0f2f2]">{selectedSet.name}</h1><p className="mt-1 text-sm text-[#858b90]">{selectedSet.context ?? "practice"} · {selectedSet.energyArc ?? "no arc"}</p></div>
                <div className="flex gap-2"><Button onClick={() => exportSet("csv")}>CSV</Button><Button onClick={() => exportSet("json")}>JSON</Button><Button onClick={() => exportSet("m3u")}>M3U</Button></div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 xl:grid-cols-4"><Stat label="Tracks" value={selectedSet.tracks.length} /><Stat label="Duration" value={formatDuration(totalSeconds)} /><Stat label="BPM min" value={formatNumber(selectedSet.bpmMin)} /><Stat label="BPM max" value={formatNumber(selectedSet.bpmMax)} /></div>
            </header>
            <div className="min-h-0 flex-1 overflow-auto">
              {selectedSet.tracks.map((item) => (
                <div key={item.id} className="grid min-h-14 grid-cols-[48px_minmax(160px,1fr)_80px_80px_110px] items-center border-b border-[#262b2e] px-5 text-sm text-[#cfd3d6]">
                  <span className="text-[#858b90]">{item.position}</span>
                  <span className="truncate text-[#f0f2f2]">{item.track?.artist ?? "--"} - {item.track?.title ?? item.track?.fileName ?? item.trackId}</span>
                  <span>{formatNumber(item.track?.bpm, 1)}</span>
                  <span>{item.track?.camelot ?? "--"}</span>
                  <Button onClick={() => selectedSet && api.removeTrackFromSet(selectedSet.id, item.trackId).then(setSelectedSet)}>Remove</Button>
                </div>
              ))}
              {selectedSet.tracks.length === 0 && <div className="p-10 text-center text-sm text-[#858b90]">Select a track in Library and add it from the detail panel.</div>}
            </div>
          </div>
        ) : <div className="p-10 text-sm text-[#858b90]">Create a set to start sequencing tracks.</div>}
      </section>
    </div>
  );
}
