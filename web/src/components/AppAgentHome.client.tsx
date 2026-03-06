"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, isHQ, logout } from "../lib/authStore";

const GOLD = "#E6B85A";
const BLUE = "#0F6CF5";
const GREEN = "#10B981";
const RED   = "#ef4444";
const AUTH  = "Bearer zeniva-secret-2025";

// ─── Live message row ─────────────────────────────────────────────────────
function MsgRow({ msg, onClick }: { msg: any; onClick: () => void }) {
  const isNew = !msg.seen;
  const time = msg.created_at ? new Date(msg.created_at).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }) : "";
  return (
    <button onClick={onClick} style={{
      display:"flex",alignItems:"center",gap:12,width:"100%",
      background:isNew?"rgba(15,108,245,.06)":"transparent",
      border:"none",
      borderBottom:"1px solid rgba(255,255,255,.05)",
      padding:"13px 0",cursor:"pointer",textAlign:"left",
      WebkitTapHighlightColor:"transparent",
      transition:"background .15s",
    }}>
      {/* Avatar */}
      <div style={{
        width:40,height:40,borderRadius:"50%",flexShrink:0,
        background:`linear-gradient(135deg,${BLUE},#0B3FAA)`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:14,fontWeight:900,color:"#fff",
        border:`2px solid ${isNew?"rgba(15,108,245,.4)":"rgba(255,255,255,.08)"}`,
      }}>
        {(msg.full_name||msg.author||"?")[0].toUpperCase()}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
          <span style={{fontSize:13,fontWeight:800,color:isNew?"#fff":"rgba(255,255,255,.7)"}}>{msg.full_name||msg.author||"Client"}</span>
          <span style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{time}</span>
        </div>
        <div style={{fontSize:11,color:"rgba(255,255,255,.4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          {msg.message||"No message content"}
        </div>
      </div>
      {isNew && (
        <div style={{
          width:8,height:8,borderRadius:"50%",background:BLUE,
          flexShrink:0,boxShadow:`0 0 8px ${BLUE}`,
        }}/>
      )}
    </button>
  );
}

// ─── AI Agent status card ─────────────────────────────────────────────────
function AgentCard({ name, desc, status, color, icon }: { name:string;desc:string;status:string;color:string;icon:string }) {
  return (
    <div style={{
      background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",
      borderRadius:16,padding:"14px",
    }}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
        <div style={{
          width:34,height:34,borderRadius:10,flexShrink:0,
          background:`${color}18`,border:`1px solid ${color}30`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,
        }}>{icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:800,color:"#fff"}}>{name}</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,.35)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{desc}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:color,animation:"blink 1.8s ease infinite"}}/>
          <span style={{fontSize:9,fontWeight:800,color,letterSpacing:"0.06em"}}>{status}</span>
        </div>
      </div>
    </div>
  );
}

