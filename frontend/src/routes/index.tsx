import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, Wrench, BarChart3, ShieldCheck, Zap, Users, Check,
  Sparkles, MapPin, Smartphone, Cpu, Star, ChevronDown, Menu, X,
  Building2, Stethoscope, GraduationCap, Factory, Hotel,
  ArrowLeftRight, Moon, Sun, Package, ClipboardCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Assera — Enterprise Asset & Resource Management" },
      { name: "description", content: "Assera is the modern operating system for physical assets." },
    ],
  }),
  component: Landing,
});

/* ──────────────────────────────────────────────────────────── */

function Landing() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("assera_theme") === "dark";
    return false;
  });

  const toggleDark = () => {
    setDark((prev: boolean) => {
      const next = !prev;
      if (typeof window !== "undefined") localStorage.setItem("assera_theme", next ? "dark" : "light");
      return next;
    });
  };

  const c = dark
    ? {
        bg: "#0a0a12",
        bg2: "#10101c",
        text: "#f0efff",
        muted: "rgba(240,239,255,0.55)",
        faint: "rgba(240,239,255,0.28)",
        surface: "rgba(255,255,255,0.05)",
        border: "rgba(255,255,255,0.09)",
        navBg: "rgba(10,10,18,0.92)",
        pillPurple: { bg: "rgba(168,85,247,0.18)", br: "rgba(168,85,247,0.4)", tx: "#d8b4fe" },
        pillCyan:   { bg: "rgba(34,211,238,0.15)", br: "rgba(34,211,238,0.35)", tx: "#67e8f9" },
      }
    : {
        bg: "#ffffff",
        bg2: "#f6f5ff",
        text: "#0f0d1f",
        muted: "rgba(15,13,31,0.55)",
        faint: "rgba(15,13,31,0.3)",
        surface: "rgba(0,0,0,0.035)",
        border: "rgba(0,0,0,0.09)",
        navBg: "rgba(255,255,255,0.94)",
        pillPurple: { bg: "rgba(124,58,237,0.1)", br: "rgba(124,58,237,0.3)", tx: "#6d28d9" },
        pillCyan:   { bg: "rgba(6,182,212,0.1)", br: "rgba(6,182,212,0.3)", tx: "#0891b2" },
      };

  return (
    <div style={{ background: c.bg, color: c.text, fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      <Nav c={c} dark={dark} onToggle={toggleDark} />
      <Hero c={c} dark={dark} />
      <Stats c={c} />
      <Features c={c} />
      <HowItWorks c={c} dark={dark} />
      <Services c={c} />
      <Industries c={c} dark={dark} />
      <Testimonials c={c} />
      <FAQ c={c} dark={dark} />
      <CTA c={c} />
      <Footer c={c} dark={dark} />
    </div>
  );
}

/* ──── NAVBAR ──────────────────────────────────────────────── */
function Nav({ c, dark, onToggle }: any) {
  const [open, setOpen] = useState(false);
  const links = [["#features","Features"],["#how","How It Works"],["#services","Services"],["#industries","Industries"],["#faq","FAQ"]];
  return (
    <header style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, background: c.navBg, backdropFilter:"blur(16px)", borderBottom:`1px solid ${c.border}` }}>
      <div style={{ maxWidth:1180, margin:"0 auto", padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {/* Logo */}
        <Link to="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <img src="/Fevicon.png" alt="Assera" style={{ height:34, width:34, borderRadius:8, objectFit:"contain" }} />
          <span style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontWeight:800, fontSize:19, letterSpacing:"-0.02em", color:c.text }}>Assera</span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display:"flex", gap:28, fontSize:14, fontWeight:500 }}>
          {links.map(([h,l]) => (
            <a key={h} href={h} style={{ color:c.muted, textDecoration:"none" }}
              onMouseEnter={e=>(e.currentTarget.style.color=c.text)}
              onMouseLeave={e=>(e.currentTarget.style.color=c.muted)}>{l}</a>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={onToggle} title="Toggle theme"
            style={{ width:34, height:34, borderRadius:8, border:`1px solid ${c.border}`, background:c.surface, cursor:"pointer", color:c.muted, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {dark ? <Sun size={15}/> : <Moon size={15}/>}
          </button>
          <Link to="/login"
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"#fff", fontWeight:700, fontSize:14, textDecoration:"none", boxShadow:"0 4px 18px rgba(124,58,237,0.38)" }}>
            Get Started <ArrowRight size={14}/>
          </Link>
          <button onClick={()=>setOpen(!open)} style={{ background:"none", border:"none", cursor:"pointer", color:c.text, padding:6 }}>
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>
      {open && (
        <div style={{ background:c.navBg, borderTop:`1px solid ${c.border}`, padding:"12px 24px 20px" }}>
          {links.map(([h,l]) => <a key={h} href={h} onClick={()=>setOpen(false)} style={{ display:"block", padding:"10px 0", color:c.muted, textDecoration:"none", fontSize:15 }}>{l}</a>)}
        </div>
      )}
    </header>
  );
}

/* ──── HERO ────────────────────────────────────────────────── */
function Hero({ c, dark }: any) {
  return (
    <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", paddingTop:100, paddingBottom:80, paddingLeft:24, paddingRight:24, position:"relative", overflow:"hidden" }}>
      {/* Background */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", inset:0, background: dark
          ? "radial-gradient(ellipse 80% 60% at 50% 0%,rgba(124,58,237,0.45) 0%,transparent 60%)"
          : "radial-gradient(ellipse 80% 60% at 50% 0%,rgba(124,58,237,0.14) 0%,transparent 60%)" }} />
        <div style={{ position:"absolute", inset:0,
          backgroundImage:`linear-gradient(${dark?"rgba(255,255,255,0.032)":"rgba(0,0,0,0.04)"} 1px,transparent 1px),linear-gradient(90deg,${dark?"rgba(255,255,255,0.032)":"rgba(0,0,0,0.04)"} 1px,transparent 1px)`,
          backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", top:"18%", left:"12%", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.1),transparent 70%)" }}/>
        <div style={{ position:"absolute", bottom:"15%", right:"10%", width:240, height:240, borderRadius:"50%", background:"radial-gradient(circle,rgba(6,182,212,0.08),transparent 70%)" }}/>
      </div>

      <div style={{ maxWidth:840, width:"100%", textAlign:"center", position:"relative", zIndex:1 }}>
        {/* Pill */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"6px 16px", borderRadius:100, fontSize:12, fontWeight:700, letterSpacing:"0.03em", marginBottom:28, background:c.pillPurple.bg, border:`1px solid ${c.pillPurple.br}`, color:c.pillPurple.tx }}>
          <Sparkles size={12}/> Built for Odoo Hackathon 2026 · Now in Beta
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontSize:"clamp(2.8rem,8vw,5.8rem)", fontWeight:900, lineHeight:1.02, letterSpacing:"-0.035em", marginBottom:26 }}>
          Every Asset,{" "}
          <span style={{ display:"block", backgroundImage:"linear-gradient(135deg,#a855f7 0%,#7c3aed 45%,#06b6d4 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
            Accounted For.
          </span>
        </h1>

        <p style={{ fontSize:"clamp(1rem,2.5vw,1.2rem)", lineHeight:1.75, color:c.muted, maxWidth:580, margin:"0 auto 40px" }}>
          Assera provides a powerful centralized platform to track, manage, and optimize all your organizational assets — with real-time insights, automated alerts, and analytics that help you make smarter decisions.
        </p>

        {/* CTAs */}
        <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:14, marginBottom:36 }}>
          <Link to="/login"
            style={{ display:"flex", alignItems:"center", gap:8, height:50, padding:"0 28px", borderRadius:13, background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"#fff", fontWeight:800, fontSize:15, textDecoration:"none", boxShadow:"0 8px 28px rgba(124,58,237,0.45)", transition:"transform .2s,box-shadow .2s" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 14px 36px rgba(124,58,237,0.55)"}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 8px 28px rgba(124,58,237,0.45)"}}>
            Open Dashboard <ArrowRight size={16}/>
          </Link>
          <a href="#features"
            style={{ display:"flex", alignItems:"center", gap:8, height:50, padding:"0 28px", borderRadius:13, fontWeight:700, fontSize:15, textDecoration:"none", background:c.surface, border:`1px solid ${c.border}`, color:c.text, transition:"transform .2s" }}
            onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-2px)")}
            onMouseLeave={e=>(e.currentTarget.style.transform="none")}>
            Explore Features
          </a>
        </div>

        {/* Trust */}
        <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"8px 24px", fontSize:13, color:c.faint }}>
          {["No credit card required","Free up to 25 users","RFID & Barcode support","SOC-2 ready"].map(t=>(
            <span key={t} style={{ display:"flex", alignItems:"center", gap:6 }}><Check size={13} style={{color:"#a855f7"}}/>{t}</span>
          ))}
        </div>

        {/* Scroll cue */}
        <div style={{ marginTop:56, display:"flex", justifyContent:"center" }}>
          <a href="#stats" style={{ color:c.faint, textDecoration:"none" }}>
            <ChevronDown size={24} style={{ animation:"bounceY 2.2s ease-in-out infinite" }}/>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ──── STATS ───────────────────────────────────────────────── */
