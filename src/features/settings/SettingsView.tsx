import { useEffect, useState } from "react";
import { Button, Input, Select } from "../../components/ui";
import { api } from "../../lib/tauri";
import { useAppStore } from "../../state/app-state";

export function SettingsView() {
  const [settings, setSettings] = useState({ theme: "dark", defaultBpmMin: 128, defaultBpmMax: 134, analysisConcurrency: 2 });
  const { setStatusMessage } = useAppStore();

  useEffect(() => {
    api.getSettings().then((value) => setSettings((current) => ({ ...current, ...value } as typeof current))).catch((error) => setStatusMessage(String(error)));
  }, []);

  async function save() {
    await api.updateSettings(settings);
    setStatusMessage("Settings saved locally.");
  }

  return (
    <div className="max-w-2xl space-y-4 p-4">
      <h1 className="text-xl font-semibold text-zinc-100">Settings</h1>
      <section className="space-y-3 rounded border border-zinc-800 bg-zinc-950 p-4">
        <label className="block text-xs uppercase tracking-wide text-zinc-500">Theme</label>
        <Select value={settings.theme} onChange={(event) => setSettings({ ...settings, theme: event.target.value })}><option value="dark">dark</option><option value="light">light</option><option value="system">system</option></Select>
        <div className="grid grid-cols-2 gap-2"><Input type="number" value={settings.defaultBpmMin} onChange={(event) => setSettings({ ...settings, defaultBpmMin: Number(event.target.value) })} /><Input type="number" value={settings.defaultBpmMax} onChange={(event) => setSettings({ ...settings, defaultBpmMax: Number(event.target.value) })} /></div>
        <Input type="number" value={settings.analysisConcurrency} onChange={(event) => setSettings({ ...settings, analysisConcurrency: Number(event.target.value) })} />
        <Button onClick={save}>Save settings</Button>
      </section>
      <section className="rounded border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
        GrooveMap stores all data locally in `groove-map.sqlite`. No audio, metadata, analysis, or settings are uploaded.
      </section>
    </div>
  );
}
