import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Package,
  ArrowLeftRight,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  BarChart3,
  ShieldCheck,
  Zap,
  Users,
  Check,
  Sparkles,
} from "lucide-react";
import { StatusPill } from "@/components/assetflow/StatusPill";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AssetFlow — Enterprise Asset & Resource Management" },
      {
        name: "description",
        content:
          "The modern operating system for physical assets. Track, allocate, book, maintain and audit — built for offices, hospitals, factories and schools.",
      },
      { property: "og:title", content: "AssetFlow — Asset Operations, Reimagined" },
      {
        property: "og:description",
        content:
          "One source of truth for every laptop, projector, vehicle and instrument in your organization.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />
      <Hero />
      <TrustBar />
      <Features />
      <PaletteShowcase />
      <ProductPeek />
      <CTASection />
      <Footer />
    </div>
  );
}

function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M4 7l8-4 8 4-8 4-8-4z" />
              <path d="M4 12l8 4 8-4" />
              <path d="M4 17l8 4 8-4" />
            </svg>
          </div>
          <span className="font-display text-[17px] font-bold tracking-tight">AssetFlow</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#palette" className="hover:text-foreground">Design</a>
          <a href="#product" className="hover:text-foreground">Product</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <button className="hidden h-9 rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex sm:items-center">
            Sign in
          </button>
          <Link
            to="/app"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-foreground px-3.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Launch app <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-mesh)" }}
      />
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[1px]"
        style={{ background: "linear-gradient(to right, transparent, oklch(0.44 0.19 274 / 0.3), transparent)" }}
      />

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" />
            Now in beta · Built for PEC Hacks 4.0
          </div>

          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl">
            Every asset,
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-hero)" }}
            >
              accounted for.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            AssetFlow is the modern operating system for physical assets — track laptops, projectors,
            vehicles and instruments across departments with the clarity of Linear and the
            rigor of an ERP.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/app"
              className="group inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition-transform hover:-translate-y-0.5"
            >
              Open the dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-muted">
              Book a demo
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-status-available" /> Free for teams up to 25</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-status-available" /> SOC-2 ready</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-status-available" /> No card required</span>
          </div>
        </div>

        {/* Floating status pill cluster */}
        <div className="mx-auto mt-16 flex max-w-2xl flex-wrap items-center justify-center gap-2">
          <StatusPill status="available" />
          <StatusPill status="allocated" />
          <StatusPill status="reserved" />
          <StatusPill status="maintenance" />
          <StatusPill status="lost" />
          <StatusPill status="retired" />
          <StatusPill status="disposed" />
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const orgs = ["Manipal Hospitals", "IIT Bombay", "Northwind Logistics", "Titan Industries", "DPS Group", "Larsen & Toubro"];
  return (
    <section className="border-y border-border/60 bg-muted/40">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Trusted by operations teams at
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {orgs.map((o) => (
            <div
              key={o}
              className="font-display text-sm font-semibold tracking-tight text-muted-foreground/80"
            >
              {o}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Package, title: "Asset registry", body: "QR-tagged inventory with rich metadata, custody chain, warranty and depreciation." },
    { icon: ArrowLeftRight, title: "Allocations", body: "One-click check-out and returns. Approvals routed to the right department head." },
    { icon: CalendarClock, title: "Bookings", body: "Reserve shared assets — meeting rooms, vehicles, lab equipment — by the hour." },
    { icon: Wrench, title: "Maintenance", body: "Scheduled and breakdown work orders with SLA timers and vendor tracking." },
    { icon: ClipboardCheck, title: "Audits", body: "Cycle counts and physical audits with barcode scanning and variance reports." },
    { icon: BarChart3, title: "Reports", body: "Utilization, downtime and cost of ownership — sliced by team, site, or category." },
    { icon: Users, title: "Role-aware", body: "Admin, Asset Manager, Department Head and Employee views — each sees only what they need." },
    { icon: ShieldCheck, title: "Auditable", body: "Immutable event log for every scan, transfer and status change." },
  ];

  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
          <Zap className="h-3 w-3" /> Everything an operations team needs
        </div>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Built for the reality of asset ops.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Spreadsheets and legacy ERPs weren't made for shared resources.
          AssetFlow is — from the ground up.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border/70 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="group relative bg-card p-6 transition-colors hover:bg-muted/40"
            >
              <div className="mb-4 grid h-9 w-9 place-items-center rounded-lg bg-primary-muted text-primary transition-transform group-hover:-translate-y-0.5">
                <Icon className="h-4 w-4" />
              </div>
              <div className="font-display text-[15px] font-semibold text-foreground">
                {f.title}
              </div>
              <div className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PaletteShowcase() {
  const swatches = [
    { name: "Primary", hint: "Interactive, brand", cls: "bg-primary", fg: "text-primary-foreground" },
    { name: "Foreground", hint: "Body text, headings", cls: "bg-foreground", fg: "text-background" },
    { name: "Muted", hint: "Surfaces, hovers", cls: "bg-muted border border-border", fg: "text-muted-foreground" },
    { name: "Card", hint: "Panels, elevated", cls: "bg-card border border-border", fg: "text-foreground" },
  ];

  const statuses: Array<{ label: string; key: string; status: React.ComponentProps<typeof StatusPill>["status"] }> = [
    { label: "Available", key: "available", status: "available" },
    { label: "Allocated", key: "allocated", status: "allocated" },
    { label: "Reserved", key: "reserved", status: "reserved" },
    { label: "Under Maintenance", key: "maintenance", status: "maintenance" },
    { label: "Lost", key: "lost", status: "lost" },
    { label: "Retired", key: "retired", status: "retired" },
    { label: "Disposed", key: "disposed", status: "disposed" },
  ];

  return (
    <section id="palette" className="border-y border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            Design language
          </div>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
            A palette that speaks status.
          </h2>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Every color is a semantic token. Status becomes glanceable — a wall of
            300 rows tells you what needs attention without a single label.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {swatches.map((s) => (
              <div
                key={s.name}
                className={`flex h-24 flex-col justify-between rounded-xl p-3 ${s.cls} ${s.fg}`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
                  {s.hint}
                </div>
                <div className="font-display text-sm font-bold">{s.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-6 shadow-[var(--shadow-elegant)]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Status system
          </div>
          <div className="mt-1 font-display text-lg font-semibold">
            Seven states, one shared language.
          </div>
          <ul className="mt-5 divide-y divide-border">
            {statuses.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{s.label}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    status.{s.key}
                  </div>
                </div>
                <StatusPill status={s.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ProductPeek() {
  return (
    <section id="product" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
          Preview
        </div>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
          The workspace your ops team deserves.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Data-dense without being cluttered. Fast on 4G. Keyboard-first.
        </p>
      </div>

      <div className="relative mx-auto mt-14 max-w-5xl">
        <div
          className="absolute inset-0 -z-10 translate-y-6 rounded-3xl opacity-40 blur-3xl"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-glow)]">
          {/* Faux window chrome */}
          <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-status-lost/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-status-reserved/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-status-available/60" />
            </div>
            <div className="mx-auto flex h-6 w-full max-w-md items-center justify-center rounded-md border border-border bg-background text-[11px] text-muted-foreground">
              assetflow.app/dashboard
            </div>
          </div>
          {/* Faux dashboard */}
          <div className="grid grid-cols-[180px_1fr]">
            <div className="border-r border-border bg-sidebar p-3">
              {["Dashboard", "Assets", "Allocations", "Bookings", "Maintenance", "Audits", "Reports"].map((l, i) => (
                <div
                  key={l}
                  className={`mb-1 rounded-md px-2 py-1.5 text-[11px] font-medium ${
                    i === 0 ? "bg-sidebar-active text-primary" : "text-sidebar-foreground"
                  }`}
                >
                  {l}
                </div>
              ))}
            </div>
            <div className="p-5">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { l: "Total", v: "1,284" },
                  { l: "Allocated", v: "847" },
                  { l: "Maintenance", v: "23" },
                  { l: "Overdue", v: "6" },
                ].map((k) => (
                  <div key={k.l} className="rounded-lg border border-border bg-background p-3">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {k.l}
                    </div>
                    <div className="mt-1 font-display text-xl font-bold tabular">{k.v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1.5">
                {[
                  { t: "AF-LTP-00842", n: "MacBook Pro 14\"", s: "allocated" as const },
                  { t: "AF-PRJ-00113", n: "Epson EB-2250U", s: "available" as const },
                  { t: "AF-VEH-00027", n: "Toyota Hilux", s: "maintenance" as const },
                  { t: "AF-CAM-00014", n: "Sony A7 III Kit", s: "lost" as const },
                ].map((r) => (
                  <div
                    key={r.t}
                    className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-[12px]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-muted-foreground">{r.t}</span>
                      <span className="font-medium">{r.n}</span>
                    </div>
                    <StatusPill status={r.s} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 pb-24">
      <div
        className="relative overflow-hidden rounded-3xl px-8 py-16 text-center md:px-16"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
          backgroundSize: "48px 48px, 32px 32px",
        }} />
        <h2 className="relative font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
          Bring order to your inventory.
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-lg text-white/80">
          Set up your organization in under 10 minutes. Import from any spreadsheet.
        </p>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/app"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-foreground shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Launch AssetFlow <ArrowRight className="h-4 w-4" />
          </Link>
          <button className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20">
            Contact sales
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="grid h-6 w-6 place-items-center rounded-md bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M4 7l8-4 8 4-8 4-8-4z" />
              <path d="M4 12l8 4 8-4" />
            </svg>
          </div>
          <span className="font-display font-semibold text-foreground">AssetFlow</span>
          <span className="text-xs">© 2026 · PEC Hacks 4.0</span>
        </div>
        <div className="flex items-center gap-5 text-xs">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Security</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}
