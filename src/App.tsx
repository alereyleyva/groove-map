import { Activity, Library, ListMusic, ShieldCheck, WandSparkles } from "lucide-react";
import "./App.css";
import { AnalysisQueueView } from "./features/analysis-queue/AnalysisQueueView";
import { LibraryView } from "./features/library/LibraryView";
import { SetBuilderView } from "./features/set-builder/SetBuilderView";
import { SetsView } from "./features/sets/SetsView";
import { SettingsView } from "./features/settings/SettingsView";
import { TrackDetailPanel } from "./features/track-detail/TrackDetailPanel";
import { useAppStore } from "./state/app-state";

function App() {
  const { view, setView, queue, statusMessage } = useAppStore();

  return (
    <main className="flex h-screen overflow-hidden bg-[#05070a] text-zinc-200">
      <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-900 bg-black/60">
        <div className="border-b border-zinc-900 p-4">
          <div className="text-[10px] uppercase tracking-[0.35em] text-cyan-400">GrooveMap</div>
          <h1 className="mt-2 text-lg font-semibold text-zinc-100">Techno Library Architect</h1>
          <p className="mt-1 text-xs text-zinc-500">Offline-first DJ preparation</p>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          <NavItem active={view === "library"} icon={<Library />} label="Library" onClick={() => setView("library")} />
          <NavItem active={view === "sets"} icon={<ListMusic />} label="Sets" onClick={() => setView("sets")} />
          <NavItem active={view === "builder"} icon={<WandSparkles />} label="Set Builder" onClick={() => setView("builder")} />
          <NavItem active={view === "queue"} icon={<Activity />} label="Analysis Queue" onClick={() => setView("queue")} />
          <NavItem active={view === "settings"} icon={<ShieldCheck />} label="Privacy" onClick={() => setView("settings")} />
        </nav>
        <div className="border-t border-zinc-900 p-3 text-xs text-zinc-500">
          <div>Imported: {queue?.imported ?? 0}</div>
          <div>Pending: {queue?.pending ?? 0}</div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-zinc-900 bg-zinc-950 px-4">
          <div className="text-sm text-zinc-400">Local SQLite · no uploads · no audio mutation</div>
          <div className="text-xs text-zinc-500">{statusMessage}</div>
        </header>
        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1">{renderView(view)}</div>
          {view === "library" && <TrackDetailPanel />}
        </div>
        <footer className="flex h-8 items-center justify-between border-t border-zinc-900 bg-black px-4 text-[11px] text-zinc-500">
          <span>Analysis: {queue?.done ?? 0} done / {queue?.pending ?? 0} pending / {queue?.failed ?? 0} failed</span>
          <span>groove-map.sqlite</span>
        </footer>
      </section>
    </main>
  );
}

function renderView(view: ReturnType<typeof useAppStore.getState>["view"]) {
  if (view === "sets") return <SetsView />;
  if (view === "builder") return <SetBuilderView />;
  if (view === "queue") return <AnalysisQueueView />;
  if (view === "settings") return <SettingsView />;
  return <LibraryView />;
}

function NavItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactElement; label: string; onClick: () => void }) {
  return (
    <button className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm transition ${active ? "bg-cyan-400/10 text-cyan-200" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"}`} onClick={onClick}>
      <span className="[&>svg]:size-4">{icon}</span>{label}
    </button>
  );
}

export default App;
