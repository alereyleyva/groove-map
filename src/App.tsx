import { Activity, Library, ListMusic, Settings, WandSparkles } from "lucide-react";
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
  const analyzed = queue?.done ?? 0;
  const imported = queue?.imported ?? 0;
  const analysisProgress = imported > 0 ? Math.round((analyzed / imported) * 100) : 0;

  return (
    <main className="flex h-screen overflow-hidden border border-zinc-800 bg-[#090b0d] text-zinc-200 shadow-2xl shadow-black">
      <aside className="flex w-[244px] shrink-0 flex-col border-r border-zinc-800 bg-[linear-gradient(180deg,#111416_0%,#0a0d0f_100%)]">
        <div className="flex h-28 items-center px-7">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">GrooveMap</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem active={view === "library"} icon={<Library />} label="Library" onClick={() => setView("library")} />
          <NavItem active={view === "sets"} icon={<ListMusic />} label="Sets" onClick={() => setView("sets")} />
          <NavItem active={view === "builder"} icon={<WandSparkles />} label="Set Builder" onClick={() => setView("builder")} />
          <NavItem active={view === "queue"} icon={<Activity />} label="Analysis Queue" onClick={() => setView("queue")} />
          <NavItem active={view === "settings"} icon={<Settings />} label="Settings" onClick={() => setView("settings")} />
        </nav>
        <div className="mx-8 mb-12 border-t border-zinc-800 pt-5 text-xs uppercase tracking-wide text-zinc-500">
          <Metric label="Tracks" value={queue?.imported ?? 0} />
          <Metric label="Analyzed" value={queue?.done ?? 0} />
          <Metric label="Pending" value={queue?.pending ?? 0} />
          <Metric label="Missing" value={queue?.failed ?? 0} />
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-[#0b0d0f]">
        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1">{renderView(view)}</div>
          {view === "library" && <TrackDetailPanel />}
        </div>
        <footer className="flex h-[72px] items-center justify-between border-t border-zinc-800 bg-[#0d0f11] px-7 text-sm text-zinc-400">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-3 font-medium text-zinc-100"><Activity className="size-4 text-cyan-300" />Analysis Queue</span>
            <span>{queue?.pending ?? 0} pending</span>
            <div className="h-1.5 w-96 rounded-full bg-zinc-800"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${analysisProgress}%` }} /></div>
            <span className="text-zinc-200">{analysisProgress}%</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs text-zinc-500">{statusMessage}</span>
            <button className="text-zinc-300 transition hover:text-cyan-200" onClick={() => setView("queue")}>View Queue</button>
          </div>
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
    <button className={`relative flex w-full items-center gap-4 px-8 py-4 text-left text-base transition ${active ? "bg-cyan-400/5 text-zinc-100 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-cyan-400" : "text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-100"}`} onClick={onClick}>
      <span className="[&>svg]:size-6">{icon}</span>{label}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="mb-4 flex justify-between"><span>{label}</span><span className="text-zinc-400">{value}</span></div>;
}

export default App;
