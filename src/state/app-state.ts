import { create } from "zustand";
import type { MatchRecommendation, QueueStatus, SetRecord, Track } from "../types/domain";

type View = "library" | "sets" | "builder" | "queue" | "settings";

type AppStore = {
  view: View;
  selectedTrack: Track | null;
  matches: MatchRecommendation[];
  sets: SetRecord[];
  queue: QueueStatus | null;
  statusMessage: string;
  setView: (view: View) => void;
  setSelectedTrack: (track: Track | null) => void;
  setMatches: (matches: MatchRecommendation[]) => void;
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
