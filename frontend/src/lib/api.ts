const API_BASE = "";
const API_KEY = (import.meta.env.VITE_API_KEY as string) || "dev-local-key-change-me";

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

function authHeaders(): HeadersInit {
  return { "X-API-Key": API_KEY };
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

async function downloadFile(url: string, filename: string) {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

export const api = {
  health: () => fetch(`${API_BASE}/api/health`).then((r) => json<{ status: string }>(r)),
  summary: () =>
    fetch(`${API_BASE}/api/dashboard/summary`, { headers: authHeaders() }).then((r) => json<DashboardSummary>(r)),
  events: () => fetch(`${API_BASE}/api/events`, { headers: authHeaders() }).then((r) => json<WasteEvent[]>(r)),
  exportEvents: () => downloadFile(`${API_BASE}/api/events/export`, "smartwaste_events.csv"),
  runDemo: () =>
    fetch(`${API_BASE}/api/classify/demo`, { method: "POST", headers: authHeaders() }).then((r) =>
      json<WasteEvent>(r)
    ),
  classifyImage: (file: File) => {
    const form = new FormData();
    form.set("file", file);
    return fetch(`${API_BASE}/api/classify`, { method: "POST", headers: authHeaders(), body: form }).then((r) =>
      json<WasteEvent>(r)
    );
  },
};
