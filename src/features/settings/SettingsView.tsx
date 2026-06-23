import { useEffect, useState } from "react";
import { Button, Stat } from "../../components/ui";
import { api } from "../../lib/tauri";
import { useAppStore } from "../../state/app-state";

export function SettingsView() {
  const [settingsCount, setSettingsCount] = useState(0);
  const { queue, setQueue, setStatusMessage } = useAppStore();

  async function refreshLocalState() {
    const [settings, queueStatus] = await Promise.all([api.getSettings(), api.getAnalysisQueueStatus()]);
    setSettingsCount(Object.keys(settings).length);
    setQueue(queueStatus);
    setStatusMessage("Local privacy state refreshed.");
  }

  useEffect(() => {
    refreshLocalState().catch((error) => setStatusMessage(String(error)));
  }, []);

  return (
    <div className="max-w-3xl space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Privacy</h1>
          <p className="mt-1 text-sm text-zinc-500">Everything GrooveMap knows about your library stays on this computer.</p>
        </div>
        <Button onClick={refreshLocalState}>Refresh local state</Button>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <Stat label="Local settings" value={settingsCount} />
        <Stat label="Imported tracks" value={queue?.imported ?? 0} />
        <Stat label="Pending analysis" value={queue?.pending ?? 0} />
      </section>

      <section className="rounded border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-cyan-300">Privacy guarantees</h2>
        <ul className="space-y-2">
          <li>No audio upload paths are implemented.</li>
          <li>No metadata, tags, analysis, set data, or settings are uploaded.</li>
          <li>Original audio files are read for scanning and analysis, never modified.</li>
          <li>The local database is named <code className="text-cyan-200">groove-map.sqlite</code>.</li>
          <li>Removing a source must never delete files from disk.</li>
        </ul>
      </section>
    </div>
  );
}
