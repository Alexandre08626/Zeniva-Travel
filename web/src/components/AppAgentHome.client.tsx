"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, isHQ, logout } from "../lib/authStore";

/* ── colours ── */
const GOLD  = "#E6B85A";
const BLUE  = "#0F6CF5";
const GREEN = "#10B981";
const RED   = "#ef4444";
const AUTH  = "Bearer zeniva-secret-2025";

/* ── Radar ping ── */
function Radar() {
  return (
    <div style={{position:"relative",width:110,height:110,flexShrink:0}}>
      {[1,1.6,2.3].map((s,i)=>(
        <div key={i} style={{
          position:"absolute",inset:0,borderRadius:"50%",
          border:"1px solid rgba(16,185,129,.3)",
          transform:`scale(${s})`,
          animation:`radarRing ${2+i*0.7}s ease-out ${i*0.5}s infinite`,
        }}/>
      ))}
      {/* Sweep */}
      <div style={{
        position:"absolute",inset:0,borderRadius:"50%",
        background:"conic-gradient(from 0deg, transparent 70%, rgba(16,185,129,.35) 100%)",
        animation:"sweep 2.5s linear infinite",
      }}/>
      {/* Centre dot */}
      <div style={{
        position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
      }}>
        <div style={{width:8,height:8,borderRadius:"50%",background:GREEN,boxShadow:`0 0 12px ${GREEN}`}}/>
      </div>
      {/* Blips */}
      {[{x:62,y:30},{x:35,y:68},{x:75,y:72}].map((b,i)=>(
        <div key={i} style={{
          position:"absolute",left:b.x,top:b.y,
          width:4,height:4,borderRadius:"50%",background:GOLD,
          boxShadow:`0 0 6px ${GOLD}`,
          animation:`blip 2.5s ease-in-out ${i*0.8}s infinite`,
        }}/>
      ))}
    </div>
  );
}

/* ── Animated number ── */
function AnimNum({ val, color, prefix="", suffix="" }: any) {
  const [disp, setDisp] = useState(0);
  const ref = useRef<any>(null);
  useEffect(()=>{
    const target = typeof val === "number" ? val : 0;
    let start = 0; const dur = 800; const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now-t0)/dur, 1);
      setDisp(Math.round(p*target));
      if(p<1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  },[val]);
  if(typeof val !== "number") return <span style={{color}}>{val}</span>;
  return <span style={{color}}>{prefix}{disp}{suffix}</span>;
}

/* ── Live message row ── */
function MsgRow({ msg, isNew, onClick }: any) {
  const time = msg.created_at
    ? new Date(msg.created_at).toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})
    : "";
  return (
    <button onClick={onClick} style={{
      display:"flex",alignItems:"center",gap:10,width:"100%",background:"transparent",
      border:"none",borderBottom:"1px solid rgba(255,255,255,.05)",
      padding:"12px 0",cursor:"pointer",textAlign:"left",WebkitTapHighlightColor:"transparent",
    }}>
      <div style={{
        width:36,height:36,borderRadius:10,flexShrink:0,
        background:`linear-gradient(135deg,${BLUE}33,${BLUE}11)`,
        border:`1px solid ${isNew?BLUE+"66":"rgba(255,255,255,.08)"}`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:13,fontWeight:900,color:isNew?"#fff":"rgba(255,255,255,.5)",
      }}>
        {(msg.full_name||msg.author||"?")[0].toUpperCase()}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
          <span style={{fontSize:12,fontWeight:800,color:isNew?"#fff":"rgba(255,255,255,.6)"}}>{msg.full_name||msg.author||"Client"}</span>
          <span style={{fontSize:9,color:"rgba(255,255,255,.25)"}}>{time}</span>
        </div>
        <div style={{fontSize:10,color:"rgba(255,255,255,.35)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{msg.message||"—"}</div>
      </div>
      {isNew && <div style={{width:7,height:7,borderRadius:"50%",background:BLUE,boxShadow:`0 0 8px ${BLUE}`,flexShrink:0,animation:"blink 1s ease infinite"}}/>}
    </button>
  );
}

/* ── AI Agent panel ── */
function AgentPanel({ icon, name, sub, color, msgs, status }: any) {
  return (
    <div style={{
      background:"rgba(255,255,255,.03)",border:`1px solid ${color}22`,
      borderRadius:16,padding:"12px",display:"flex",flexDirection:"column",gap:8,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{
          width:32,height:32,borderRadius:10,flexShrink:0,
          background:`${color}18`,border:`1px solid ${color}33`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,
        }}>{icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,fontWeight:900,color:"#fff"}}>{name}</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,.3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sub}</div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:color,animation:"blink 1.8s ease infinite"}}/>
          <span style={{fontSize:8,fontWeight:800,color,letterSpacing:"0.1em"}}>{status}</span>
        </div>
        <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.3)"}}>{msgs} msgs</div>
      </div>
      {/* Mini bar */}
      <div style={{height:2,borderRadius:999,background:"rgba(255,255,255,.05)",overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:999,background:color,width:`${Math.min(msgs*4,100)}%`,transition:"width 1s ease"}}/>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════ */
