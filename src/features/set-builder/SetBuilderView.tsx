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
    <div className="grid h-full min-w-0 grid-cols-1 gap-5 p-5 lg:grid-cols-[360px_1fr] lg:p-8">
      <form className="h-fit space-y-3 rounded-md border border-[#303437] bg-[#111516] p-5" onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-lg font-medium text-[#f0f2f2]">Set Builder</h1>
        <p className="text-sm text-[#858b90]">Generate a local heuristic draft from imported and analyzed tracks.</p>
        <Input placeholder="Set name" {...register("name")} />
        <Input placeholder="Duration minutes" type="number" {...register("durationTargetMinutes")} />
        <div className="grid grid-cols-2 gap-2"><Input placeholder="BPM min" type="number" {...register("bpmMin")} /><Input placeholder="BPM max" type="number" {...register("bpmMax")} /></div>
        <Select {...register("mood")}><option value="hypnotic">hypnotic</option><option value="dark">dark</option><option value="driving">driving</option><option value="raw">raw</option><option value="industrial">industrial</option></Select>
        <Button className="w-full" tone="primary" type="submit">Generate Draft</Button>
      </form>
      <section className="min-h-0 min-w-0 overflow-auto rounded-md border border-[#303437] bg-[#111516] p-5">
        {draft ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"><div><h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#f0f2f2]">{draft.name}</h2><p className="mt-1 text-sm text-[#858b90]">{draft.explanation}</p></div><Button tone="primary" onClick={saveDraft}>Save as Set</Button></div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3"><Stat label="Tracks" value={draft.tracks.length} /><Stat label="Duration" value={`${formatNumber(draft.totalDurationMinutes, 1)} min`} /><Stat label="Warnings" value={draft.warnings.length} /></div>
            {draft.warnings.map((warning) => <div className="rounded-md border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100" key={warning}>{warning}</div>)}
            <div className="overflow-hidden rounded-md border border-[#303437]">
              {draft.tracks.map((track, index) => <div className="grid min-h-14 grid-cols-[48px_minmax(160px,1fr)_80px_80px] items-center border-b border-[#262b2e] bg-[#101314] px-4 text-sm text-[#cfd3d6] last:border-b-0" key={track.id}><span className="text-[#858b90]">{index + 1}</span><span className="truncate text-[#f0f2f2]">{track.artist ?? "--"} - {track.title ?? track.fileName}</span><span>{formatNumber(track.bpm, 1)}</span><span>{formatDuration(track.durationSeconds)}</span></div>)}
            </div>
          </div>
        ) : <div className="grid h-full place-items-center p-10 text-center text-sm text-[#858b90]">Generate a heuristic set draft from analyzed tracks.</div>}
      </section>
    </div>
  );
}
