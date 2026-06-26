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
    <div className="h-full overflow-auto p-5 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#f0f2f2]">Analysis Queue</h1>
          <p className="mt-1 text-sm text-[#858b90]">Local scan and analysis state for imported files.</p>
        </div>
        <Button onClick={refresh}>Refresh</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Imported" value={queue?.imported ?? 0} />
        <Stat label="Pending" value={queue?.pending ?? 0} />
        <Stat label="Done" value={queue?.done ?? 0} />
        <Stat label="Failed" value={queue?.failed ?? 0} />
        <Stat label="Analyzing" value={queue?.analyzing ?? 0} />
        <Stat label="Skipped" value={queue?.skipped ?? 0} />
      </div>
      <div className="mt-5 rounded-md border border-[#303437] bg-[#111516] p-5 text-sm leading-6 text-[#b9bec2]">
        Background audio analysis is intentionally conservative in this MVP. Metadata and manual overrides are available now; deeper MIR metrics remain nullable until advanced analysis is added.
      </div>
    </div>
  );
}
