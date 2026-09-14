const API_BASE = "";

export interface WasteEvent {
  id: number;
  source_filename: string;
  category: string;
  confidence: number;
  recommendation: string;
  created_at: string;
}

export interface DashboardSummary {
  total_classified: number;
  category_counts: Record<string, number>;
  avg_confidence: number;
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

export const api = {
  health: () => fetch(`${API_BASE}/api/health`).then((r) => json<{ status: string }>(r)),
  summary: () => fetch(`${API_BASE}/api/dashboard/summary`).then((r) => json<DashboardSummary>(r)),
  events: () => fetch(`${API_BASE}/api/events`).then((r) => json<WasteEvent[]>(r)),
  exportCsvUrl: () => `${API_BASE}/api/events/export`,
  runDemo: () => fetch(`${API_BASE}/api/classify/demo`, { method: "POST" }).then((r) => json<WasteEvent>(r)),
  classifyImage: (file: File) => {
    const form = new FormData();
    form.set("file", file);
    return fetch(`${API_BASE}/api/classify`, { method: "POST", body: form }).then((r) => json<WasteEvent>(r));
  },
};
