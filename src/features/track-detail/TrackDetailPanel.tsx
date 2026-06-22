import { useState } from "react";
import { Button, Input, Select } from "../../components/ui";
import { formatDuration, formatNumber, tagValues } from "../../lib/format";
import { api } from "../../lib/tauri";
import { useAppStore } from "../../state/app-state";
import type { TrackTag } from "../../types/domain";

const tagFields = ["mood", "energy", "function", "style", "groove", "vocal", "mixability", "status"];

export function TrackDetailPanel() {
  const { selectedTrack, matches, sets, setSelectedTrack, setMatches, setStatusMessage } = useAppStore();
  const [note, setNote] = useState("");
  const [tagField, setTagField] = useState("mood");
  const [tagValue, setTagValue] = useState("");
  const [manualBpm, setManualBpm] = useState("");
  const [manualCamelot, setManualCamelot] = useState("");

  if (!selectedTrack) {
    return <aside className="hidden w-96 border-l border-zinc-900 bg-zinc-950 xl:block" />;
  }

  async function addTag() {
    if (!selectedTrack || !tagValue.trim()) return;
    const structuredTags: TrackTag[] = [...selectedTrack.tags, { field: tagField, value: tagValue.trim() }];
    const track = await api.updateTrackTags(selectedTrack.id, structuredTags, selectedTrack.freeTags);
    setSelectedTrack(track);
    setTagValue("");
  }

  async function saveAnalysis() {
    if (!selectedTrack) return;
    const track = await api.analyzeTrack({
      trackId: selectedTrack.id,
      bpm: manualBpm ? Number(manualBpm) : null,
      camelot: manualCamelot || null,
    });
    setSelectedTrack(track);
    setMatches(await api.findMatchesForTrack(track.id, 10));
  }

  async function saveNote() {
    if (!selectedTrack) return;
    setSelectedTrack(await api.updateTrackNotes(selectedTrack.id, note));
  }

  async function addToFirstSet() {
    if (!selectedTrack || sets.length === 0) return;
    await api.addTrackToSet(sets[0].id, selectedTrack.id);
    setStatusMessage(`Added to ${sets[0].name}`);
  }

  return (
    <aside className="hidden w-96 shrink-0 overflow-auto border-l border-zinc-900 bg-zinc-950 xl:block">
      <div className="border-b border-zinc-900 p-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">Track detail</div>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">{selectedTrack.title ?? selectedTrack.fileName}</h2>
        <p className="text-sm text-zinc-500">{selectedTrack.artist ?? "Unknown artist"}</p>
      </div>
      <div className="space-y-5 p-4 text-sm">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Metric label="BPM" value={formatNumber(selectedTrack.bpm, 1)} />
          <Metric label="Key" value={selectedTrack.camelot ?? selectedTrack.musicalKey ?? "--"} />
          <Metric label="Duration" value={formatDuration(selectedTrack.durationSeconds)} />
        </div>

        <section>
          <h3 className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Manual override</h3>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="BPM" value={manualBpm} onChange={(event) => setManualBpm(event.target.value)} />
            <Input placeholder="Camelot" value={manualCamelot} onChange={(event) => setManualCamelot(event.target.value)} />
          </div>
          <Button className="mt-2 w-full" onClick={saveAnalysis}>Save analysis override</Button>
        </section>

        <section>
          <h3 className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Structured tags</h3>
          <div className="flex flex-wrap gap-1">
            {selectedTrack.tags.map((tag) => <span className="rounded border border-zinc-800 px-2 py-1 text-xs text-zinc-300" key={`${tag.field}-${tag.value}`}>{tag.field}: {tag.value}</span>)}
          </div>
          <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
            <Select value={tagField} onChange={(event) => setTagField(event.target.value)}>{tagFields.map((field) => <option key={field}>{field}</option>)}</Select>
            <Input placeholder="value" value={tagValue} onChange={(event) => setTagValue(event.target.value)} />
            <Button onClick={addTag}>Add</Button>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Notes</h3>
          <textarea className="min-h-24 w-full rounded border border-zinc-800 bg-zinc-950 p-2 text-zinc-100 outline-none focus:border-cyan-500" value={note || selectedTrack.notes || ""} onChange={(event) => setNote(event.target.value)} />
          <Button className="mt-2 w-full" onClick={saveNote}>Save note</Button>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wide text-zinc-500">Top matches</h3>
            <Button disabled={sets.length === 0} onClick={addToFirstSet}>Add to set</Button>
          </div>
          <div className="space-y-2">
            {matches.map((match) => <MatchCard key={match.trackBId} matchId={match.trackBId} score={match.score} indicator={match.indicator} explanation={match.explanation} />)}
          </div>
        </section>

        <section className="text-xs text-zinc-500">
          <p>{selectedTrack.filePath}</p>
          <p className="mt-2">Mood: {tagValues(selectedTrack.tags, "mood").join(", ") || "--"}</p>
        </section>
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded border border-zinc-800 bg-black/30 p-2"><div className="text-[10px] text-zinc-500">{label}</div><div className="font-semibold text-zinc-100">{value}</div></div>;
}

function MatchCard({ matchId, score, indicator, explanation }: { matchId: number; score: number; indicator: string; explanation: string }) {
  return (
    <div className="rounded border border-zinc-800 bg-black/20 p-3">
      <div className="flex items-center justify-between text-xs"><span className="text-zinc-400">Track #{matchId}</span><span className="font-semibold text-cyan-300">{score}</span></div>
      <div className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500">{indicator}</div>
      <p className="mt-2 text-xs text-zinc-300">{explanation}</p>
    </div>
  );
}
