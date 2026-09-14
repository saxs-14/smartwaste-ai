import { Link } from "react-router-dom";

const FEATURES = [
  { title: "Waste classification", desc: "Sorts uploaded photos into plastic, paper, metal, glass, organic or general." },
  { title: "Confidence score", desc: "Every classification includes a transparency score, not a false-certain label." },
  { title: "Recycling recommendation", desc: "Plain-language guidance on which stream to use." },
  { title: "Analytics dashboard", desc: "Daily/weekly category breakdown." },
  { title: "CSV export", desc: "Export classification history for reporting." },
  { title: "Demo mode", desc: "Run on bundled sample waste photos." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-lime-500" />
          SmartWaste AI
        </div>
        <Link to="/app" className="rounded-lg bg-lime-600 hover:bg-lime-500 transition px-4 py-2 text-sm font-medium">
          Open dashboard
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <section className="py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Sort waste <span className="text-lime-400">smarter</span>, not harder
          </h1>
          <p className="mt-5 text-slate-400 max-w-2xl mx-auto text-lg">
            Upload a photo and get an instant recycling-stream recommendation, with every
            classification tracked for facility analytics.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/app" className="rounded-lg bg-lime-600 hover:bg-lime-500 transition px-5 py-3 font-medium">
              Try the live demo
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Classification uses a colour/texture heuristic, not a trained image classifier —
            see the README "Limitations" before relying on this for sorting accuracy.
          </p>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="py-16 grid sm:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-3">Who it's for</h2>
            <ul className="text-slate-400 space-y-1.5 text-sm">
              <li>Recycling companies</li>
              <li>Schools</li>
              <li>Municipalities</li>
              <li>Shopping centres</li>
              <li>Waste-management companies</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Pricing model</h2>
            <ul className="text-slate-400 space-y-1.5 text-sm">
              <li>SaaS subscription</li>
              <li>Smart-bin hardware integration</li>
              <li>Analytics-only subscription</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        SmartWaste AI — recycling analytics MVP. Heuristic baseline, not a certified sorting system.
      </footer>
    </div>
  );
}
