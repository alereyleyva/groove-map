import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
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
    return <aside className="hidden w-[392px] shrink-0 border-l border-[#303437] bg-[#101314] xl:block" />;
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
    <aside className="hidden w-[392px] shrink-0 overflow-auto border-l border-[#303437] bg-[linear-gradient(180deg,#15191b_0%,#0e1112_100%)] xl:block">
      <div className="px-7 py-8">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xl font-medium text-[#d9dddf]">Track <ChevronDown className="size-5 text-[#9da2a6]" /></div>
          <button className="text-[#858b90] transition hover:text-[#f0f2f2]" onClick={() => { setSelectedTrack(null); setMatches([]); }} aria-label="Close track detail"><X className="size-5" /></button>
        </div>

        <Field label="Title" value={selectedTrack.title ?? selectedTrack.fileName} />
        <Field label="Artist" value={selectedTrack.artist ?? "Unknown"} />
        <Field label="BPM" value={formatNumber(selectedTrack.bpm, 0)} />
        <Field label="Key" value={selectedTrack.camelot ?? selectedTrack.musicalKey ?? "--"} />
        <Field label="Duration" value={formatDuration(selectedTrack.durationSeconds)} />

        <Section title="Tags">
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => <span className="rounded bg-[#303639] px-3 py-2 text-sm leading-none text-[#d9dddf]" key={tag}>{tag}</span>)}
            {allTags.length === 0 && <span className="text-sm text-[#858b90]">No tags yet. Add tags below.</span>}
          </div>
        </Section>

        <Section title="Notes">
          <textarea className="min-h-36 w-full resize-none rounded-md border border-[#34383b] bg-[#111516] p-4 text-base leading-7 text-[#e4e6e7] outline-none placeholder:text-[#747a80] focus:border-[#78c7e8]" placeholder="Add preparation notes for this track..." value={note} onChange={(event) => setNote(event.target.value)} />
          <Button className="mt-3 w-full" onClick={saveNote}>Save Note</Button>
        </Section>

        <div className="border-b border-[#303437] py-7">
          <Select className="mb-3 w-full" value={targetSetId} onChange={(event) => setTargetSetId(event.target.value)}>
            {sets.map((set) => <option value={set.id} key={set.id}>{set.name}</option>)}
          </Select>
          <Button className="h-[60px] w-full text-base" disabled={sets.length === 0} onClick={addToSet}>Add to Set</Button>
        </div>

        <Section title="Analysis Override">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="BPM" type="number" value={manualBpm} onChange={(event) => setManualBpm(event.target.value)} />
            <Input placeholder="Key" value={manualKey} onChange={(event) => setManualKey(event.target.value)} />
            <Input placeholder="Camelot" value={manualCamelot} onChange={(event) => setManualCamelot(event.target.value)} />
            <Input placeholder="Energy 0-1" type="number" min="0" max="1" step="0.01" value={manualEnergy} onChange={(event) => setManualEnergy(event.target.value)} />
          </div>
          <Button className="mt-3 w-full" tone="primary" onClick={saveAnalysis}>Save Analysis</Button>
        </Section>

        <Section title="Rating">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => <button className={`h-10 flex-1 rounded-md border text-sm transition ${selectedTrack.rating === rating ? "border-[#78c7e8] bg-[#1c333d] text-[#d9eef7]" : "border-[#34383b] text-[#9da2a6] hover:bg-[#171b1d]"}`} key={rating} onClick={() => saveRating(rating)}>★</button>)}
            <Button tone="ghost" onClick={() => saveRating(null)}>Clear</Button>
          </div>
        </Section>

        <Section title="Tagging">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <Select value={tagField} onChange={(event) => { const nextField = event.target.value; setTagField(nextField); setTagValue(tagOptions[nextField][0]); }}>{tagFields.map((field) => <option key={field}>{field}</option>)}</Select>
            <Select value={tagValue} onChange={(event) => setTagValue(event.target.value)}>{tagOptions[tagField].map((value) => <option key={value}>{value}</option>)}</Select>
            <Button onClick={addTag}>Add</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedTrack.tags.map((tag) => <button className="rounded border border-[#34383b] px-2 py-1 text-xs text-[#9da2a6] hover:text-[#f0f2f2]" key={`${tag.field}-${tag.value}`} onClick={() => removeTag(tag)}>{tag.field}: {tag.value} x</button>)}
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <Input placeholder="free tag" value={freeTag} onChange={(event) => setFreeTag(event.target.value)} />
            <Button onClick={addFreeTag}>Add</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedTrack.freeTags.map((tag) => <button className="rounded border border-[#34383b] px-2 py-1 text-xs text-[#9da2a6] hover:text-[#f0f2f2]" key={tag} onClick={() => removeFreeTag(tag)}>{tag} x</button>)}
          </div>
        </Section>

        <Section title="Top Matches">
          <div className="space-y-4">
            {visibleMatches.map((match) => <MatchCard key={match.trackBId} match={match} />)}
            {matches.length === 0 && <div className="text-sm text-[#858b90]">Select a track to calculate local matches.</div>}
            {matches.length > 3 && <button className="w-full text-center text-sm text-[#9da2a6] transition hover:text-[#d9eef7]" onClick={() => setShowAllMatches((current) => !current)}>{showAllMatches ? "Show less" : "Show more"}</button>}
          </div>
        </Section>
      </div>
    </aside>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return <div className="mb-8"><div className="mb-3 text-base text-[#8b9095]">{label}</div><div className="break-words text-lg leading-tight text-[#d9dddf]">{value}</div></div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-b border-[#303437] py-7"><h3 className="mb-4 text-base font-medium text-[#8b9095]">{title}</h3>{children}</section>;
}

function MatchCard({ match }: { match: MatchRecommendation }) {
  return (
    <div className="grid grid-cols-[1fr_44px] items-center gap-3 rounded-md border border-[#303437] bg-[#111516] p-3">
      <div className="min-w-0 text-sm"><div className="truncate text-[#e4e6e7]">{match.track.title ?? match.track.fileName}</div><div className="truncate text-[#858b90]">{match.track.artist ?? "Unknown"}</div><div className="mt-1 text-xs text-[#858b90]">BPM {formatNumber(match.track.bpm, 0)} · Key {match.track.camelot ?? match.track.musicalKey ?? "--"}</div></div>
      <div className="text-right text-2xl font-medium text-[#78c7e8]">{Math.round(match.score)}</div>
    </div>
  );
}
