import { create } from "zustand";
import type { MatchScore, QueueStatus, SetRecord, Track } from "../types/domain";

type View = "library" | "sets" | "builder" | "queue" | "tags" | "settings";

type AppStore = {
  view: View;
  selectedTrack: Track | null;
  matches: MatchScore[];
  sets: SetRecord[];
  queue: QueueStatus | null;
  statusMessage: string;
  setView: (view: View) => void;
  setSelectedTrack: (track: Track | null) => void;
  setMatches: (matches: MatchScore[]) => void;
  setSets: (sets: SetRecord[]) => void;
  setQueue: (queue: QueueStatus | null) => void;
  setStatusMessage: (message: string) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  view: "library",
  selectedTrack: null,
  matches: [],
  sets: [],
  queue: null,
  statusMessage: "Ready. Local-only mode.",
  setView: (view) => set({ view }),
  setSelectedTrack: (selectedTrack) => set({ selectedTrack }),
  setMatches: (matches) => set({ matches }),
  setSets: (sets) => set({ sets }),
  setQueue: (queue) => set({ queue }),
  setStatusMessage: (statusMessage) => set({ statusMessage }),
}));
