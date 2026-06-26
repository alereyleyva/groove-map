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
    <main className="h-screen overflow-hidden bg-black p-3 text-[#d4d7d8] sm:p-5">
      <div className="flex h-full flex-col overflow-hidden rounded-[10px] border border-[#303437] bg-[#0f1213] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-[276px] shrink-0 flex-col border-r border-[#303437] bg-[linear-gradient(180deg,#15191b_0%,#0c1011_100%)] md:flex">
            <div className="flex h-[132px] items-center px-8">
              <h1 className="text-xl font-semibold tracking-[-0.03em] text-[#f0f2f2]">GrooveMap</h1>
            </div>
            <nav className="flex-1 space-y-4 px-3">
              <NavItem active={view === "library"} icon={<Library />} label="Library" onClick={() => setView("library")} />
              <NavItem active={view === "sets"} icon={<ListMusic />} label="Sets" onClick={() => setView("sets")} />
              <NavItem active={view === "builder"} icon={<WandSparkles />} label="Set Builder" onClick={() => setView("builder")} />
              <NavItem active={view === "settings"} icon={<Settings />} label="Settings" onClick={() => setView("settings")} />
            </nav>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col bg-[#101314]">
            <div className="flex min-h-0 flex-1">
              <div className="min-w-0 flex-1">{renderView(view)}</div>
              {view === "library" && <TrackDetailPanel />}
            </div>
          </section>
        </div>

        <footer className="flex h-[72px] shrink-0 items-center justify-between gap-4 border-t border-[#303437] bg-[linear-gradient(180deg,#111516_0%,#0d1011_100%)] px-8 text-sm text-[#9da2a6]">
          <div className="flex min-w-0 items-center gap-5">
            <button className="shrink-0 transition hover:text-[#d9eef7]" onClick={() => setView("library")}>{imported.toLocaleString()} tracks</button>
            <span className="text-[#5c6368]">•</span>
            <button className="shrink-0 transition hover:text-[#d9eef7]" onClick={() => setView("queue")}>{queue?.pending ?? 0} pending</button>
            <span className="text-[#5c6368]">•</span>
            <button className="flex shrink-0 items-center gap-2 transition hover:text-[#d9eef7]" onClick={() => setView("queue")}><Activity className="size-4 text-[#78c7e8]" />Analyzing {queue?.analyzing ?? 0} files</button>
            <div className="ml-2 hidden h-5 w-px bg-[#3a3f42] sm:block" />
            <div className="hidden h-1.5 w-72 rounded-full bg-[#24292c] sm:block"><div className="h-full rounded-full bg-[#78c7e8]" style={{ width: `${analysisProgress}%` }} /></div>
          </div>
          <span className="min-w-0 truncate text-right text-xs text-[#858b90]">{statusMessage}</span>
        </footer>
      </div>
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
    <button className={`relative flex h-[72px] w-full items-center gap-5 rounded-md px-7 text-left text-lg transition ${active ? "bg-[#252a2d] text-[#f0f2f2] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] before:absolute before:left-0 before:top-1 before:h-[64px] before:w-1 before:rounded-full before:bg-[#78c7e8]" : "text-[#bec3c6] hover:bg-[#181d1f] hover:text-[#f0f2f2]"}`} onClick={onClick}>
      <span className="[&>svg]:size-6">{icon}</span>{label}
    </button>
  );
}

export default App;
