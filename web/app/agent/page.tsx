"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, isHQ, logout, hasPermission } from "../../src/lib/authStore";
import { normalizeRbacRole } from "../../src/lib/rbac";
import { toAgentWorkspaceId } from "../../src/lib/agent/agentWorkspace";

const AUTH = "Bearer zeniva-secret-2025";
const GOLD  = "#E6B85A";
const BLUE  = "#0F6CF5";
const GREEN = "#10B981";
const RED   = "#ef4444";
const IMPERSONATE_KEY = "zeniva_impersonating";

type AgentStatus = "live" | "active" | "idle" | "error";
type AIAgent = {
  id: string; name: string; emoji: string; avatar?: string;
  status: AgentStatus; type: string; schedule: string; color: string;
  description: string; features: string[]; lastAction?: string;
};

const AI_AGENTS: AIAgent[] = [
  { id:"lina",  name:"Lina",  emoji:"🤖", avatar:"/agents/lina.png",  status:"live",   type:"AI Travel Concierge · GPT-4o",    schedule:"24/7 Real-time", color:"#6366f1", description:"Polyglot AI travel concierge. Qualifies leads, quotes packages, saves to Supabase.", features:["GPT-4o","Multi-language","Lead extraction","Supabase sync","24/7"], lastAction:"Chat replied 2min ago" },
  { id:"marco", name:"Marco", emoji:"🔥", avatar:"/agents/marco.png", status:"active", type:"Lead Hunter · 5-Engine Scraper",   schedule:"Every 2h",      color:"#ef4444", description:"5 scraping engines: Reddit, competitors, social, SEO intent, deep web.", features:["Reddit","Competitors","Social","SEO","Deep web"], lastAction:"3 leads qualified" },
  { id:"sofia", name:"Sofia", emoji:"📬", avatar:"/agents/sofia.png", status:"active", type:"Email Marketing · AI Writer",      schedule:"Every 6h",      color:"#ec4899", description:"Sends personalized AI-written invite emails to every new lead. EN/FR/ES/AR.", features:["AI emails","EN/FR/ES/AR","Smart timing","Conversion","Unique copy"], lastAction:"39 emails sent" },
  { id:"noah",  name:"Noah",  emoji:"📧", avatar:"/agents/noah.png",  status:"active", type:"Follow-up Specialist · AI",        schedule:"Every 6h",      color:"#f59e0b", description:"Smart follow-up system. New leads get follow-up within 6h. Re-engagement after 72h.", features:["AI copy","Multi-language","Smart cadence","Re-engagement","Dossier sync"], lastAction:"Follow-up sent" },
  { id:"luna",  name:"Luna",  emoji:"📞", avatar:"/agents/luna.png",  status:"live",   type:"Voice & SMS · Real-time",          schedule:"24/7 Real-time", color:"#06b6d4", description:"Real-time phone and SMS powered by AI. Answers calls, sends SMS, delivers quotes.", features:["Inbound SMS","Outbound SMS","Voice calls","AI responses","Twilio"], lastAction:"4 SMS Sent" },
  { id:"atlas", name:"Atlas", emoji:"🛡️",avatar:"/agents/atlas.png", status:"active", type:"Security Guardian · 24/7",         schedule:"Every hour",    color:"#64748b", description:"24/7 security watchdog. Monitors all services, SSL, disk, RAM, SSH, Docker.", features:["Services","SSL certs","SSH detect","Disk/RAM","Auto-restart"], lastAction:"Scan OK 14:00" },
  { id:"mia",   name:"Mia",   emoji:"📱", avatar:"/agents/mia.png",   status:"idle",   type:"Social Media Manager · AI",        schedule:"Daily",         color:"#a855f7", description:"5 travel posts/day with AI captions. Auto-posts to Instagram, TikTok, Facebook.", features:["AI captions","Visual","Instagram","TikTok","Approval flow"], lastAction:"Awaiting TikTok" },
  { id:"leo",   name:"Leo",   emoji:"📊", avatar:"/agents/leo.png",   status:"active", type:"Analytics · Real-time",            schedule:"Real-time",     color:"#8b5cf6", description:"Analyzes conversions, pipeline velocity, agent ROI, and client LTV.", features:["Conversions","Pipeline","Agent ROI","Client LTV","Real-time"], lastAction:"Report updated" },
];

const STATUS_CFG: Record<AgentStatus, { label:string; color:string }> = {
  live:   { label:"LIVE",   color:GREEN },
  active: { label:"ACTIVE", color:BLUE  },
  idle:   { label:"IDLE",   color:GOLD  },
  error:  { label:"ERROR",  color:RED   },
};

