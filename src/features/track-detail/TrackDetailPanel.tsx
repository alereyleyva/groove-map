import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button, Input, Select } from "../../components/ui";
import { formatDuration, formatNumber } from "../../lib/format";
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
  const [showAllMatches, setShowAllMatches] = useState(false);

  useEffect(() => {
    if (!selectedTrack) return;
    setNote(selectedTrack.notes ?? "");
    setManualBpm(selectedTrack.bpm?.toString() ?? "");
    setManualKey(selectedTrack.musicalKey ?? "");
    setManualCamelot(selectedTrack.camelot ?? "");
    setManualEnergy(selectedTrack.energyScore?.toString() ?? "");
    setTargetSetId(sets[0]?.id.toString() ?? "");
    setShowAllMatches(false);
  }, [selectedTrack?.id, sets]);

  useEffect(() => {
    api.listSets().then((nextSets) => {
      setSets(nextSets);
      setTargetSetId((current) => current || nextSets[0]?.id.toString() || "");
    }).catch((error) => setStatusMessage(String(error)));
  }, []);

  if (!selectedTrack) {
    return <aside className="hidden w-[408px] shrink-0 border-l border-zinc-800 bg-[#0d1011] xl:block" />;
  }

  const allTags = [...selectedTrack.tags.map((tag) => tag.value), ...selectedTrack.freeTags];
  const visibleMatches = showAllMatches ? matches : matches.slice(0, 3);

  async function addTag() {
    if (!selectedTrack || !tagValue.trim()) return;
    if (selectedTrack.tags.some((tag) => tag.field === tagField && tag.value === tagValue)) return;
    const structuredTags: TrackTag[] = [...selectedTrack.tags, { field: tagField, value: tagValue.trim() }];
    setSelectedTrack(await api.updateTrackTags(selectedTrack.id, structuredTags, selectedTrack.freeTags));
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
    const scores = await api.findMatchesForTrack(track.id, 3);
    setMatches(await Promise.all(scores.map(async (score) => ({ ...score, track: await api.getTrack(score.trackBId) }))));
  }

  async function saveNote() {
    if (!selectedTrack) return;
    setSelectedTrack(await api.updateTrackNotes(selectedTrack.id, note));
  }

  async function addToSet() {
    if (!selectedTrack || !targetSetId) return;
    const set = await api.addTrackToSet(Number(targetSetId), selectedTrack.id);
    setSets(await api.listSets());
    setStatusMessage(`Added to ${set.name}`);
  }

  return (
    <aside className="hidden w-[408px] shrink-0 overflow-auto border-l border-zinc-800 bg-[linear-gradient(180deg,#111415_0%,#090b0c_100%)] xl:block">
      <div className="px-8 py-8">
        <div className="mb-7 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">{selectedTrack.title ?? selectedTrack.fileName}</h2>
            <p className="mt-2 text-base text-zinc-500">{selectedTrack.artist ?? "Unknown artist"}</p>
          </div>
          <button className="text-zinc-500 transition hover:text-zinc-200" onClick={() => { setSelectedTrack(null); setMatches([]); }} aria-label="Close track detail"><X className="size-5" /></button>
        </div>

        <div className="rounded border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-500">
          <div className="mb-2 text-xs uppercase tracking-wide text-zinc-600">File</div>
          <div className="truncate text-zinc-300" title={selectedTrack.filePath}>{selectedTrack.fileName}</div>
          <div className="mt-2 flex justify-between"><span>Duration</span><span>{formatDuration(selectedTrack.durationSeconds)}</span></div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-8 border-b border-zinc-800 pb-6">
          <BigMetric label="BPM" value={formatNumber(selectedTrack.bpm, 0)} />
          <BigMetric label="Key" value={selectedTrack.camelot ?? selectedTrack.musicalKey ?? "--"} />
        </div>

        <Section title="Tags">
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => <span className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-300" key={tag}>{tag}</span>)}
            {allTags.length === 0 && <span className="text-sm text-zinc-500">No tags yet. Add tags in Edit.</span>}
          </div>
        </Section>

        <Section title="Features">
          {selectedTrack.energyScore === null || selectedTrack.energyScore === undefined ? <div className="text-sm text-zinc-500">No analyzed feature values yet.</div> : <Feature label="Energy" value={selectedTrack.energyScore} />}
        </Section>

        <Section title="Top Matches">
          <div className="space-y-4">
            {visibleMatches.map((match) => <MatchCard key={match.trackBId} match={match} />)}
            {matches.length === 0 && <div className="text-sm text-zinc-500">Select a track to calculate local matches.</div>}
            {matches.length > 3 && <button className="mt-2 w-full text-center text-sm text-zinc-400 transition hover:text-cyan-200" onClick={() => setShowAllMatches((current) => !current)}>{showAllMatches ? "Show less" : "Show more"}</button>}
          </div>
        </Section>

        <Section title="Edit">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="BPM" type="number" value={manualBpm} onChange={(event) => setManualBpm(event.target.value)} />
            <Input placeholder="Key" value={manualKey} onChange={(event) => setManualKey(event.target.value)} />
            <Input placeholder="Camelot" value={manualCamelot} onChange={(event) => setManualCamelot(event.target.value)} />
            <Input placeholder="Energy 0-1" type="number" min="0" max="1" step="0.01" value={manualEnergy} onChange={(event) => setManualEnergy(event.target.value)} />
          </div>
          <Button className="mt-2 w-full" onClick={saveAnalysis}>Save analysis override</Button>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => <button className={`rounded border px-3 py-2 text-xs ${selectedTrack.rating === rating ? "border-cyan-400 bg-cyan-400/10 text-cyan-100" : "border-zinc-800 text-zinc-400"}`} key={rating} onClick={() => saveRating(rating)}>★</button>)}
            <Button className="ml-auto" onClick={() => saveRating(null)}>Clear</Button>
          </div>
          <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2">
            <Select value={tagField} onChange={(event) => { const nextField = event.target.value; setTagField(nextField); setTagValue(tagOptions[nextField][0]); }}>{tagFields.map((field) => <option key={field}>{field}</option>)}</Select>
            <Select value={tagValue} onChange={(event) => setTagValue(event.target.value)}>{tagOptions[tagField].map((value) => <option key={value}>{value}</option>)}</Select>
            <Button onClick={addTag}>Add</Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedTrack.tags.map((tag) => <button className="rounded border border-zinc-800 px-2 py-1 text-xs text-zinc-400" key={`${tag.field}-${tag.value}`} onClick={() => removeTag(tag)}>{tag.field}: {tag.value} ×</button>)}
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <Input placeholder="free tag" value={freeTag} onChange={(event) => setFreeTag(event.target.value)} />
            <Button onClick={addFreeTag}>Add</Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedTrack.freeTags.map((tag) => <button className="rounded border border-zinc-800 px-2 py-1 text-xs text-zinc-400" key={tag} onClick={() => removeFreeTag(tag)}>{tag} ×</button>)}
          </div>
          <textarea className="mt-3 min-h-20 w-full rounded border border-zinc-800 bg-zinc-950 p-2 text-zinc-100 outline-none focus:border-cyan-500" value={note || selectedTrack.notes || ""} onChange={(event) => setNote(event.target.value)} />
          <Button className="mt-2 w-full" onClick={saveNote}>Save note</Button>
          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <Select value={targetSetId} onChange={(event) => setTargetSetId(event.target.value)}>{sets.map((set) => <option value={set.id} key={set.id}>{set.name}</option>)}</Select>
            <Button disabled={sets.length === 0} onClick={addToSet}>Add to set</Button>
          </div>
        </Section>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-b border-zinc-800 py-6"><h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</h3>{children}</section>;
}

