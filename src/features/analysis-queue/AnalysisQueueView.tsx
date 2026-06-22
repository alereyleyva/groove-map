import { useEffect } from "react";
import { Button, Stat } from "../../components/ui";
import { api } from "../../lib/tauri";
import { useAppStore } from "../../state/app-state";

export function AnalysisQueueView() {
  const { queue, setQueue, setStatusMessage } = useAppStore();

  async function refresh() {
    setQueue(await api.getAnalysisQueueStatus());
  }

  useEffect(() => {
    refresh().catch((error) => setStatusMessage(String(error)));
  }, []);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-semibold text-zinc-100">Analysis Queue</h1><Button onClick={refresh}>Refresh</Button></div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Imported" value={queue?.imported ?? 0} />
        <Stat label="Pending" value={queue?.pending ?? 0} />
        <Stat label="Done" value={queue?.done ?? 0} />
        <Stat label="Failed" value={queue?.failed ?? 0} />
        <Stat label="Analyzing" value={queue?.analyzing ?? 0} />
        <Stat label="Skipped" value={queue?.skipped ?? 0} />
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
        Background audio analysis is intentionally conservative in this MVP. Metadata and manual overrides are available now; deeper MIR metrics remain nullable until advanced analysis is added.
      </div>
    </div>
  );
}