const NAV_LINKS = [
  { label:"Dashboard",       href:"/agent",              icon:"🏠" },
  { label:"Chat Hub",        href:"/agent/chat",         icon:"💬" },
  { label:"Clients",         href:"/agent/clients",      icon:"👥" },
  { label:"Leads",           href:"/agent/leads",        icon:"🎯" },
  { label:"Proposals",       href:"/agent/proposals",    icon:"📋" },
  { label:"Bookings",        href:"/agent/bookings",     icon:"✈️" },
  { label:"Commissions",     href:"/agent/commissions",  icon:"💰" },
  { label:"Chat with Lina",  href:"/agent/lina",         icon:"lina" },
  { label:"Listings",        href:"/agent/listings",     icon:"🏨" },
  { label:"Partners",        href:"/agent/partners",     icon:"🤝" },
  { label:"Control Tower",   href:"/agent/control-tower",icon:"🗼" },
  { label:"Settings",        href:"/agent/settings",     icon:"⚙️" },
];

const HQ_LINKS = [
  { label:"Agent Command",   href:"/agent/agents",       icon:"🎯" },
  { label:"Agent Requests",  href:"/agent/requests",     icon:"📨" },
  { label:"Influencer",      href:"/agent/influencer",   icon:"⭐" },
  { label:"AI Agents Hub",   href:"/ai-agents",          icon:"🤖" },
  { label:"Finance",         href:"/agent/finance",      icon:"📊" },
];

/* ── Small components ─────────────────────────────────── */
function StatCard({ icon, label, value, sub, color, href }: any) {
  return (
    <Link href={href||"#"} style={{
      display:"block", textDecoration:"none",
      background:"rgba(255,255,255,.04)", border:`1px solid ${color}22`,
      borderRadius:18, padding:"18px 16px",
      transition:"transform .15s, background .15s",
    }}
    onMouseEnter={e=>(e.currentTarget.style.background=`${color}0A`)}
    onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,.04)")}>
      <div style={{fontSize:24,marginBottom:8}}>{icon}</div>
      <div style={{fontSize:26,fontWeight:900,color,lineHeight:1,marginBottom:4}}>{value??<span style={{color:"rgba(255,255,255,.2)"}}>—</span>}</div>
      <div style={{fontSize:11,fontWeight:800,color:"#fff",marginBottom:2}}>{label}</div>
      {sub && <div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{sub}</div>}
    </Link>
  );
}