function BigMetric({ label, value }: { label: string; value: string }) {
  return <div><div className="text-3xl font-medium text-cyan-400">{value}</div><div className="mt-1 text-sm text-zinc-500">{label}</div></div>;
}

function Feature({ label, value, display }: { label: string; value: number; display?: string }) {
  return <div className="mb-4 grid grid-cols-[120px_1fr_44px] items-center gap-3 text-sm"><span>{label}</span><span className="h-1.5 rounded-full bg-zinc-800"><span className="block h-full rounded-full bg-cyan-400" style={{ width: `${Math.min(1, Math.max(0, value)) * 100}%` }} /></span><span className="text-right text-zinc-500">{display ?? value.toFixed(2)}</span></div>;
}

function MatchCard({ match }: { match: MatchRecommendation }) {
  return (
    <div className="grid grid-cols-[52px_1fr_40px] items-center gap-3">
      <div className="size-12 rounded bg-gradient-to-br from-zinc-700 via-zinc-900 to-cyan-950" />
      <div className="min-w-0 text-sm"><div className="truncate text-zinc-200">{match.track.title ?? match.track.fileName}</div><div className="truncate text-zinc-500">{match.track.artist ?? "Unknown"}</div><div className="mt-1 text-xs text-zinc-500">BPM {formatNumber(match.track.bpm, 0)} · Key {match.track.camelot ?? match.track.musicalKey ?? "--"}</div></div>
      <div className="text-right text-2xl font-medium text-cyan-400">{Math.round(match.score)}</div>
    </div>
  );
}