function Stats({ c }: any) {
  const stats = [
    { n:"50K+", label:"Assets Tracked" },
    { n:"200+", label:"Organizations" },
    { n:"99.9%", label:"Uptime SLA" },
    { n:"40%", label:"Cost Reduction" },
  ];
  return (
    <section id="stats" style={{ padding:"60px 24px", borderTop:`1px solid ${c.border}`, borderBottom:`1px solid ${c.border}` }}>
      <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:24 }}>
        {stats.map(s=>(
          <div key={s.label} style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontWeight:900, fontSize:"2.6rem", backgroundImage:"linear-gradient(135deg,#a855f7,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              {s.n}
            </div>
            <div style={{ color:c.muted, fontSize:14, marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ──── FEATURES ────────────────────────────────────────────── */
function Features({ c }: any) {
  const items = [
    { icon:Cpu,            title:"Real-Time Asset Tracking",   body:"RFID & barcode integration with cloud-synced records. Know where every asset is — instantly, across all locations.", accent:"#a855f7" },
    { icon:ArrowLeftRight, title:"Assignment & Transfer",      body:"One-click check-out and returns. Digital logs for every transfer with role-based approvals and full audit trail.",  accent:"#06b6d4" },
    { icon:ClipboardCheck, title:"Gate Pass & Movement",       body:"Digitize asset movement with authorized gate-pass workflows. Secure, paperless, and every transfer logged instantly.", accent:"#10b981" },
    { icon:Smartphone,     title:"Mobile Access",              body:"iOS & Android apps with offline mode. Your field teams manage, update, and track assets anytime, anywhere.",         accent:"#f59e0b" },
    { icon:BarChart3,      title:"Custom Reporting",           body:"AI-powered dashboards and audit-ready reports. Utilization rates, downtime, and cost of ownership at a glance.",    accent:"#f43f5e" },
    { icon:ShieldCheck,    title:"Role-Based Access",          body:"Admin, Asset Manager, Department Head, Employee — each scoped to exactly what they need. Multi-branch support.",    accent:"#6366f1" },
  ];
  return (
    <section id="features" style={{ padding:"96px 24px" }}>
      <div style={{ maxWidth:1180, margin:"0 auto" }}>
        {/* Heading */}
        <div style={{ marginBottom:56 }}>
          <Pill c={c} purple label="Everything your ops team needs" icon={<Zap size={11}/>}/>
          <h2 style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontWeight:900, fontSize:"clamp(2rem,4vw,3rem)", letterSpacing:"-0.03em", lineHeight:1.1, marginTop:18, maxWidth:520 }}>
            Built for the reality of{" "}
            <GradSpan>asset operations.</GradSpan>
          </h2>
          <p style={{ color:c.muted, fontSize:17, lineHeight:1.75, maxWidth:500, marginTop:14 }}>
            Spreadsheets and legacy ERPs weren't built for shared resources. Assera was — from the ground up.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:18 }}>
          {items.map(f=>{
            const Icon = f.icon;
            return (
              <div key={f.title}
                style={{ padding:"28px", borderRadius:18, background:c.surface, border:`1px solid ${c.border}`, transition:"transform .25s,border-color .25s,box-shadow .25s", position:"relative", overflow:"hidden" }}
                onMouseEnter={e=>{const el=e.currentTarget;el.style.transform="translateY(-6px)";el.style.borderColor=`${f.accent}45`;el.style.boxShadow=`0 16px 48px ${f.accent}22`}}
                onMouseLeave={e=>{const el=e.currentTarget;el.style.transform="none";el.style.borderColor=c.border;el.style.boxShadow="none"}}>
                <div style={{ width:44,height:44,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:`${f.accent}18`,border:`1px solid ${f.accent}30`,marginBottom:18 }}>
                  <Icon size={20} style={{color:f.accent}}/>
                </div>
                <h3 style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontWeight:700, fontSize:16, marginBottom:9 }}>{f.title}</h3>
                <p style={{ color:c.muted, fontSize:14, lineHeight:1.75 }}>{f.body}</p>
                <div style={{ position:"absolute", right:-16, bottom:-16, width:80, height:80, borderRadius:"50%", background:`${f.accent}08` }}/>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──── HOW IT WORKS ────────────────────────────────────────── */
function HowItWorks({ c, dark }: any) {
  const steps = [
    { n:"01", title:"Register & Tag",    body:"Import your inventory or scan items with RFID/barcode. Every asset gets a digital identity with metadata — category, location, custodian, warranty." },
    { n:"02", title:"Assign & Monitor",  body:"Allocate assets to employees or departments. Monitor movement in real time with automated notifications and a full audit trail." },
    { n:"03", title:"Maintain & Move",   body:"Schedule preventive maintenance and generate digital gate passes. SLA timers, vendor tracking — all paperless." },
    { n:"04", title:"Analyse & Optimise",body:"AI dashboards surface utilization gaps and cost overruns so you act before they escalate and make data-driven decisions." },
  ];
  return (
    <section id="how" style={{ padding:"96px 24px", background:dark?"rgba(124,58,237,0.07)":c.bg2, borderTop:`1px solid ${c.border}`, borderBottom:`1px solid ${c.border}` }}>
      <div style={{ maxWidth:1180, margin:"0 auto" }}>
        <div style={{ textAlign:"center", maxWidth:560, margin:"0 auto 56px" }}>
          <Pill c={c} cyan label="How It Works"/>
          <h2 style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontWeight:900, fontSize:"clamp(2rem,4vw,3rem)", letterSpacing:"-0.03em", lineHeight:1.1, marginTop:18 }}>
            From chaos to <GradSpan reverse>clarity in 4 steps.</GradSpan>
          </h2>
          <p style={{ color:c.muted, fontSize:17, marginTop:14, lineHeight:1.75 }}>Set up your organization in under 10 minutes. Import from any spreadsheet.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:18 }}>
          {steps.map(s=>(
            <div key={s.n}
              style={{ padding:"28px 24px", borderRadius:18, background:c.surface, border:`1px solid ${c.border}`, transition:"transform .25s" }}
              onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-4px)")}
              onMouseLeave={e=>(e.currentTarget.style.transform="none")}>
              <div style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontWeight:900, fontSize:46, lineHeight:1, marginBottom:16, backgroundImage:"linear-gradient(135deg,rgba(168,85,247,0.7),rgba(6,182,212,0.5))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{s.n}</div>
              <h3 style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontWeight:700, fontSize:17, marginBottom:10 }}>{s.title}</h3>
              <p style={{ color:c.muted, fontSize:14, lineHeight:1.75 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──── SERVICES ────────────────────────────────────────────── */
function Services({ c }: any) {
  const [act, setAct] = useState(0);
  const svcs = [
    { icon:MapPin,         title:"Asset Tracking & Discovery", short:"Real-time visibility everywhere",    body:"Complete, real-time visibility of all your assets using RFID, barcode tagging, and smart scanning. AI-powered search and automated discovery keeps your inventory accurate, secure, and up-to-date. Customizable workflows match your asset hierarchy and operational structure." },
    { icon:ArrowLeftRight, title:"Gate Pass & Transfer",       short:"Digitize asset movement securely",   body:"Digitize the movement of assets between departments or locations with secure, authorized gate pass workflows. Built with automation, instant notifications, and audit trail logging to ensure complete control, transparency, and compliance with your organizational policies." },
    { icon:Wrench,         title:"Maintenance & Lifecycle",    short:"Automate schedules & service track", body:"Automate maintenance schedules and track the entire lifecycle of every asset from procurement to disposal. IoT integration, automated reminders, and predictive maintenance keep you ahead of breakdowns and maintain operational efficiency." },
    { icon:BarChart3,      title:"Reporting & Analytics",      short:"AI-driven insights & audit reports", body:"Generate audit-ready reports, view usage trends, and gain actionable insights with powerful, customizable dashboards. AI-driven analytics turn raw data into clear, actionable intelligence for smarter asset management decisions at every level." },
    { icon:Smartphone,     title:"Mobile Management",          short:"Manage assets anywhere, anytime",    body:"Manage assets on the go with mobile access for field teams — enabling updates, approvals, and tracking anytime, anywhere. Built for iOS and Android with offline mode, instant sync, and secure authentication for uninterrupted asset control." },
    { icon:Package,        title:"Asset Disposal",             short:"Retire assets with full compliance", body:"Retire or dispose of unused or obsolete assets with proper documentation, compliance tracking, and approval workflows. Every disposal is logged, auditable, and triggers automated depreciation calculations and reporting." },
  ];
  const s = svcs[act]; const Icon = s.icon;
  return (
    <section id="services" style={{ padding:"96px 24px" }}>
      <div style={{ maxWidth:1180, margin:"0 auto" }}>
        <div style={{ marginBottom:52 }}>
          <Pill c={c} purple label="Our Services"/>
          <h2 style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontWeight:900, fontSize:"clamp(2rem,4vw,3rem)", letterSpacing:"-0.03em", lineHeight:1.1, marginTop:18, maxWidth:520 }}>
            Smart solutions for <GradSpan>smarter asset control.</GradSpan>
          </h2>
          <p style={{ color:c.muted, fontSize:17, lineHeight:1.75, maxWidth:500, marginTop:14 }}>
            Beyond tracking — the tools you need to gain control, reduce costs, and make smarter decisions.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:20, alignItems:"start" }}>
          {/* Tabs */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {svcs.map((sv,i)=>{
              const TabIcon = sv.icon; const active = i===act;
              return (
                <button key={sv.title} onClick={()=>setAct(i)}
                  style={{ textAlign:"left", padding:"13px 15px", borderRadius:12, cursor:"pointer", border:active?`1px solid rgba(124,58,237,0.45)`:`1px solid ${c.border}`, background:active?"rgba(124,58,237,0.12)":c.surface, color:active?"#a855f7":c.muted, transition:"all .2s" }}
                  onMouseEnter={e=>{if(!active){e.currentTarget.style.color=c.text;e.currentTarget.style.borderColor="rgba(124,58,237,0.25)"}}}
                  onMouseLeave={e=>{if(!active){e.currentTarget.style.color=c.muted;e.currentTarget.style.borderColor=c.border}}}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <TabIcon size={15}/>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13, fontFamily:"Inter Tight,Inter,sans-serif" }}>{sv.title}</div>
                      <div style={{ fontSize:11, marginTop:2, opacity:.7 }}>{sv.short}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Panel */}
          <div key={act} style={{ padding:"36px", borderRadius:20, background:c.surface, border:`1px solid ${c.border}`, minHeight:280 }}>
            <div style={{ width:48,height:48,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)",marginBottom:22 }}>
              <Icon size={22} style={{color:"#a855f7"}}/>
            </div>
            <h3 style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontWeight:800, fontSize:22, marginBottom:14 }}>{s.title}</h3>
            <p style={{ color:c.muted, lineHeight:1.8, fontSize:15, maxWidth:520 }}>{s.body}</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:26 }}>
              {["Tailored to your business","Powered by AI","Audit-ready"].map(tag=>(
                <span key={tag} style={{ padding:"5px 13px", borderRadius:8, fontSize:13, fontWeight:600, background:"rgba(124,58,237,0.11)", border:"1px solid rgba(124,58,237,0.25)", color:"#a855f7" }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──── INDUSTRIES ──────────────────────────────────────────── */
function Industries({ c, dark }: any) {
  const list = [
    { icon:Hotel,        name:"Hospitality",       desc:"Hotels and resorts manage linens, AV equipment, vehicles and amenities across multiple properties — all in one platform." },
    { icon:Stethoscope,  name:"Healthcare",         desc:"Hospitals track medical devices, ward equipment, and pharmaceutical supplies with full compliance and real-time visibility." },
    { icon:GraduationCap,name:"Education",          desc:"Universities and schools manage labs, libraries, IT hardware, and sporting equipment across campuses effortlessly." },
    { icon:Factory,      name:"Manufacturing",      desc:"Factories track tools, machinery, and industrial equipment across production floors and shifts with zero manual effort." },
    { icon:Building2,    name:"Enterprise",         desc:"Large organizations manage laptops, phones, vehicles, and office assets across multiple branches and departments." },
    { icon:Users,        name:"Event Management",   desc:"Event companies track staging, AV gear, furniture, and logistics assets across venues and events in real time." },
  ];
  return (
    <section id="industries" style={{ padding:"96px 24px", background:dark?"rgba(6,182,212,0.05)":c.bg2, borderTop:`1px solid ${c.border}`, borderBottom:`1px solid ${c.border}` }}>
      <div style={{ maxWidth:1180, margin:"0 auto" }}>
        <div style={{ textAlign:"center", maxWidth:560, margin:"0 auto 56px" }}>
          <Pill c={c} cyan label="Industries"/>
          <h2 style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontWeight:900, fontSize:"clamp(2rem,4vw,3rem)", letterSpacing:"-0.03em", lineHeight:1.1, marginTop:18 }}>
            Smarter ops for <GradSpan reverse>every industry.</GradSpan>
          </h2>
          <p style={{ color:c.muted, fontSize:17, marginTop:14, lineHeight:1.75 }}>From hotels to hospitals, our system adapts to your industry's unique needs.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:18 }}>
          {list.map(ind=>{
            const Icon = ind.icon;
            return (
              <div key={ind.name}
                style={{ padding:"28px", borderRadius:18, background:c.surface, border:`1px solid ${c.border}`, transition:"transform .25s,border-color .25s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.borderColor="rgba(6,182,212,0.4)"}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=c.border}}>
                <div style={{ width:44,height:44,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(6,182,212,0.12)",border:"1px solid rgba(6,182,212,0.2)",marginBottom:16 }}>
                  <Icon size={20} style={{color:"#06b6d4"}}/>
                </div>
                <h3 style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontWeight:700, fontSize:17, marginBottom:9 }}>{ind.name}</h3>
                <p style={{ color:c.muted, fontSize:14, lineHeight:1.75 }}>{ind.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──── TESTIMONIALS ────────────────────────────────────────── */
function Testimonials({ c }: any) {
  const list = [
    { q:"We implemented Assera across our hotel chain to streamline asset tracking and cut manual processes. With RFID-based monitoring and digital gate pass approvals, operations now run smoothly and securely.", name:"Operations Head", org:"ITC Hotels" },
    { q:"Assera's ability to assign assets, track depreciation, and generate audit-ready reports has saved us hours every week. The interface is intuitive and support is excellent.", name:"IT Director", org:"Manipal Hospitals" },
    { q:"Multi-location management used to be a nightmare. With Assera our staff manage assets on the go and we've significantly reduced asset loss and improved maintenance planning.", name:"Facilities Manager", org:"DPS Group" },
  ];
  return (
    <section style={{ padding:"96px 24px" }}>
      <div style={{ maxWidth:1180, margin:"0 auto" }}>
        <div style={{ textAlign:"center", maxWidth:560, margin:"0 auto 56px" }}>
          <Pill c={c} purple label="Testimonials"/>
          <h2 style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontWeight:900, fontSize:"clamp(2rem,4vw,3rem)", letterSpacing:"-0.03em", lineHeight:1.1, marginTop:18 }}>
            Trusted by operations teams <GradSpan>everywhere.</GradSpan>
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:18, marginBottom:44 }}>
          {list.map((t,i)=>(
            <div key={i}
              style={{ padding:"32px", borderRadius:18, background:c.surface, border:`1px solid ${c.border}`, transition:"transform .25s" }}
              onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-4px)")}
              onMouseLeave={e=>(e.currentTarget.style.transform="none")}>
              <div style={{ display:"flex", gap:3, marginBottom:18 }}>
                {[0,1,2,3,4].map(j=><Star key={j} size={14} style={{fill:"#fbbf24",color:"#fbbf24"}}/>)}
              </div>
              <p style={{ color:c.muted, fontSize:15, lineHeight:1.8, marginBottom:22 }}>"{t.q}"</p>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:15 }}>{t.name[0]}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{t.name}</div>
                  <div style={{ fontSize:12, color:c.faint }}>{t.org}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"6px 28px" }}>
          {["Manipal Hospitals","ITC Hotels","Northwind Logistics","Titan Industries","DPS Group","Larsen & Toubro"].map(o=>(
            <span key={o} style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontWeight:700, fontSize:14, color:c.faint }}>{o}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──── FAQ ─────────────────────────────────────────────────── */
function FAQ({ c, dark }: any) {
  const [open, setOpen] = useState<number|null>(null);
  const faqs = [
    { q:"What is Assera?",                                  a:"Assera is a cloud-based Asset Management System designed to help organizations track, monitor, and manage physical and digital assets efficiently — from procurement to disposal." },
    { q:"Who can use Assera?",                              a:"Hotels, hospitals, educational institutions, libraries, hostels, manufacturing units, and event management companies — any organization managing physical assets." },
    { q:"Does Assera support RFID and barcode scanning?",   a:"Yes! Assera supports RFID tracking and barcode scanning for fast, accurate asset identification. Mobile scanning is also available via our iOS and Android apps." },
    { q:"Can Assera track asset depreciation?",             a:"Yes. Assera calculates and tracks asset depreciation over time, helping you make data-driven decisions about asset refresh cycles and capital expenditure." },
    { q:"How does role-based access work?",                 a:"Assera supports Admin, Asset Manager, Department Head, and Employee roles — each with a scoped view and permissions. Multi-branch and multi-department structures are fully supported." },
    { q:"Is there a free trial?",                           a:"Yes! We provide a demo and a 30-day free trial so your team can experience Assera's full feature set before subscribing. No credit card required." },
  ];
  return (
    <section id="faq" style={{ padding:"96px 24px", background:dark?"rgba(124,58,237,0.04)":c.bg2, borderTop:`1px solid ${c.border}` }}>
      <div style={{ maxWidth:720, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <Pill c={c} purple label="FAQ"/>
          <h2 style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontWeight:900, fontSize:"clamp(2rem,4vw,3rem)", letterSpacing:"-0.03em", lineHeight:1.1, marginTop:18 }}>
            Frequently asked <GradSpan>questions.</GradSpan>
          </h2>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {faqs.map((f,i)=>(
            <div key={i} style={{ borderRadius:13, border:open===i?`1px solid rgba(124,58,237,0.45)`:`1px solid ${c.border}`, background:c.surface, overflow:"hidden", transition:"border-color .25s" }}>
              <button onClick={()=>setOpen(open===i?null:i)}
                style={{ width:"100%", textAlign:"left", padding:"18px 22px", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, color:c.text }}>
                <span style={{ fontWeight:600, fontSize:15 }}>{f.q}</span>
                <ChevronDown size={17} style={{ color:c.faint, flexShrink:0, transition:"transform .3s", transform:open===i?"rotate(180deg)":"none" }}/>
              </button>
              {open===i && (
                <div style={{ padding:"0 22px 18px", paddingTop:14, color:c.muted, fontSize:14, lineHeight:1.8, borderTop:`1px solid ${c.border}` }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──── CTA ─────────────────────────────────────────────────── */
function CTA({ c }: any) {
  return (
    <section style={{ padding:"80px 24px" }}>
      <div style={{ maxWidth:1180, margin:"0 auto" }}>
        <div style={{ borderRadius:28, padding:"80px 48px", textAlign:"center", background:"linear-gradient(135deg,#1e0a3c,#0e1a40,#072038)", border:"1px solid rgba(124,58,237,0.3)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-80, left:-60, width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.15),transparent 70%)" }}/>
          <div style={{ position:"absolute", bottom:-80, right:-60, width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle,rgba(6,182,212,0.1),transparent 70%)" }}/>
          <div style={{ position:"relative" }}>
            <Pill c={{pillPurple:{bg:"rgba(124,58,237,0.25)",br:"rgba(124,58,237,0.5)",tx:"#d8b4fe"}}} purple label="Get Started Today" icon={<Sparkles size={11}/>}/>
            <h2 style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontWeight:900, fontSize:"clamp(2.5rem,6vw,4.2rem)", letterSpacing:"-0.03em", color:"#fff", lineHeight:1.05, marginTop:22, marginBottom:18 }}>
              Bring order to<br/>your inventory.
            </h2>
            <p style={{ color:"rgba(255,255,255,0.62)", fontSize:18, maxWidth:460, margin:"0 auto 38px", lineHeight:1.75 }}>
              Set up your organization in under 10 minutes. Import from any spreadsheet. No credit card required.
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:14 }}>
              <Link to="/login"
                style={{ display:"flex", alignItems:"center", gap:8, height:50, padding:"0 30px", borderRadius:13, background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"#fff", fontWeight:800, fontSize:15, textDecoration:"none", boxShadow:"0 8px 32px rgba(124,58,237,0.55)", transition:"transform .2s" }}
                onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-3px)")}
                onMouseLeave={e=>(e.currentTarget.style.transform="none")}>
                Launch Assera <ArrowRight size={16}/>
              </Link>
              <button style={{ display:"flex", alignItems:"center", gap:8, height:50, padding:"0 30px", borderRadius:13, fontWeight:700, fontSize:15, cursor:"pointer", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.9)", transition:"transform .2s" }}
                onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-2px)")}
                onMouseLeave={e=>(e.currentTarget.style.transform="none")}>
                Book a Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──── FOOTER ──────────────────────────────────────────────── */
function Footer({ c, dark }: any) {
  const cols: Record<string,string[]> = {
    Product:["Features","How It Works","Pricing","Changelog"],
    Solutions:["Hospitals","Hotels","Education","Manufacturing"],
    Company:["About","Blog","Careers","Contact"],
    Legal:["Privacy Policy","Terms of Service","Security","Cookies"],
  };
  return (
    <footer style={{ borderTop:`1px solid ${c.border}`, padding:"52px 24px 28px", background:dark?"rgba(0,0,0,0.45)":c.bg2 }}>
      <div style={{ maxWidth:1180, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto auto auto", gap:"0 40px", alignItems:"start", flexWrap:"wrap" }}>
          <div style={{ marginRight:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <img src="/Fevicon.png" alt="Assera" style={{ height:30, width:30, borderRadius:8, objectFit:"contain" }}/>
              <span style={{ fontFamily:"Inter Tight,Inter,sans-serif", fontWeight:800, fontSize:17 }}>Assera</span>
            </div>
            <p style={{ color:c.muted, fontSize:13, lineHeight:1.75, maxWidth:240 }}>The modern operating system for physical assets. Track, allocate, book, maintain, and audit — all in one workspace.</p>
            <p style={{ color:c.faint, fontSize:12, marginTop:20 }}>© 2026 Assera · Odoo Hackathon 2026</p>
          </div>
          {Object.entries(cols).map(([g,items])=>(
            <div key={g}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", color:c.faint, marginBottom:14 }}>{g}</div>
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:9 }}>
                {items.map(item=>(
                  <li key={item}><a href="#" style={{ color:c.muted, textDecoration:"none", fontSize:13, transition:"color .2s" }}
                    onMouseEnter={e=>(e.currentTarget.style.color=c.text)}
                    onMouseLeave={e=>(e.currentTarget.style.color=c.muted)}>{item}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ──── Shared mini-components ──────────────────────────────── */
function GradSpan({ children, reverse=false }: { children: React.ReactNode; reverse?: boolean }) {
  return (
    <span style={{ backgroundImage: reverse ? "linear-gradient(135deg,#06b6d4,#a855f7)" : "linear-gradient(135deg,#a855f7,#7c3aed,#06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
      {children}
    </span>
  );
}

function Pill({ c, purple, cyan, label, icon }: { c:any; purple?: boolean; cyan?: boolean; label:string; icon?: React.ReactNode }) {
  const theme = purple ? c.pillPurple : c.pillCyan;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"5px 14px", borderRadius:100, fontSize:11, fontWeight:800, letterSpacing:"0.07em", textTransform:"uppercase" as const, background:theme.bg, border:`1px solid ${theme.br}`, color:theme.tx }}>
      {icon} {label}
    </span>
  );
}