function AgentChip({ agent }: { agent:AIAgent }) {
  const cfg = STATUS_CFG[agent.status];
  return (
    <div style={{
      background:"rgba(255,255,255,.03)", border:`1px solid ${agent.color}25`,
      borderRadius:16, padding:"14px", display:"flex", flexDirection:"column", gap:10,
      cursor:"pointer", transition:"transform .15s",
    }}
    onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-3px)")}
    onMouseLeave={e=>(e.currentTarget.style.transform="translateY(0)")}>
      {/* Avatar */}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:44,height:44,borderRadius:12,overflow:"hidden",background:`${agent.color}18`,border:`1px solid ${agent.color}33`,flexShrink:0}}>
          {agent.avatar
            ? <img src={agent.avatar} alt={agent.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
            : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{agent.emoji}</div>
          }
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:900,color:"#fff"}}>{agent.name}</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,.35)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{agent.type.split(" · ")[0]}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:cfg.color,animation:agent.status==="live"?"blink2 1s ease infinite":"none"}}/>
          <span style={{fontSize:8,fontWeight:900,color:cfg.color,letterSpacing:"0.1em"}}>{cfg.label}</span>
        </div>
      </div>
      <div style={{fontSize:10,color:"rgba(255,255,255,.4)",lineHeight:1.5}}>{agent.description.slice(0,72)}…</div>
      {agent.lastAction && (
        <div style={{fontSize:9,fontWeight:700,color:agent.color,background:`${agent.color}10`,borderRadius:8,padding:"4px 8px",width:"fit-content"}}>{agent.lastAction}</div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════ */
export function AgentDashboardPage({ agentId }: { agentId?: string }) {
  const router   = useRouter();
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);
  const hq       = isHQ(user);

  const [impersonation, setImpersonation] = useState<any>(null);
  useEffect(()=>{
    if(typeof window==="undefined") return;
    const raw = localStorage.getItem(IMPERSONATE_KEY);
    if(raw){ try{ setImpersonation(JSON.parse(raw)); }catch{} }
  },[]);

  const effectiveEmail    = impersonation?.agentEmail || user?.email || "";
  const roles             = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];
  const effectiveRole     = normalizeRbacRole(user?.effectiveRole) || normalizeRbacRole(roles[0]);
  const isHQorAdmin       = effectiveRole==="hq" || effectiveRole==="admin" || hq;
  const canTripSearch     = !!user && hasPermission(user,"sales:all");
  const resolvedAgentId   = agentId || toAgentWorkspaceId(user);

  const [navBadges, setNavBadges]         = useState<Record<string,number>>({});
  const [dashStats, setDashStats]         = useState<any>(null);
  const [vpsStats, setVpsStats]           = useState<any>(null);
  const [activity, setActivity]           = useState<any[]>([]);
  const [agentRequests, setAgentRequests] = useState<any[]>([]);
  const [navOpen, setNavOpen]             = useState(true);
  const [searchOpen, setSearchOpen]       = useState(false);
  const [query, setQuery]                 = useState("");
  const [activeSearchTab, setActiveSearchTab] = useState<"flights"|"hotels"|"transfers">("flights");
  const [clock, setClock]                 = useState("");
  const [greeting, setGreeting]           = useState("Good morning");
  const [mounted, setMounted]             = useState(false);

  useEffect(()=>{
    setMounted(true);
    const h = new Date().getHours();
    setGreeting(h<12?"Good morning":h<18?"Good afternoon":"Good evening");
    const tick = () => setClock(new Date().toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));
    tick();
    const iv = setInterval(tick,1000);
    return ()=>clearInterval(iv);
  },[]);

  const fetchAll = async () => {
    try {
      const agentParam = isHQorAdmin?"":` &agent_email=${encodeURIComponent(effectiveEmail)}`;
      const actParam   = effectiveEmail?`?agent_email=${encodeURIComponent(effectiveEmail)}`:"";
      const [dashRes, statsRes, actRes] = await Promise.all([
        fetch(`/api/agents-proxy?path=admin/dashboard-stats${agentParam}`,{headers:{Authorization:AUTH}}),
        fetch("/api/agents-proxy?endpoint=stats",{headers:{Authorization:AUTH}}),
        fetch(`/api/agents-proxy?path=admin/activity-log${actParam}`,{headers:{Authorization:AUTH}}),
      ]);
      if(dashRes.ok) setDashStats(await dashRes.json());
      if(statsRes.ok) setVpsStats(await statsRes.json());
      if(actRes.ok){ const d=await actRes.json(); setActivity(d?.activities||d?.activity||[]); }
    } catch{}
    if(hq){
      try{
        const rr = await fetch("/api/agent-requests");
        if(rr.ok){ const d=await rr.json(); setAgentRequests((d?.data||[]).filter((r:any)=>r.status==="pending").slice(0,5)); }
      }catch{}
    }
    // Inbox badge
    try{
      const lastSeen = (typeof window!=="undefined"?localStorage.getItem("zeniva_inbox_last_seen"):null)||"1970-01-01";
      const ir = await fetch("/api/agent/inbox",{cache:"no-store",headers:effectiveEmail?{"x-user-email":effectiveEmail}:{}});
      if(ir.ok){
        const d = await ir.json();
        const rows:any[] = Array.isArray(d?.data)?d.data:[];
        const unread = rows.filter(row=>{
          const role = row?.sender_role;
          if(role==="hq"||role==="agent"||role==="lina"||role==="system") return false;
          return (row?.created_at||"1970-01-01")>lastSeen;
        }).length;
        if(unread>0) setNavBadges(p=>({...p,"/agent/chat":unread}));
      }
    }catch{}
  };

  useEffect(()=>{
    if(!effectiveEmail) return;
    fetchAll();
    const iv = setInterval(fetchAll,30000);
    return ()=>clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[hq,effectiveEmail]);

  useEffect(()=>{
    if(resolvedAgentId){ try{ window.localStorage.setItem("zeniva_agent_workspace",resolvedAgentId); }catch{} }
  },[resolvedAgentId]);

  const handleSearch = (e:FormEvent) => {
    e.preventDefault();
    if(!query.trim()) return;
    router.push(`/agent/proposals?q=${encodeURIComponent(query.trim())}`);
  };

  const name = mounted && user?.name ? user.name.split(" ")[0] : "";
  const kpis = [
    { icon:"👥", label:"Active Clients",    value:dashStats?.active_clients??vpsStats?.total_clients,   sub:`${dashStats?.open_dossiers??0} dossiers`,      color:BLUE,  href:"/agent/clients" },
    { icon:"🎯", label:"Total Leads",       value:isHQorAdmin?(vpsStats?.total_leads):(dashStats?.active_clients??0), sub:isHQorAdmin?`+${vpsStats?.leads_today??0} today`:"Your pipeline", color:"#a855f7",href:"/agent/leads" },
    { icon:"📧", label:"Emails Sent",       value:isHQorAdmin?vpsStats?.emails_sent:null, sub:isHQorAdmin?`+${vpsStats?.emails_today??0} today`:"HQ only",  color:GREEN, href:"/agent" },
    { icon:"📱", label:"SMS Sent",          value:isHQorAdmin?vpsStats?.sms_sent:null,    sub:isHQorAdmin?`+${vpsStats?.sms_today??0} today`:"HQ only",      color:GOLD,  href:"/agent" },
    { icon:"💰", label:"Comm. Pipeline",    value:dashStats?`$${(dashStats.commission_pipeline||0).toLocaleString()}`:null, sub:`${dashStats?.followups_due??0} follow-ups`, color:"#06b6d4",href:"/agent/commissions" },
    { icon:"💬", label:"Lina Chats",        value:isHQorAdmin?vpsStats?.total_messages:null, sub:"Total conversations",  color:"#ec4899",href:"/agent/chat" },
  ];

  return (
    <div style={{minHeight:"100vh",display:"flex",background:"#02060F",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif",color:"#fff"}}>
      <style>{`
        @keyframes blink2{0%,100%{opacity:1;}50%{opacity:.15;}}
        @keyframes scanD{0%{top:-100%;}100%{top:200%;}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        .mc-link:hover{background:rgba(255,255,255,.06)!important;}
        .mc-row:hover{background:rgba(15,108,245,.06)!important;}
      `}</style>

      {/* Ambient */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-15%",left:"-10%",width:500,height:500,borderRadius:"50%",background:"rgba(15,108,245,.5)",filter:"blur(120px)",opacity:.12}}/>
        <div style={{position:"absolute",bottom:"-10%",right:"-10%",width:400,height:400,borderRadius:"50%",background:"rgba(230,184,90,.4)",filter:"blur(120px)",opacity:.1}}/>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(15,108,245,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(15,108,245,.03) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
        <div style={{position:"absolute",left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(15,108,245,.06),transparent)",animation:"scanD 5s linear infinite",pointerEvents:"none"}}/>
      </div>

      {/* ══ SIDEBAR ═══════════════════════════════════════════════ */}
      <aside style={{
        position:"fixed",inset:"0 auto 0 0",zIndex:40,
        width:navOpen?240:64,
        display:"flex",flexDirection:"column",
        background:"rgba(2,6,15,.95)",backdropFilter:"blur(20px)",
        borderRight:"1px solid rgba(255,255,255,.06)",
        transition:"width .3s ease",
      }}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"16px 12px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
          <button onClick={()=>setNavOpen(v=>!v)} style={{
            width:40,height:40,borderRadius:12,flexShrink:0,
            background:`${BLUE}22`,border:`1px solid ${BLUE}33`,
            display:"flex",alignItems:"center",justifyContent:"center",
            cursor:"pointer",fontSize:16,color:BLUE,
          }}>{navOpen?"◀":"☰"}</button>
          {navOpen && (
            <div>
              <div style={{fontWeight:900,fontSize:13,color:"#fff"}}>Zeniva</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,.3)",letterSpacing:"0.06em"}}>MISSION CONTROL</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{flex:1,overflowY:"auto",padding:"8px"}}>
          {NAV_LINKS.map((link)=>{
            const active = pathname===link.href||(link.href!=="/agent"&&pathname?.startsWith(link.href));
            return (
              <div key={link.href} style={{position:"relative",marginBottom:2}}>
                <Link href={link.href} onClick={()=>{
                  if(link.href==="/agent/chat"&&typeof window!=="undefined"){
                    localStorage.setItem("zeniva_inbox_last_seen",new Date().toISOString());
                    setNavBadges(p=>{const n={...p};delete n["/agent/chat"];return n;});
                  }
                }} className="mc-link" style={{
                  display:"flex",alignItems:"center",gap:10,borderRadius:12,
                  padding:"9px 10px",textDecoration:"none",
                  background:active?`${BLUE}22`:"transparent",
                  border:active?`1px solid ${BLUE}33`:"1px solid transparent",
                  transition:"background .15s",
                }}>
                  {link.icon==="lina"
                    ? <img src="/branding/lina-avatar.png" alt="Lina" style={{width:20,height:20,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"1px solid rgba(255,255,255,.2)"}}/>
                    : <span style={{fontSize:16,flexShrink:0,width:20,textAlign:"center"}}>{link.icon}</span>
                  }
                  {navOpen && <span style={{flex:1,fontSize:12,fontWeight:700,color:active?"#fff":"rgba(255,255,255,.6)",whiteSpace:"nowrap"}}>{link.label}</span>}
                  {navBadges[link.href]>0 && (
                    <span style={{width:16,height:16,borderRadius:"50%",background:RED,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:900,color:"#fff",flexShrink:0}}>{navBadges[link.href]}</span>
                  )}
                </Link>
              </div>
            );
          })}

          {isHQorAdmin && (
            <>
              <div style={{padding:"10px 8px 6px",fontSize:8,fontWeight:800,color:"rgba(255,255,255,.2)",letterSpacing:"0.12em",textTransform:"uppercase"}}>HQ ONLY</div>
              {HQ_LINKS.map((link)=>(
                <div key={link.href} style={{marginBottom:2}}>
                  <Link href={link.href} className="mc-link" style={{
                    display:"flex",alignItems:"center",gap:10,borderRadius:12,
                    padding:"9px 10px",textDecoration:"none",transition:"background .15s",
                  }}>
                    <span style={{fontSize:16,flexShrink:0,width:20,textAlign:"center"}}>{link.icon}</span>
                    {navOpen && <span style={{fontSize:12,fontWeight:700,color:`${GOLD}99`,whiteSpace:"nowrap"}}>{link.label}</span>}
                  </Link>
                </div>
              ))}
            </>
          )}
        </nav>

        {/* User */}
        <div style={{padding:"8px",borderTop:"1px solid rgba(255,255,255,.06)"}}>
          {navOpen && user && (
            <div style={{background:"rgba(255,255,255,.04)",borderRadius:12,padding:"10px 12px"}}>
              <div style={{fontSize:12,fontWeight:800,color:"#fff",marginBottom:2}}>{user.name||user.email}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,.3)",marginBottom:6,letterSpacing:"0.06em"}}>{effectiveRole?.toUpperCase()}</div>
              <button onClick={()=>logout()} style={{fontSize:10,fontWeight:700,color:RED,background:"transparent",border:"none",cursor:"pointer",padding:0}}>Sign out</button>
            </div>
          )}
        </div>
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════════ */}
      <main style={{flex:1,marginLeft:navOpen?240:64,transition:"margin-left .3s ease",minHeight:"100vh",position:"relative",zIndex:1}}>
        <div style={{maxWidth:1400,margin:"0 auto",padding:"28px 28px 60px"}}>

          {/* Impersonation banner */}
          {impersonation && (
            <div style={{
              marginBottom:20,borderRadius:14,padding:"12px 20px",
              background:"linear-gradient(90deg,#7c3aed,#ec4899)",
              display:"flex",alignItems:"center",justifyContent:"space-between",
            }}>
              <span style={{fontSize:13,fontWeight:700}}>👁️ Viewing as: <strong>{impersonation.agentName}</strong> ({impersonation.agentEmail})</span>
              <button onClick={()=>{localStorage.removeItem(IMPERSONATE_KEY);setImpersonation(null);window.location.href="/agent/agents";}} style={{
                background:"rgba(255,255,255,.2)",border:"none",borderRadius:999,padding:"5px 14px",
                fontSize:11,fontWeight:800,color:"#fff",cursor:"pointer",
              }}>← Return to HQ</button>
            </div>
          )}

          {/* ── Header ─────────────────────────────────────────── */}
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,marginBottom:28,animation:"fadeIn .4s ease both"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:GREEN,animation:"blink2 1s ease infinite"}}/>
                <span style={{fontSize:9,fontWeight:900,color:"rgba(255,255,255,.4)",letterSpacing:"0.14em"}}>ZENIVA MISSION CONTROL · AGENT PORTAL</span>
              </div>
              <h1 style={{fontSize:32,fontWeight:900,letterSpacing:"-0.03em",lineHeight:1,marginBottom:6}}>
                {greeting}{name?`, ${name}`:""} 👋
              </h1>
              <div style={{fontSize:13,color:"rgba(255,255,255,.4)"}}>Your AI command center — all systems live</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
              {/* Clock */}
              <div style={{fontSize:20,fontWeight:900,color:GREEN,fontFamily:"monospace",letterSpacing:"0.06em",fontVariantNumeric:"tabular-nums"}}>{mounted?clock:"--:--:--"}</div>
              <div style={{display:"flex",gap:8}}>
                {canTripSearch && (
                  <button onClick={()=>setSearchOpen(true)} style={{
                    background:`linear-gradient(135deg,${BLUE},#0948CC)`,border:"none",borderRadius:999,
                    padding:"10px 20px",fontSize:12,fontWeight:800,color:"#fff",cursor:"pointer",
                    display:"flex",alignItems:"center",gap:6,
                  }}>✈️ Trip Search</button>
                )}
                <Link href="/agent/clients" style={{
                  background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",
                  borderRadius:999,padding:"10px 20px",fontSize:12,fontWeight:800,color:"#fff",
                  textDecoration:"none",display:"flex",alignItems:"center",gap:6,
                }}>👥 Clients</Link>
              </div>
            </div>
          </div>

          {/* ── Status bar ─────────────────────────────────────── */}
          <div style={{
            background:"rgba(16,185,129,.06)",border:"1px solid rgba(16,185,129,.2)",
            borderRadius:14,padding:"10px 18px",marginBottom:24,
            display:"flex",alignItems:"center",gap:10,
            animation:"fadeIn .4s ease .05s both",
          }}>
            <div style={{width:7,height:7,borderRadius:"50%",background:GREEN,animation:"blink2 .8s ease infinite",flexShrink:0}}/>
            <div style={{flex:1,fontSize:12,fontWeight:700,color:GREEN,letterSpacing:"0.04em"}}>ALL SYSTEMS OPERATIONAL — Lina AI is online and processing client requests in real-time</div>
            <Link href="/agent/chat" style={{
              background:`${BLUE}22`,border:`1px solid ${BLUE}44`,borderRadius:10,
              padding:"5px 14px",fontSize:10,fontWeight:800,color:BLUE,textDecoration:"none",flexShrink:0,
            }}>LIVE INBOX →</Link>
          </div>

          {/* ── KPI Grid ───────────────────────────────────────── */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12,marginBottom:24,animation:"fadeIn .4s ease .1s both"}}>
            {kpis.map(k=>(
              <StatCard key={k.label} {...k}/>
            ))}
          </div>

          {/* ── Main 3-col grid ────────────────────────────────── */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 340px",gap:20}}>

            {/* ── COL 1: AI Agents ─────────────────────────────── */}
            <div style={{animation:"fadeIn .4s ease .15s both"}}>
              <div style={{
                background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",
                borderRadius:20,overflow:"hidden",
              }}>
                <div style={{
                  padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,.06)",
                  background:`linear-gradient(135deg,${BLUE}18,rgba(255,255,255,.02))`,
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                }}>
                  <div>
                    <div style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,.3)",letterSpacing:"0.12em",marginBottom:3}}>ARTIFICIAL INTELLIGENCE</div>
                    <div style={{fontSize:16,fontWeight:900}}>Your AI Agent Team</div>
                  </div>
                  <Link href="/ai-agents" style={{fontSize:11,fontWeight:800,color:BLUE,textDecoration:"none",background:`${BLUE}18`,border:`1px solid ${BLUE}33`,borderRadius:999,padding:"5px 12px"}}>Full view →</Link>
                </div>
                <div style={{padding:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {(isHQorAdmin?AI_AGENTS:AI_AGENTS.filter(a=>["lina","marco","sofia","luna"].includes(a.id))).map(agent=>(
                    <AgentChip key={agent.id} agent={agent}/>
                  ))}
                </div>
              </div>
            </div>

            {/* ── COL 2: Activity + Clients ────────────────────── */}
            <div style={{display:"flex",flexDirection:"column",gap:16,animation:"fadeIn .4s ease .2s both"}}>

              {/* Live Activity */}
              <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:20,overflow:"hidden",flex:1}}>
                <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:RED,animation:"blink2 .7s ease infinite"}}/>
                    <span style={{fontSize:13,fontWeight:900}}>Live Activity</span>
                  </div>
                  <span style={{fontSize:9,fontWeight:800,color:GREEN,letterSpacing:"0.08em"}}>● AUTO-REFRESH 30s</span>
                </div>
                <div style={{maxHeight:220,overflowY:"auto"}}>
                  {activity.length===0
                    ? <div style={{padding:"20px",textAlign:"center",fontSize:12,color:"rgba(255,255,255,.2)"}}>No recent activity</div>
                    : activity.slice(0,12).map((a:any,i:number)=>(
                      <div key={i} className="mc-row" style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 18px",borderBottom:"1px solid rgba(255,255,255,.04)",transition:"background .15s"}}>
                        <span style={{fontSize:16,flexShrink:0,marginTop:1}}>
                          {a.type==="email"?"📧":a.type==="sms"?"📱":a.type==="chat"?"💬":a.type==="lead_new"?"🎯":a.type==="client_converted"?"🏆":"⚡"}
                        </span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.8)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.client_name||a.description||a.action||"—"}</div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,.35)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.message||a.destination||a.details||""}</div>
                        </div>
                        <span style={{fontSize:9,color:"rgba(255,255,255,.25)",flexShrink:0}}>{a.time_ago||a.time||""}</span>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Client 360 */}
              <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:20,overflow:"hidden"}}>
                <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:13,fontWeight:900}}>Client 360°</span>
                  <Link href="/agent/clients" style={{fontSize:10,fontWeight:800,color:BLUE,textDecoration:"none"}}>View all →</Link>
                </div>
                <div style={{padding:"0 4px"}}>
                  {dashStats?.recent_clients?.length>0
                    ? dashStats.recent_clients.slice(0,4).map((c:any)=>(
                      <div key={c.id} className="mc-row" onClick={()=>router.push("/agent/clients")} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,.04)",cursor:"pointer",transition:"background .15s"}}>
                        <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${BLUE},#0948CC)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#fff",flexShrink:0}}>
                          {(c.name||"?")[0].toUpperCase()}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:800,color:"rgba(255,255,255,.85)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,.3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.email}</div>
                        </div>
                        {c.destination && <span style={{fontSize:10,color:BLUE,fontWeight:700,flexShrink:0}}>✈️ {c.destination}</span>}
                      </div>
                    ))
                    : <div style={{padding:"20px",textAlign:"center",fontSize:12,color:"rgba(255,255,255,.2)"}}>No clients yet</div>
                  }
                </div>
              </div>
            </div>

            {/* ── COL 3: Quick actions + pipeline ─────────────── */}
            <div style={{display:"flex",flexDirection:"column",gap:16,animation:"fadeIn .4s ease .25s both"}}>

              {/* Quick actions */}
              <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:20,padding:"16px"}}>
                <div style={{fontSize:11,fontWeight:900,color:"rgba(255,255,255,.4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Quick Actions</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[
                    {label:"New Client",   href:"/agent/clients",    icon:"👥", color:BLUE},
                    {label:"New Dossier",  href:"/agent/clients",    icon:"📁", color:"#6366f1"},
                    {label:"Proposal",     href:"/agent/proposals",  icon:"📋", color:"#a855f7"},
                    {label:"Chat Lina",    href:"/agent/lina",       icon:"lina",color:GREEN},
                    {label:"Booking",      href:"/agent/bookings",   icon:"✈️", color:GOLD},
                    {label:"Commissions",  href:"/agent/commissions",icon:"💰", color:"#ec4899"},
                  ].map((a:any)=>(
                    <Link key={a.label} href={a.href} style={{
                      background:`${a.color}18`,border:`1px solid ${a.color}30`,
                      borderRadius:12,padding:"10px 10px",
                      display:"flex",alignItems:"center",gap:6,
                      textDecoration:"none",color:"#fff",fontSize:11,fontWeight:800,
                      transition:"background .15s",
                    }}
                    onMouseEnter={e=>(e.currentTarget.style.background=`${a.color}28`)}
                    onMouseLeave={e=>(e.currentTarget.style.background=`${a.color}18`)}>
                      {a.icon==="lina"
                        ? <img src="/branding/lina-avatar.png" alt="" style={{width:18,height:18,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                        : <span style={{fontSize:16}}>{a.icon}</span>
                      }
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Dossier pipeline */}
              <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:20,padding:"16px",flex:1}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{fontSize:11,fontWeight:900,color:"rgba(255,255,255,.4)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Dossier Pipeline</div>
                  <Link href="/agent/clients" style={{fontSize:10,fontWeight:800,color:BLUE,textDecoration:"none"}}>Create →</Link>
                </div>
                {dashStats?.recent_dossiers?.length>0
                  ? dashStats.recent_dossiers.map((d:any)=>(
                    <div key={d.id} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:12,padding:"10px 12px",marginBottom:8}}>
                      <div style={{fontSize:12,fontWeight:800,color:"rgba(255,255,255,.8)",marginBottom:2}}>{d.title}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{d.client_name} · {d.destination||"—"}</div>
                      <div style={{fontSize:9,fontWeight:800,color:BLUE,marginTop:4}}>{d.status}</div>
                    </div>
                  ))
                  : <div style={{border:"2px dashed rgba(255,255,255,.08)",borderRadius:12,padding:"20px",textAlign:"center"}}>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.2)",marginBottom:6}}>No open dossiers</div>
                      <Link href="/agent/clients" style={{fontSize:11,fontWeight:800,color:BLUE,textDecoration:"none"}}>Create a dossier →</Link>
                    </div>
                }
              </div>

              {/* HQ: Agent requests */}
              {isHQorAdmin && agentRequests.length>0 && (
                <div style={{background:"rgba(230,184,90,.04)",border:"1px solid rgba(230,184,90,.2)",borderRadius:20,padding:"16px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                    <div style={{fontSize:11,fontWeight:900,color:GOLD,letterSpacing:"0.08em",textTransform:"uppercase"}}>⚡ Agent Requests</div>
                    <Link href="/agent/requests" style={{fontSize:10,fontWeight:800,color:GOLD,textDecoration:"none"}}>View all</Link>
                  </div>
                  {agentRequests.map(r=>(
                    <div key={r.id} style={{background:"rgba(230,184,90,.06)",border:"1px solid rgba(230,184,90,.15)",borderRadius:12,padding:"10px 12px",marginBottom:6}}>
                      <div style={{fontSize:12,fontWeight:800,color:"rgba(255,255,255,.8)"}}>{r.name}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{r.email} · {r.role||"agent"}</div>
                      <Link href="/agent/requests" style={{fontSize:10,fontWeight:800,color:GOLD,textDecoration:"none",marginTop:4,display:"block"}}>Approve →</Link>
                    </div>
                  ))}
                </div>
              )}

              {/* Agent tools */}
              <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:20,padding:"16px"}}>
                <div style={{fontSize:11,fontWeight:900,color:"rgba(255,255,255,.4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Agent Tools</div>
                {[
                  {label:"📊 AI Agents Dashboard", href:"/ai-agents"},
                  {label:"🗂️ Client Profiles",      href:"/agent/clients"},
                  {label:"📋 Bookings Center",       href:"/agent/bookings"},
                  {label:"💰 Commissions",           href:"/agent/commissions"},
                  {label:"📄 Documents",             href:"/agent/documents"},
                ].map(t=>(
                  <Link key={t.href} href={t.href} className="mc-link" style={{
                    display:"flex",alignItems:"center",gap:8,borderRadius:10,
                    padding:"8px 10px",textDecoration:"none",
                    fontSize:11,fontWeight:700,color:"rgba(255,255,255,.6)",
                    marginBottom:2,transition:"background .15s",
                  }}>{t.label}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Trip Search Modal ─────────────────────────────────── */}
      {searchOpen && (
        <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.7)",backdropFilter:"blur(8px)",padding:16}}>
          <div style={{width:"100%",maxWidth:580,borderRadius:24,overflow:"hidden",background:"#080E1E",border:"1px solid rgba(255,255,255,.1)",boxShadow:"0 32px 80px rgba(0,0,0,.7)"}}>
            <div style={{padding:"20px 24px",borderBottom:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"space-between",background:`linear-gradient(135deg,${BLUE}22,rgba(255,255,255,.02))`}}>
              <div style={{fontSize:18,fontWeight:900}}>✈️ Trip Search</div>
              <button onClick={()=>setSearchOpen(false)} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:999,padding:"6px 10px",color:"#fff",cursor:"pointer",fontSize:12}}>✕</button>
            </div>
            <div style={{padding:24}}>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                {(["flights","hotels","transfers"] as const).map(t=>(
                  <button key={t} onClick={()=>setActiveSearchTab(t)} style={{
                    padding:"8px 16px",borderRadius:999,fontSize:12,fontWeight:800,cursor:"pointer",border:"none",
                    background:activeSearchTab===t?BLUE:"rgba(255,255,255,.08)",
                    color:activeSearchTab===t?"#fff":"rgba(255,255,255,.5)",
                  }}>
                    {t==="flights"?"✈️ Flights":t==="hotels"?"🏨 Hotels":"🚗 Transfers"}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSearch}>
                <textarea value={query} onChange={e=>setQuery(e.target.value)} rows={3}
                  placeholder={activeSearchTab==="flights"?"Ex: MTL → Cancún, Jul 15, 2 adults, economy…":activeSearchTab==="hotels"?"Ex: 5-star hotel Cancún, Jul 15-22, 2 adults…":"Ex: Airport → hotel Cancún, Jul 15 14:00…"}
                  style={{width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:"14px 16px",fontSize:13,color:"#fff",resize:"none",outline:"none",boxSizing:"border-box",marginBottom:12}}
                />
                <div style={{display:"flex",gap:10}}>
                  <button type="submit" style={{flex:1,background:`linear-gradient(135deg,${BLUE},#0948CC)`,border:"none",borderRadius:999,padding:"12px",fontSize:13,fontWeight:800,color:"#fff",cursor:"pointer"}}>🔍 Search with Lina</button>
                  <button type="button" onClick={()=>setSearchOpen(false)} style={{padding:"12px 20px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:999,fontSize:13,fontWeight:700,color:"rgba(255,255,255,.6)",cursor:"pointer"}}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import AppAgentGate from "../../src/components/AppAgentGate.client";
export default function AgentPage() {
  return (
    <AppAgentGate>
      <AgentDashboardPage />
    </AppAgentGate>
  );
}
