import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Input, Select, Stat } from "../../components/ui";
import { formatDuration, formatNumber } from "../../lib/format";
import { api } from "../../lib/tauri";
import { useAppStore } from "../../state/app-state";
import type { SetDraft } from "../../types/domain";

const builderSchema = z.object({
  name: z.string().min(1),
  durationTargetMinutes: z.coerce.number().min(15),
  bpmMin: z.coerce.number().optional(),
  bpmMax: z.coerce.number().optional(),
  mood: z.string().optional(),
});

type BuilderForm = z.infer<typeof builderSchema>;

export function SetBuilderView() {
  const [draft, setDraft] = useState<SetDraft | null>(null);
  const { setStatusMessage } = useAppStore();
  const { register, handleSubmit } = useForm<BuilderForm>({ defaultValues: { name: "90 min hypnotic build", durationTargetMinutes: 90, bpmMin: 128, bpmMax: 134, mood: "hypnotic" } });

  async function onSubmit(values: BuilderForm) {
    const parsed = builderSchema.parse(values);
    setDraft(await api.generateSetDraft({ ...parsed, requiredTrackIds: [], excludedTrackIds: [] }));
  }

  async function saveDraft() {
    if (!draft) return;
    const set = await api.createSet({ name: draft.name, description: draft.explanation, durationTargetMinutes: Math.round(draft.totalDurationMinutes), context: "practice", notes: draft.warnings.join("\n") });
    for (const track of draft.tracks) await api.addTrackToSet(set.id, track.id);
    setStatusMessage(`Saved draft as set: ${set.name}`);
  }

  return (
    <div className="grid h-full grid-cols-[360px_1fr] gap-4 p-4">
      <form className="space-y-3 rounded border border-zinc-800 bg-zinc-950 p-4" onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Set Builder</h1>
        <Input placeholder="Set name" {...register("name")} />
        <Input placeholder="Duration minutes" type="number" {...register("durationTargetMinutes")} />
        <div className="grid grid-cols-2 gap-2"><Input placeholder="BPM min" type="number" {...register("bpmMin")} /><Input placeholder="BPM max" type="number" {...register("bpmMax")} /></div>
        <Select {...register("mood")}><option value="hypnotic">hypnotic</option><option value="dark">dark</option><option value="driving">driving</option><option value="raw">raw</option><option value="industrial">industrial</option></Select>
        <Button className="w-full" type="submit">Generate draft</Button>
      </form>
      <section className="min-w-0 overflow-auto rounded border border-zinc-800 bg-zinc-950/80 p-4">
        {draft ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold text-zinc-100">{draft.name}</h2><p className="text-sm text-zinc-500">{draft.explanation}</p></div><Button onClick={saveDraft}>Save as set</Button></div>
            <div className="grid grid-cols-3 gap-2"><Stat label="Tracks" value={draft.tracks.length} /><Stat label="Duration" value={`${formatNumber(draft.totalDurationMinutes, 1)} min`} /><Stat label="Warnings" value={draft.warnings.length} /></div>
            {draft.warnings.map((warning) => <div className="rounded border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200" key={warning}>{warning}</div>)}
            <div className="space-y-2">{draft.tracks.map((track, index) => <div className="grid grid-cols-[48px_1fr_80px_80px] rounded border border-zinc-900 bg-black/20 px-3 py-2 text-sm" key={track.id}><span className="text-zinc-500">{index + 1}</span><span>{track.artist ?? "--"} - {track.title ?? track.fileName}</span><span>{formatNumber(track.bpm, 1)}</span><span>{formatDuration(track.durationSeconds)}</span></div>)}</div>
          </div>
        ) : <div className="p-10 text-center text-sm text-zinc-500">Generate a heuristic set draft from analyzed tracks.</div>}
      </section>
    </div>
  );
}