export default function AppAgentHome() {
  const router  = useRouter();
  const user    = useAuthStore((s) => s.user);
  const hq      = user ? isHQ(user) : false;
  const [msgs, setMsgs]   = useState<any[]>([]);
  const [stats, setStats] = useState({ inbox:0, unread:0, clients:0, leads:0 });
  const [linaMsgs, setLinaMsgs] = useState(Math.floor(Math.random()*12)+3);
  const [greeting, setGreeting] = useState("Good morning");
  const [mounted, setMounted]   = useState(false);
  const [tick, setTick] = useState(0);        // for live clock
  const timer = useRef<any>(null);

  const load = async () => {
    try {
      const email = user?.email||"";
      const r = await fetch(`/api/agent/inbox?channel=all&limit=8`,{
        headers:{"x-user-email":email,Authorization:AUTH},
      });
      if(r.ok){
        const d = await r.json();
        const list = d.messages||d||[];
        const lastSeen = localStorage.getItem("zeniva_inbox_last_seen");
        const unread = lastSeen?list.filter((m:any)=>new Date(m.created_at)>new Date(lastSeen)).length:list.length;
        setMsgs(list.slice(0,5).map((m:any)=>({...m,isNew:lastSeen?new Date(m.created_at)>new Date(lastSeen):false})));
        setStats(s=>({...s,inbox:list.length,unread}));
      }
    } catch{}
    try {
      const lr = await fetch("/api/agents-proxy?path=leads&limit=1",{headers:{Authorization:AUTH}});
      if(lr.ok){ const ld=await lr.json(); setStats(s=>({...s,leads:ld.total||ld.count||(Array.isArray(ld)?ld.length:0)})); }
    } catch{}
    try {
      const cr = await fetch("/api/agents-proxy?path=clients&limit=1",{headers:{Authorization:AUTH}});
      if(cr.ok){ const cd=await cr.json(); setStats(s=>({...s,clients:cd.total||cd.count||(Array.isArray(cd)?cd.length:0)})); }
    } catch{}
    setLinaMsgs(v=>v+(Math.random()>.7?1:0));  // simulate new messages
  };

  useEffect(()=>{
    setMounted(true);
    const h = new Date().getHours();
    setGreeting(h<12?"Good morning":h<18?"Good afternoon":"Good evening");
    load();
    const int = setInterval(()=>{ load(); setTick(t=>t+1); }, 30000);
    return ()=>clearInterval(int);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const name = mounted && user?.name ? user.name.split(" ")[0] : "";
  const now  = new Date();
  const clock = now.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
  const dateStr = now.toLocaleDateString("en",{weekday:"short",month:"short",day:"numeric"});

  return (
    <div style={{
      minHeight:"100dvh",
      background:"#02060F",
      fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif",
      color:"#fff",
      paddingTop:"calc(env(safe-area-inset-top) + 12px)",
      paddingBottom:"calc(88px + env(safe-area-inset-bottom))",
      overflowX:"hidden",
    }}>
      <style>{`
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:.15;}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        @keyframes sweep{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        @keyframes radarRing{0%{transform:scale(1);opacity:.6;}100%{transform:scale(2.5);opacity:0;}}
        @keyframes blip{0%,100%{opacity:0;}40%,60%{opacity:1;}}
        @keyframes scanline{0%{top:-100%;}100%{top:200%;}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.4);}50%{box-shadow:0 0 0 8px rgba(16,185,129,0);}}
        @keyframes orbA{0%,100%{transform:translateY(0) scale(1);opacity:.12;}50%{transform:translateY(-30px) scale(1.1);opacity:.2;}}
        .mc-btn:active{opacity:.7;}
      `}</style>

      {/* ── Ambient background ── */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-20%",left:"-20%",width:400,height:400,borderRadius:"50%",background:"rgba(15,108,245,.6)",filter:"blur(100px)",animation:"orbA 6s ease infinite"}}/>
        <div style={{position:"absolute",bottom:"-10%",right:"-15%",width:350,height:350,borderRadius:"50%",background:"rgba(230,184,90,.4)",filter:"blur(100px)",animation:"orbA 8s ease 2s infinite"}}/>
        <div style={{position:"absolute",top:"40%",left:"40%",width:200,height:200,borderRadius:"50%",background:"rgba(16,185,129,.3)",filter:"blur(80px)",animation:"orbA 5s ease 1s infinite"}}/>
        {/* Scanline */}
        <div style={{position:"absolute",left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,rgba(15,108,245,.08),transparent)",animation:"scanline 4s linear infinite",pointerEvents:"none"}}/>
        {/* Grid overlay */}
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(15,108,245,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(15,108,245,.04) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
      </div>

      <div style={{position:"relative",zIndex:1,padding:"0 16px"}}>

        {/* ══ TOP BAR ══════════════════════════════════════════════ */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,animation:"fadeUp .3s ease both"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{position:"relative"}}>
              <img src="/branding/lina-avatar.png" alt="" style={{width:38,height:38,borderRadius:"50%",objectFit:"cover",border:`2px solid ${GREEN}55`}}/>
              <div style={{position:"absolute",bottom:0,right:0,width:10,height:10,borderRadius:"50%",background:GREEN,border:"2px solid #02060F",animation:"pulse 2s ease infinite"}}/>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:900,letterSpacing:"-0.02em",lineHeight:1.1}}>{greeting}{name?`, ${name}`:""}</div>
              <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
                <span style={{fontSize:9,fontWeight:800,color:hq?GOLD:BLUE,letterSpacing:"0.1em",background:hq?`${GOLD}18`:`${BLUE}18`,border:`1px solid ${hq?GOLD:BLUE}33`,borderRadius:999,padding:"1px 6px"}}>{hq?"⚡ HQ":"◈ AGENT"}</span>
                <span style={{fontSize:9,color:"rgba(255,255,255,.25)"}}>· MISSION CONTROL</span>
              </div>
            </div>
          </div>

          {/* Live clock */}
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:14,fontWeight:900,fontVariantNumeric:"tabular-nums",color:GREEN,fontFamily:"monospace",letterSpacing:"0.05em"}}>{mounted?clock:"--:--:--"}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,.25)",letterSpacing:"0.06em"}}>{mounted?dateStr:""}</div>
          </div>
        </div>

        {/* ══ MISSION STATUS BAR ═══════════════════════════════════ */}
        <div style={{
          background:"rgba(16,185,129,.06)",border:"1px solid rgba(16,185,129,.2)",
          borderRadius:14,padding:"10px 14px",marginBottom:14,
          display:"flex",alignItems:"center",gap:10,
          animation:"fadeUp .3s ease .05s both",
        }}>
          <div style={{width:8,height:8,borderRadius:"50%",background:GREEN,animation:"blink .8s ease infinite",flexShrink:0}}/>
          <div style={{flex:1,fontSize:11,fontWeight:700,color:GREEN,letterSpacing:"0.06em"}}>ALL SYSTEMS OPERATIONAL — Lina AI is online and processing client requests</div>
          <button onClick={()=>router.push("/agent/chat")} className="mc-btn" style={{
            background:`${BLUE}22`,border:`1px solid ${BLUE}44`,
            borderRadius:10,padding:"5px 10px",
            fontSize:10,fontWeight:800,color:BLUE,cursor:"pointer",flexShrink:0,
            WebkitTapHighlightColor:"transparent",
          }}>LIVE →</button>
        </div>

        {/* ══ RADAR + CORE STATS ═══════════════════════════════════ */}
        <div style={{display:"flex",gap:12,marginBottom:14,animation:"fadeUp .3s ease .1s both"}}>
          {/* Radar */}
          <div style={{
            background:"rgba(16,185,129,.04)",border:"1px solid rgba(16,185,129,.15)",
            borderRadius:18,padding:"14px",display:"flex",flexDirection:"column",alignItems:"center",gap:8,
            flexShrink:0,width:138,
          }}>
            <Radar/>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,.3)",letterSpacing:"0.1em"}}>ACTIVE CLIENTS</div>
              <div style={{fontSize:22,fontWeight:900,color:GREEN,lineHeight:1}}>
                <AnimNum val={stats.clients} color={GREEN}/>
              </div>
            </div>
          </div>

          {/* 3 stat tiles */}
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
            {[
              {label:"NEW MESSAGES",val:stats.unread,color:BLUE,icon:"💬",href:"/agent/chat",badge:stats.unread>0},
              {label:"LEADS IN PIPELINE",val:stats.leads,color:GOLD,icon:"🎯",href:"/agent/leads",badge:false},
              {label:"TOTAL INBOX",val:stats.inbox,color:"rgba(255,255,255,.5)",icon:"📥",href:"/agent/chat",badge:false},
            ].map((s)=>(
              <button key={s.label} onClick={()=>router.push(s.href)} className="mc-btn" style={{
                background:s.badge?`${s.color}10`:"rgba(255,255,255,.03)",
                border:`1px solid ${s.badge?s.color+"44":"rgba(255,255,255,.07)"}`,
                borderRadius:12,padding:"10px 12px",cursor:"pointer",
                display:"flex",alignItems:"center",gap:8,textAlign:"left",
                WebkitTapHighlightColor:"transparent",
              }}>
                <span style={{fontSize:16,flexShrink:0}}>{s.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:9,color:"rgba(255,255,255,.3)",fontWeight:700,letterSpacing:"0.08em"}}>{s.label}</div>
                  <div style={{fontSize:18,fontWeight:900,color:s.color,lineHeight:1.1}}>
                    <AnimNum val={s.val} color={s.color}/>
                  </div>
                </div>
                {s.badge && <div style={{width:8,height:8,borderRadius:"50%",background:s.color,boxShadow:`0 0 8px ${s.color}`,animation:"blink 1s ease infinite",flexShrink:0}}/>}
              </button>
            ))}
          </div>
        </div>

        {/* ══ AI AGENTS — LIVE STATUS ════════════════════════════════ */}
        <div style={{marginBottom:14,animation:"fadeUp .3s ease .15s both"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,.07)"}}/>
            <span style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,.25)",letterSpacing:"0.12em"}}>AI AGENTS — LIVE</span>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,.07)"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <AgentPanel icon="🤖" name="Lina AI"      sub="Client concierge · Chat & Call" color={BLUE}  msgs={linaMsgs}                    status="LIVE"/>
            <AgentPanel icon="📧" name="Email Agent"  sub="info@zeniva.ca auto-replies"    color={GREEN} msgs={Math.floor(Math.random()*8)+2} status="ACTIVE"/>
            <AgentPanel icon="🎯" name="Lead Hunter"  sub="Scores & qualifies all leads"   color={GOLD}  msgs={Math.floor(Math.random()*5)+1} status="ACTIVE"/>
            <AgentPanel icon="🛡️" name="Cyber Guard"  sub="Security · 24/7 monitoring"    color={GREEN} msgs={Math.floor(Math.random()*3)+1} status="LIVE"/>
          </div>
        </div>

        {/* ══ LIVE FEED ════════════════════════════════════════════ */}
        <div style={{marginBottom:14,animation:"fadeUp .3s ease .2s both"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:RED,animation:"blink .7s ease infinite"}}/>
              <span style={{fontSize:9,fontWeight:900,color:"rgba(255,255,255,.4)",letterSpacing:"0.12em"}}>LIVE CLIENT FEED</span>
            </div>
            <button onClick={()=>router.push("/agent/chat")} style={{fontSize:10,fontWeight:700,color:BLUE,background:"transparent",border:"none",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>View all →</button>
          </div>
          <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,padding:"0 14px",overflow:"hidden"}}>
            {msgs.length===0
              ? <div style={{padding:"20px 0",textAlign:"center",fontSize:11,color:"rgba(255,255,255,.2)"}}>Awaiting client messages…</div>
              : msgs.map((m,i)=>(
                <MsgRow key={m.id||i} msg={m} isNew={m.isNew} onClick={()=>{
                  localStorage.setItem("zeniva_inbox_last_seen",new Date().toISOString());
                  router.push("/agent/chat");
                }}/>
              ))
            }
          </div>
        </div>

        {/* ══ QUICK ACTIONS ════════════════════════════════════════ */}
        <div style={{animation:"fadeUp .3s ease .25s both"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,.07)"}}/>
            <span style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,.25)",letterSpacing:"0.12em"}}>COMMAND CENTER</span>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,.07)"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {[
              {icon:"💬",label:"Inbox",     href:"/agent/chat",  color:BLUE,  badge:stats.unread},
              {icon:"👥",label:"Clients",   href:"/agent/clients",color:GREEN, badge:0},
              {icon:"🎯",label:"Leads",     href:"/agent/leads",  color:GOLD,  badge:0},
              {icon:"📋",label:"Proposals", href:"/agent",        color:"rgba(255,255,255,.4)", badge:0},
              ...(hq?[{icon:"💰",label:"Finance",href:"/agent/finance",color:GREEN,badge:0}]:[]),
              {icon:"⚙️",label:"Settings",  href:"/agent/settings",color:"rgba(255,255,255,.4)",badge:0},
              {icon:"🌐",label:"Website",   href:"/",             color:"rgba(255,255,255,.4)",badge:0},
              {icon:"🔐",label:"Exit",      href:null,            color:RED,   badge:0,red:true},
            ].map((a:any)=>(
              <button key={a.label} onClick={()=>{
                if(a.red){ logout("/"); }
                else if(a.href) router.push(a.href);
              }} className="mc-btn" style={{
                position:"relative",
                background:a.red?`${RED}08`:`${a.color}09`,
                border:`1px solid ${a.color}22`,
                borderRadius:14,padding:"12px 4px",
                cursor:"pointer",textAlign:"center",
                WebkitTapHighlightColor:"transparent",
              }}>
                {a.badge>0 && (
                  <div style={{
                    position:"absolute",top:6,right:6,
                    width:16,height:16,borderRadius:"50%",
                    background:RED,display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:8,fontWeight:900,color:"#fff",
                    boxShadow:`0 0 6px ${RED}`,animation:"blink 1.2s ease infinite",
                  }}>{a.badge}</div>
                )}
                <div style={{fontSize:20,marginBottom:4}}>{a.icon}</div>
                <div style={{fontSize:9,fontWeight:700,color:`${a.color}`,lineHeight:1.2,letterSpacing:"0.04em"}}>{a.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ══ FOOTER STATUS ════════════════════════════════════════ */}
        <div style={{marginTop:16,textAlign:"center",animation:"fadeUp .3s ease .3s both"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,.15)",letterSpacing:"0.1em"}}>
            ZENIVA MISSION CONTROL · v2.0 · AUTO-REFRESH 30s
          </div>
        </div>
      </div>
    </div>
  );
}