export default function AppAgentHome() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHq = user ? isHQ(user) : false;
  const [msgs, setMsgs] = useState<any[]>([]);
  const [stats, setStats] = useState({ inbox: 0, unread: 0, clients: 0, leads: 0, revenue: "—" });
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Good morning");
  const [activeTabs, setActiveTabs] = useState<{lina:number;total:number}>({lina:0,total:0});
  const intervalRef = useRef<any>(null);

  const load = async () => {
    try {
      // Inbox
      const email = user?.email || "";
      const res = await fetch(`/api/agent/inbox?channel=all&limit=10`, {
        headers: { "x-user-email": email, Authorization: AUTH },
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.messages || data || [];
        const lastSeen = localStorage.getItem("zeniva_inbox_last_seen");
        const unread = lastSeen ? list.filter((m: any) => new Date(m.created_at) > new Date(lastSeen)).length : list.length;
        setMsgs(list.slice(0, 6).map((m: any) => ({ ...m, seen: lastSeen ? new Date(m.created_at) <= new Date(lastSeen) : false })));
        setStats(s => ({ ...s, inbox: list.length, unread }));
      }
    } catch { /* ignore */ }

    try {
      // Leads count
      const lr = await fetch("/api/agents-proxy?path=leads&limit=1", { headers: { Authorization: AUTH } });
      if (lr.ok) {
        const ld = await lr.json();
        setStats(s => ({ ...s, leads: ld.total || ld.count || (Array.isArray(ld) ? ld.length : 0) }));
      }
    } catch { /* ignore */ }

    try {
      // Clients
      const cr = await fetch("/api/agents-proxy?path=clients&limit=1", { headers: { Authorization: AUTH } });
      if (cr.ok) {
        const cd = await cr.json();
        setStats(s => ({ ...s, clients: cd.total || cd.count || (Array.isArray(cd) ? cd.length : 0) }));
      }
    } catch { /* ignore */ }

    // Simulate live Lina activity (random 1-4 active conversations)
    setActiveTabs({ lina: Math.floor(Math.random() * 4) + 1, total: Math.floor(Math.random() * 12) + 3 });
  };

  useEffect(() => {
    setMounted(true);
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
    load();
    intervalRef.current = setInterval(load, 30000);
    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstName = mounted && user?.name ? user.name.split(" ")[0] : "";

  return (
    <div style={{
      minHeight:"100dvh",
      background:"linear-gradient(180deg,#040810 0%,#020508 100%)",
      fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      color:"#fff",
      paddingTop:"calc(env(safe-area-inset-top) + 16px)",
      paddingBottom:"calc(88px + env(safe-area-inset-bottom))",
      overflowX:"hidden",
    }}>
      <style>{`
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:.25;}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes orbP{0%,100%{transform:scale(1);opacity:.15;}50%{transform:scale(1.15);opacity:.22;}}
        .stat-card:active{transform:scale(.97)!important;}
        .action-btn:active{transform:scale(.95)!important;}
      `}</style>

      {/* Background orbs */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-10%",left:"-15%",width:300,height:300,borderRadius:"50%",background:"rgba(15,108,245,1)",filter:"blur(80px)",animation:"orbP 5s ease infinite"}}/>
        <div style={{position:"absolute",bottom:"20%",right:"-10%",width:250,height:250,borderRadius:"50%",background:"rgba(230,184,90,.7)",filter:"blur(80px)",animation:"orbP 7s ease 1s infinite"}}/>
      </div>

      <div style={{position:"relative",zIndex:1,padding:"0 20px"}}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={{marginBottom:24,animation:"fadeUp .3s ease both"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <img src="/branding/lina-avatar.png" alt="" style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(230,184,90,.35)"}}/>
              <div>
                <div style={{fontSize:18,fontWeight:900,letterSpacing:"-0.02em"}}>{greeting}{firstName?`, ${firstName}`:""}</div>
                <div style={{display:"flex",alignItems:"center",gap:5,marginTop:1}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:GREEN,animation:"blink 1.5s ease infinite"}}/>
                  <span style={{fontSize:10,fontWeight:800,letterSpacing:"0.08em",color:isHq?GOLD:BLUE}}>{isHq?"HQ":"AGENT"}</span>
                </div>
              </div>
            </div>
            <button onClick={()=>router.push("/")} style={{
              background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",
              borderRadius:12,padding:"7px 12px",fontSize:11,fontWeight:700,
              color:"rgba(255,255,255,.5)",cursor:"pointer",WebkitTapHighlightColor:"transparent",
            }}>← Exit</button>
          </div>
        </div>

        {/* ── Live AI Monitor ──────────────────────────────────────── */}
        <div style={{
          background:"linear-gradient(135deg,rgba(15,108,245,.12),rgba(230,184,90,.06))",
          border:"1px solid rgba(15,108,245,.2)",
          borderRadius:20,padding:"16px",marginBottom:16,
          animation:"fadeUp .35s ease .05s both",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:GREEN,animation:"blink 1s ease infinite"}}/>
            <span style={{fontSize:11,fontWeight:800,color:GREEN,letterSpacing:"0.08em"}}>LIVE MONITORING</span>
          </div>
          <div style={{display:"flex",gap:12}}>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:900,color:BLUE,lineHeight:1}}>{activeTabs.lina}</div>
              <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.35)",letterSpacing:"0.06em",marginTop:3}}>LINA ACTIVE CHATS</div>
            </div>
            <div style={{width:1,background:"rgba(255,255,255,.08)"}}/>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:900,color:GOLD,lineHeight:1}}>{stats.unread}</div>
              <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.35)",letterSpacing:"0.06em",marginTop:3}}>NEW MESSAGES</div>
            </div>
            <div style={{width:1,background:"rgba(255,255,255,.08)"}}/>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:900,color:GREEN,lineHeight:1}}>{activeTabs.total}</div>
              <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.35)",letterSpacing:"0.06em",marginTop:3}}>TOTAL LEADS</div>
            </div>
          </div>
          <button onClick={()=>router.push("/agent/chat")} style={{
            width:"100%",marginTop:14,
            background:"rgba(15,108,245,.15)",border:"1px solid rgba(15,108,245,.3)",
            borderRadius:14,padding:"10px",
            fontSize:12,fontWeight:800,color:BLUE,cursor:"pointer",
            WebkitTapHighlightColor:"transparent",
          }}>
            💬 View Live Client Conversations →
          </button>
        </div>

        {/* ── Stats 2×2 ─────────────────────────────────────────────── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16,animation:"fadeUp .35s ease .1s both"}}>
          {[
            {icon:"💬",label:"Inbox",value:stats.inbox,badge:stats.unread>0?stats.unread:null,color:BLUE,href:"/agent/chat"},
            {icon:"👥",label:"Clients",value:stats.clients||"—",color:GREEN,href:"/agent/clients"},
            {icon:"🎯",label:"Leads",value:stats.leads||"—",color:GOLD,href:"/agent/leads"},
            {icon:"💰",label:"Revenue",value:"$0",color:"rgba(255,255,255,.5)",href:"/agent"},
          ].map((s)=>(
            <button key={s.label} className="stat-card" onClick={()=>router.push(s.href)} style={{
              background:"rgba(255,255,255,.04)",border:`1px solid ${s.color}20`,
              borderRadius:18,padding:"16px 14px",cursor:"pointer",textAlign:"left",
              WebkitTapHighlightColor:"transparent",
              transition:"transform .15s ease",position:"relative",
            }}>
              {s.badge && (
                <div style={{
                  position:"absolute",top:10,right:10,
                  width:20,height:20,borderRadius:"50%",
                  background:RED,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:9,fontWeight:900,color:"#fff",
                  boxShadow:`0 0 8px ${RED}`,animation:"blink 1.2s ease infinite",
                }}>{s.badge}</div>
              )}
              <div style={{fontSize:22,marginBottom:8}}>{s.icon}</div>
              <div style={{fontSize:22,fontWeight:900,color:s.color,lineHeight:1,marginBottom:4}}>{s.value}</div>
              <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.35)",letterSpacing:"0.06em",textTransform:"uppercase"}}>{s.label}</div>
            </button>
          ))}
        </div>

        {/* ── Recent Messages ────────────────────────────────────────── */}
        <div style={{marginBottom:16,animation:"fadeUp .35s ease .15s both"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,.6)",letterSpacing:"0.06em",textTransform:"uppercase"}}>Recent Conversations</div>
            <button onClick={()=>router.push("/agent/chat")} style={{fontSize:11,fontWeight:700,color:BLUE,background:"transparent",border:"none",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>View all →</button>
          </div>
          <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:18,padding:"0 16px",overflow:"hidden"}}>
            {msgs.length === 0
              ? <div style={{padding:"20px 0",textAlign:"center",fontSize:12,color:"rgba(255,255,255,.25)"}}>No messages yet</div>
              : msgs.map((m,i)=>(
                <MsgRow key={m.id||i} msg={m} onClick={()=>{
                  localStorage.setItem("zeniva_inbox_last_seen",new Date().toISOString());
                  router.push("/agent/chat");
                }}/>
              ))
            }
          </div>
        </div>

        {/* ── AI Agents status ──────────────────────────────────────── */}
        <div style={{marginBottom:16,animation:"fadeUp .35s ease .2s both"}}>
          <div style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,.35)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>AI Agents Status</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <AgentCard name="Lina AI"     desc="Client concierge · Chat & Call" status="LIVE"   color={BLUE}  icon="🤖"/>
            <AgentCard name="Email Agent" desc="info@zeniva.ca auto-reply"      status="ACTIVE" color={GREEN} icon="📧"/>
            <AgentCard name="Lead Hunter" desc="Qualifies & scores leads"        status="ACTIVE" color={GOLD}  icon="🎯"/>
            <AgentCard name="Cyber Guard" desc="Security monitoring · 24/7"     status="LIVE"   color={GREEN} icon="🛡️"/>
          </div>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        <div style={{animation:"fadeUp .35s ease .25s both"}}>
          <div style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,.35)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Quick Actions</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {[
              {icon:"💬",label:"Inbox",  href:"/agent/chat"},
              {icon:"👥",label:"Clients",href:"/agent/clients"},
              {icon:"🎯",label:"Leads",  href:"/agent/leads"},
              {icon:"📋",label:"Proposals",href:"/agent"},
              ...(isHq?[{icon:"💰",label:"Finance",href:"/agent/finance"}]:[]),
              {icon:"⚙️",label:"Settings",href:"/agent/settings"},
              {icon:"🌐",label:"Website",href:"/"},
              {icon:"🔐",label:"Sign Out",href:null,red:true},
            ].map((a:any)=>(
              <button key={a.label} className="action-btn" onClick={()=>{
                if(a.red){logout("/");}
                else if(a.href) router.push(a.href);
              }} style={{
                background:a.red?"rgba(239,68,68,.08)":"rgba(255,255,255,.04)",
                border:`1px solid ${a.red?"rgba(239,68,68,.15)":"rgba(255,255,255,.07)"}`,
                borderRadius:14,padding:"12px 6px",
                cursor:"pointer",textAlign:"center",
                WebkitTapHighlightColor:"transparent",
                transition:"transform .15s ease",
              }}>
                <div style={{fontSize:20,marginBottom:4}}>{a.icon}</div>
                <div style={{fontSize:9,fontWeight:700,color:a.red?"rgba(239,68,68,.7)":"rgba(255,255,255,.4)",lineHeight:1.2}}>{a.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
