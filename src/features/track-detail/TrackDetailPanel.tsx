import { useEffect, useState } from "react";
import { Button, Input, Select } from "../../components/ui";
import { formatDuration, formatNumber, tagValues } from "../../lib/format";
import { api } from "../../lib/tauri";
import { useAppStore } from "../../state/app-state";
import type { MatchRecommendation, TrackTag } from "../../types/domain";

const tagOptions: Record<string, string[]> = {
  mood: ["dark", "hypnotic", "driving", "raw", "industrial", "mental", "deep", "trippy", "emotional", "cold", "warm", "aggressive", "elegant"],
  energy: ["warmup", "low", "medium", "high", "peak", "afterhours"],
  function: ["opener", "builder", "roller", "tool", "transition", "peak-time", "reset", "closer", "bridge", "weapon"],
  style: ["hypnotic techno", "raw techno", "dub techno", "industrial techno", "hardgroove", "tribal techno", "minimal techno", "acid techno", "detroit", "warehouse", "ambient techno"],
  groove: ["straight", "swing", "rolling", "broken", "tribal", "loopy", "stomping", "syncopated"],
  vocal: ["none", "short vocal", "spoken", "chant", "heavy vocal"],
  mixability: ["easy", "medium", "risky", "difficult"],
  status: ["new", "reviewed", "tested", "played live", "favorite", "discarded", "needs cueing"],
};

const tagFields = Object.keys(tagOptions);

