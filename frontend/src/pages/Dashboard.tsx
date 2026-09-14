import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api, DashboardSummary, WasteEvent } from "../lib/api";
import KpiCard from "../components/KpiCard";

const CATEGORY_COLOR: Record<string, string> = {
  plastic: "text-sky-400",
  paper: "text-amber-300",
  metal: "text-slate-300",
  glass: "text-emerald-400",
  organic: "text-lime-400",
  general: "text-slate-500",
};

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [events, setEvents] = useState<WasteEvent[]>([]);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<WasteEvent | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [s, e] = await Promise.all([api.summary(), api.events()]);
      setSummary(s);
      setEvents(e);
    } catch {
      /* offline */
    }
  }, []);

  useEffect(() => {
    api.health().then(() => setApiOnline(true)).catch(() => setApiOnline(false));
    refresh();
  }, [refresh]);

  const runDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      setLastResult(await api.runDemo());
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Classification failed");
    } finally {
      setLoading(false);
    }
  };

  const runUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      setLastResult(await api.classifyImage(file));
      setFile(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Classification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-lime-500" />
          SmartWaste AI
        </Link>
        <span className="flex items-center gap-2 text-xs">
          <span className={`inline-block h-2 w-2 rounded-full ${apiOnline ? "bg-emerald-500" : "bg-red-500"}`} />
          {apiOnline === null ? "Checking..." : apiOnline ? "Backend online" : "Backend offline"}
        </span>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {!apiOnline && apiOnline !== null && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm">
            Can't reach the backend at <code>/api</code>. Start it with <code>uvicorn app.main:app --reload</code>.
          </div>
        )}

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="font-semibold mb-4">Classify an item</h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-slate-200"
            />
            <button
              disabled={!file || loading}
              onClick={runUpload}
              className="rounded-lg bg-lime-600 hover:bg-lime-500 disabled:opacity-40 transition px-4 py-2 text-sm font-medium"
            >
              {loading ? "Classifying..." : "Classify photo"}
            </button>
            <span className="text-slate-500 text-sm">or</span>
            <button
              disabled={loading}
              onClick={runDemo}
              className="rounded-lg border border-slate-700 hover:border-slate-500 disabled:opacity-40 transition px-4 py-2 text-sm font-medium"
            >
              {loading ? "Running..." : "Run demo sample"}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          {lastResult && (
            <p className="mt-4 text-sm">
              Classified as{" "}
              <strong className={CATEGORY_COLOR[lastResult.category]}>{lastResult.category}</strong> (confidence{" "}
              {lastResult.confidence}) — {lastResult.recommendation}
            </p>
          )}
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total classified" value={summary?.total_classified ?? "-"} />
          <KpiCard label="Avg. confidence" value={summary ? summary.avg_confidence : "-"} />
          <KpiCard label="Most common" value={
            summary ? Object.entries(summary.category_counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-" : "-"
          } />
          <KpiCard label="Categories tracked" value={summary ? Object.keys(summary.category_counts).length : "-"} />
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="font-semibold mb-4">Category breakdown</h2>
          {!summary || summary.total_classified === 0 ? (
            <p className="text-sm text-slate-500">No classifications yet.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {Object.entries(summary.category_counts).map(([cat, count]) => (
                <div key={cat} className="rounded-lg border border-slate-800 p-3 text-center">
                  <p className={`text-lg font-bold ${CATEGORY_COLOR[cat]}`}>{count}</p>
                  <p className="text-xs text-slate-500 capitalize">{cat}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Classification history</h2>
            <a href={api.exportCsvUrl()} className="text-sm rounded-lg border border-slate-700 hover:border-slate-500 transition px-3 py-1.5">
              Export CSV
            </a>
          </div>
          {events.length === 0 ? (
            <p className="text-sm text-slate-500">No events yet — run the demo or classify a photo above.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-800">
                  <th className="py-2 pr-4">File</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Confidence</th>
                  <th className="py-2 pr-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-b border-slate-800/60">
                    <td className="py-2 pr-4">{e.source_filename}</td>
                    <td className={`py-2 pr-4 capitalize ${CATEGORY_COLOR[e.category]}`}>{e.category}</td>
                    <td className="py-2 pr-4">{e.confidence}</td>
                    <td className="py-2 pr-4 text-slate-500">{new Date(e.created_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
