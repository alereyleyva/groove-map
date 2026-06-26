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
    <div className="h-full overflow-auto p-5 lg:p-8">
      <div className="max-w-4xl space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#f0f2f2]">Privacy</h1>
            <p className="mt-1 text-sm text-[#858b90]">Everything GrooveMap knows about your library stays on this computer.</p>
          </div>
          <Button onClick={refreshLocalState}>Refresh Local State</Button>
        </div>

        <section className="grid gap-3 md:grid-cols-3">
          <Stat label="Local settings" value={settingsCount} />
          <Stat label="Imported tracks" value={queue?.imported ?? 0} />
          <Stat label="Pending analysis" value={queue?.pending ?? 0} />
        </section>

        <section className="rounded-md border border-[#303437] bg-[#111516] p-5 text-sm leading-6 text-[#cfd3d6]">
          <h2 className="mb-4 text-base font-medium text-[#f0f2f2]">Privacy Guarantees</h2>
          <ul className="space-y-2">
            <li>No audio upload paths are implemented.</li>
            <li>No metadata, tags, analysis, set data, or settings are uploaded.</li>
            <li>Original audio files are read for scanning and analysis, never modified.</li>
            <li>The local database is named <code className="text-[#d9eef7]">groove-map.sqlite</code>.</li>
            <li>Removing a source must never delete files from disk.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