export function TrackDetailPanel() {
  const { selectedTrack, matches, sets, setSelectedTrack, setMatches, setSets, setStatusMessage } = useAppStore();
  const [note, setNote] = useState("");
  const [tagField, setTagField] = useState("mood");
  const [tagValue, setTagValue] = useState(tagOptions.mood[0]);
  const [freeTag, setFreeTag] = useState("");
  const [manualBpm, setManualBpm] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [manualCamelot, setManualCamelot] = useState("");
  const [manualEnergy, setManualEnergy] = useState("");
  const [targetSetId, setTargetSetId] = useState("");

  useEffect(() => {
    if (!selectedTrack) return;
    setNote(selectedTrack.notes ?? "");
    setManualBpm(selectedTrack.bpm?.toString() ?? "");
    setManualKey(selectedTrack.musicalKey ?? "");
    setManualCamelot(selectedTrack.camelot ?? "");
    setManualEnergy(selectedTrack.energyScore?.toString() ?? "");
    setTargetSetId(sets[0]?.id.toString() ?? "");
  }, [selectedTrack?.id, sets]);

  useEffect(() => {
    api.listSets().then((nextSets) => {
      setSets(nextSets);
      setTargetSetId((current) => current || nextSets[0]?.id.toString() || "");
    }).catch((error) => setStatusMessage(String(error)));
  }, []);

  if (!selectedTrack) {
    return <aside className="hidden w-96 border-l border-zinc-900 bg-zinc-950 xl:block" />;
  }

  async function addTag() {
    if (!selectedTrack || !tagValue.trim()) return;
    if (selectedTrack.tags.some((tag) => tag.field === tagField && tag.value === tagValue)) return;
    const structuredTags: TrackTag[] = [...selectedTrack.tags, { field: tagField, value: tagValue.trim() }];
    const track = await api.updateTrackTags(selectedTrack.id, structuredTags, selectedTrack.freeTags);
    setSelectedTrack(track);
  }

  async function removeTag(tagToRemove: TrackTag) {
    if (!selectedTrack) return;
    const structuredTags = selectedTrack.tags.filter((tag) => !(tag.field === tagToRemove.field && tag.value === tagToRemove.value));
    setSelectedTrack(await api.updateTrackTags(selectedTrack.id, structuredTags, selectedTrack.freeTags));
  }

  async function addFreeTag() {
    if (!selectedTrack || !freeTag.trim()) return;
    const nextTags = [...new Set([...selectedTrack.freeTags, freeTag.trim()])];
    setSelectedTrack(await api.updateTrackTags(selectedTrack.id, selectedTrack.tags, nextTags));
    setFreeTag("");
  }

  async function removeFreeTag(tagToRemove: string) {
    if (!selectedTrack) return;
    setSelectedTrack(await api.updateTrackTags(selectedTrack.id, selectedTrack.tags, selectedTrack.freeTags.filter((tag) => tag !== tagToRemove)));
  }

  async function saveRating(rating: number | null) {
    if (!selectedTrack) return;
    setSelectedTrack(await api.updateTrackRating(selectedTrack.id, rating));
  }

  async function saveAnalysis() {
    if (!selectedTrack) return;
    const track = await api.analyzeTrack({
      trackId: selectedTrack.id,
      bpm: manualBpm ? Number(manualBpm) : null,
      musicalKey: manualKey || null,
      camelot: manualCamelot || null,
      energyScore: manualEnergy ? Number(manualEnergy) : null,
    });
    setSelectedTrack(track);
    const scores = await api.findMatchesForTrack(track.id, 10);
    setMatches(await Promise.all(scores.map(async (score) => ({ ...score, track: await api.getTrack(score.trackBId) }))));
  }

  async function saveNote() {
    if (!selectedTrack) return;
    setSelectedTrack(await api.updateTrackNotes(selectedTrack.id, note));
  }

  async function addToSet() {
    if (!selectedTrack || !targetSetId) return;
    const set = await api.addTrackToSet(Number(targetSetId), selectedTrack.id);
    setSets((await api.listSets()));
    setStatusMessage(`Added to ${set.name}`);
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
            <Input placeholder="BPM" type="number" value={manualBpm} onChange={(event) => setManualBpm(event.target.value)} />
            <Input placeholder="Key" value={manualKey} onChange={(event) => setManualKey(event.target.value)} />
            <Input placeholder="Camelot" value={manualCamelot} onChange={(event) => setManualCamelot(event.target.value)} />
            <Input placeholder="Energy 0-1" type="number" min="0" max="1" step="0.01" value={manualEnergy} onChange={(event) => setManualEnergy(event.target.value)} />
          </div>
          <Button className="mt-2 w-full" onClick={saveAnalysis}>Save analysis override</Button>
        </section>

        <section>
          <h3 className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Structured tags</h3>
          <div className="flex flex-wrap gap-1">
            {selectedTrack.tags.map((tag) => <button className="rounded border border-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:border-red-400/60" key={`${tag.field}-${tag.value}`} onClick={() => removeTag(tag)}>{tag.field}: {tag.value} ×</button>)}
          </div>
          <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
            <Select value={tagField} onChange={(event) => { const nextField = event.target.value; setTagField(nextField); setTagValue(tagOptions[nextField][0]); }}>{tagFields.map((field) => <option key={field}>{field}</option>)}</Select>
            <Select value={tagValue} onChange={(event) => setTagValue(event.target.value)}>{tagOptions[tagField].map((value) => <option key={value}>{value}</option>)}</Select>
            <Button onClick={addTag}>Add</Button>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Free tags</h3>
          <div className="flex flex-wrap gap-1">
            {selectedTrack.freeTags.map((tag) => <button className="rounded border border-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:border-red-400/60" key={tag} onClick={() => removeFreeTag(tag)}>{tag} ×</button>)}
          </div>
          <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
            <Input placeholder="free tag" value={freeTag} onChange={(event) => setFreeTag(event.target.value)} />
            <Button onClick={addFreeTag}>Add</Button>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Rating</h3>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => <button className={`rounded border px-3 py-2 text-xs ${selectedTrack.rating === rating ? "border-cyan-400 bg-cyan-400/10 text-cyan-100" : "border-zinc-800 text-zinc-400"}`} key={rating} onClick={() => saveRating(rating)}>{rating}</button>)}
            <Button className="ml-auto" onClick={() => saveRating(null)}>Clear</Button>
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
            <div className="flex gap-2">
              <Select className="w-32" value={targetSetId} onChange={(event) => setTargetSetId(event.target.value)}>{sets.map((set) => <option value={set.id} key={set.id}>{set.name}</option>)}</Select>
              <Button disabled={sets.length === 0} onClick={addToSet}>Add</Button>
            </div>
          </div>
          <div className="space-y-2">
            {matches.map((match) => <MatchCard key={match.trackBId} match={match} />)}
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

function MatchCard({ match }: { match: MatchRecommendation }) {
  return (
    <div className="rounded border border-zinc-800 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-2 text-xs"><span className="truncate text-zinc-100">{match.track.artist ?? "--"} - {match.track.title ?? match.track.fileName}</span><span className="font-semibold text-cyan-300">{match.score}</span></div>
      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-zinc-500"><span>{match.indicator}</span><span>{formatNumber(match.track.bpm, 1)} BPM · {match.track.camelot ?? match.track.musicalKey ?? "--"}</span></div>
      <p className="mt-2 text-xs text-zinc-300">{match.explanation}</p>
    </div>
  );
}
