"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, isAgent, logout } from "../lib/authStore";

// ─── Floating particle orb ─────────────────────────────────────────────────
function Orb({ x, y, size, color, delay }: { x:number;y:number;size:number;color:string;delay:number }) {
  return (
    <div style={{
      position:"absolute", left:`${x}%`, top:`${y}%`,
      width:size, height:size, borderRadius:"50%",
      background:color, filter:"blur(70px)", opacity:0.18,
      animation:`orbF ${4+delay}s ease-in-out ${delay}s infinite alternate`,
      pointerEvents:"none",
    }} />
  );
}

// ─── Featured destination card ─────────────────────────────────────────────
const DESTINATIONS = [
  { id:1, name:"Maldives", sub:"Overwater Villas · 7 nights", badge:"✨ Popular", img:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=75", from:"From $3,200" },
  { id:2, name:"Santorini", sub:"Luxury Suites · 5 nights", badge:"🔥 Trending", img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=75", from:"From $2,800" },
  { id:3, name:"Bali", sub:"Private Villas · 10 nights", badge:"🌿 Nature", img:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=75", from:"From $1,900" },
  { id:4, name:"Miami Yachts", sub:"Luxury Charter · 1 day", badge:"⛵ New", img:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=75", from:"From $800" },
  { id:5, name:"Paris", sub:"Grand Hotel · 4 nights", badge:"🗼 Classic", img:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=75", from:"From $2,100" },
];

const QUICK_CHIPS = [
  { emoji:"🏖️", label:"Beach",   q:"Plan a luxury beach vacation" },
  { emoji:"⛵", label:"Yacht",   q:"Charter a private yacht in Miami" },
  { emoji:"🗼", label:"Europe",  q:"Luxury trip to Europe" },
  { emoji:"🌴", label:"Resort",  q:"All-inclusive luxury resort" },
  { emoji:"💍", label:"Honeymoon", q:"Perfect honeymoon package" },
  { emoji:"🎿", label:"Ski",     q:"Luxury ski vacation" },
  { emoji:"🚢", label:"Cruise",  q:"Luxury cruise experience" },
  { emoji:"🌺", label:"Tropical", q:"Tropical escape with Lina" },
];

export default function AppHome() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Good morning");
  const [chatInput, setChatInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [activeCard, setActiveCard] = useState<number|null>(null);

  useEffect(() => {
    setMounted(true);
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);

  const firstName = mounted && authUser?.name ? authUser.name.split(" ")[0] : "";
  const userIsAgent = mounted && authUser ? isAgent(authUser) : false;

  const go = (url: string) => { setShowMenu(false); router.push(url); };
  const chat = (q: string) => { if (q.trim()) router.push(`/chat?q=${encodeURIComponent(q.trim())}`); };

  return (
    <div style={{
      minHeight:"100dvh", background:"#030812", color:"#fff", overflowX:"hidden",
      fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      paddingTop:"env(safe-area-inset-top)",
      paddingBottom:"calc(88px + env(safe-area-inset-bottom))",
    }}>
      <style>{`
        @keyframes orbF { 0%{transform:translateY(0) scale(1);} 100%{transform:translateY(-35px) scale(1.12);} }
        @keyframes linaF { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
        @keyframes ring { 0%{transform:scale(1);opacity:.7;} 100%{transform:scale(1.8);opacity:0;} }
        @keyframes shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:.3;} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        @keyframes slideX { from{opacity:0;transform:translateX(20px);} to{opacity:1;transform:translateX(0);} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(15,108,245,.3),0 8px 32px rgba(0,0,0,.4);} 50%{box-shadow:0 0 40px rgba(15,108,245,.6),0 8px 40px rgba(0,0,0,.5);} }
        .chip-btn:active{transform:scale(.9)!important;}
        .dest-card:active{transform:scale(.96)!important;}
        .cta-btn:active{transform:scale(.97)!important;}
      `}</style>

      {/* ── Ambient orbs ──────────────────────────────────────────── */}
      <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
        <Orb x={-15} y={0}  size={340} color="rgba(15,108,245,1)"    delay={0}   />
        <Orb x={65}  y={55} size={280} color="rgba(11,27,77,1)"      delay={1.5} />
        <Orb x={80}  y={5}  size={220} color="rgba(15,108,245,.7)"   delay={0.8} />
        <Orb x={30}  y={75} size={200} color="rgba(230,184,90,.5)"   delay={2.2} />
      </div>

      <div style={{position:"relative",zIndex:1}}>

        {/* ── Top bar ──────────────────────────────────────────────── */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px 12px"}}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img
              src="/branding/lina-avatar.png"
              alt="Zeniva"
              style={{width:34,height:34,borderRadius:"50%",border:"2px solid rgba(230,184,90,.35)",objectFit:"cover"}}
            />
            <div>
              <div style={{fontSize:15,fontWeight:900,letterSpacing:"-0.02em",lineHeight:1}}>
                Zeniva<span style={{color:"#E6B85A"}}>✈</span>
              </div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.35)",fontWeight:600,letterSpacing:"0.04em"}}>
                {greeting}{firstName?`, ${firstName}`:""}
              </div>
            </div>
          </div>

          {/* Account button */}
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowMenu(v=>!v)} style={{
              width:40,height:40,borderRadius:"50%",
              background:"rgba(255,255,255,.06)",
              border:"1px solid rgba(255,255,255,.1)",
              display:"flex",alignItems:"center",justifyContent:"center",
              cursor:"pointer",WebkitTapHighlightColor:"transparent",
            }}>
              {authUser?.name
                ? <span style={{fontSize:15,fontWeight:900,color:"#fff"}}>{authUser.name[0].toUpperCase()}</span>
                : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              }
            </button>

            {/* Dropdown */}
            {showMenu && (
              <>
                <div onClick={()=>setShowMenu(false)} style={{position:"fixed",inset:0,zIndex:998}} />
                <div style={{
                  position:"absolute",top:48,right:0,zIndex:999,
                  background:"rgba(8,18,45,.97)",backdropFilter:"blur(24px)",
                  border:"1px solid rgba(255,255,255,.1)",
                  borderRadius:18,padding:"8px",minWidth:210,
                  boxShadow:"0 24px 80px rgba(0,0,0,.7)",
                  animation:"fadeUp .2s ease both",
                }}>
                  {authUser && (
                    <div style={{padding:"10px 12px 8px",borderBottom:"1px solid rgba(255,255,255,.07)",marginBottom:4}}>
                      <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>{authUser.name||"Traveler"}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.35)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{authUser.email}</div>
                    </div>
                  )}
                  {[
                    {icon:"👤",label:"My Account",href:"/profile"},
                    {icon:"✈️",label:"My Trips",href:"/trips"},
                    ...(userIsAgent?[{icon:"⚡",label:"Agent Mode",href:"/agent",gold:true}]:[]),
                    {icon:authUser?"🔐":"🔑",label:authUser?"Sign Out":"Sign In",href:authUser?null:"/login",red:!!authUser},
                  ].map((item:any)=>(
                    <button key={item.label} onClick={()=>{
                      if(item.red){logout("/");}
                      else if(item.href) go(item.href);
                    }} style={{
                      display:"flex",alignItems:"center",gap:10,width:"100%",
                      background:item.gold?"rgba(230,184,90,.08)":"transparent",
                      border:item.gold?"1px solid rgba(230,184,90,.2)":"none",
                      borderRadius:12,padding:"11px 12px",cursor:"pointer",textAlign:"left",
                      WebkitTapHighlightColor:"transparent",marginBottom:2,
                    }}>
                      <span style={{fontSize:17}}>{item.icon}</span>
                      <span style={{fontSize:13,fontWeight:700,color:item.red?"#ef4444":item.gold?"#E6B85A":"#fff"}}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Lina Hero ────────────────────────────────────────────── */}
        <div style={{textAlign:"center",padding:"8px 20px 20px",animation:"fadeUp .5s ease both"}}>
          {/* Rings + Avatar */}
          <div style={{position:"relative",width:140,height:140,margin:"0 auto 16px",animation:"linaF 4s ease-in-out infinite"}}>
            {[1.4,1.7,2.1].map((s,i)=>(
              <div key={i} style={{
                position:"absolute",inset:0,borderRadius:"50%",
                border:"1.5px solid rgba(15,108,245,.25)",
                transform:`scale(${s})`,
                animation:`ring ${2.4+i*0.7}s ease-out ${i*0.5}s infinite`,
              }}/>
            ))}
            <img src="/branding/lina-avatar.png" alt="Lina" style={{
              width:140,height:140,borderRadius:"50%",objectFit:"cover",
              border:"3px solid rgba(230,184,90,.4)",
              boxShadow:"0 0 50px rgba(15,108,245,.5),0 0 100px rgba(15,108,245,.2)",
              position:"relative",zIndex:1,
            }}/>
          </div>

          {/* Title shimmer */}
          <div style={{
            fontSize:28,fontWeight:900,letterSpacing:"-0.03em",marginBottom:6,
            background:"linear-gradient(90deg,#fff 0%,#E6B85A 40%,#0F6CF5 70%,#fff 100%)",
            backgroundSize:"200% auto",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            animation:"shimmer 3s linear infinite",
          }}>Lina AI ✈️</div>

          {/* Status badge */}
          <div style={{
            display:"inline-flex",alignItems:"center",gap:6,
            background:"rgba(16,185,129,.12)",border:"1px solid rgba(16,185,129,.25)",
            borderRadius:999,padding:"4px 14px",marginBottom:20,
          }}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#10B981",animation:"blink 1.4s ease infinite"}}/>
            <span style={{fontSize:10,fontWeight:800,color:"#10B981",letterSpacing:"0.08em"}}>LINA IS ONLINE</span>
          </div>

          {/* Dual CTA */}
          <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:20}}>
            <button className="cta-btn" onClick={()=>go("/call")} style={{
              flex:1,maxWidth:160,
              background:"linear-gradient(135deg,#0F3A8A,#1a56cc)",
              border:"none",borderRadius:18,padding:"15px 0",
              fontSize:15,fontWeight:900,color:"#fff",cursor:"pointer",
              WebkitTapHighlightColor:"transparent",
              animation:"glow 2.5s ease-in-out infinite",
              display:"flex",alignItems:"center",justifyContent:"center",gap:6,
            }}>📞 Call Lina</button>
            <button className="cta-btn" onClick={()=>go("/chat")} style={{
              flex:1,maxWidth:160,
              background:"linear-gradient(135deg,#E6B85A,#c9941f)",
              border:"none",borderRadius:18,padding:"15px 0",
              fontSize:15,fontWeight:900,color:"#0B1B4D",cursor:"pointer",
              WebkitTapHighlightColor:"transparent",
              display:"flex",alignItems:"center",justifyContent:"center",gap:6,
            }}>💬 Chat</button>
          </div>

          {/* Chat input */}
          <div style={{
            display:"flex",gap:8,
            background:"rgba(255,255,255,.06)",
            border:"1px solid rgba(255,255,255,.1)",
            borderRadius:20,padding:"10px 10px 10px 16px",
            maxWidth:420,margin:"0 auto",
          }}>
            <input
              value={chatInput}
              onChange={(e)=>setChatInput(e.target.value)}
              onKeyDown={(e)=>{if(e.key==="Enter")chat(chatInput);}}
              placeholder="Where do you want to go?"
              style={{
                flex:1,background:"transparent",border:"none",outline:"none",
                fontSize:14,color:"#fff",fontWeight:500,
              }}
            />
            <button onClick={()=>chat(chatInput)} style={{
              background:"linear-gradient(135deg,#0F6CF5,#0948CC)",
              border:"none",borderRadius:14,padding:"10px 16px",
              fontSize:13,fontWeight:800,color:"#fff",cursor:"pointer",
              WebkitTapHighlightColor:"transparent",flexShrink:0,
            }}>Go ✈️</button>
          </div>
        </div>

        {/* ── Quick chips ──────────────────────────────────────────── */}
        <div style={{
          display:"flex",gap:8,overflowX:"auto",padding:"0 20px 20px",
          scrollbarWidth:"none",
        }}>
          {QUICK_CHIPS.map((c)=>(
            <button key={c.label} className="chip-btn" onClick={()=>chat(c.q)} style={{
              flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4,
              background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",
              borderRadius:16,padding:"10px 14px",cursor:"pointer",
              WebkitTapHighlightColor:"transparent",
              transition:"transform .15s ease",
            }}>
              <span style={{fontSize:22}}>{c.emoji}</span>
              <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.6)",whiteSpace:"nowrap"}}>{c.label}</span>
            </button>
          ))}
        </div>

        {/* ── Featured Destinations ────────────────────────────────── */}
        <div style={{padding:"0 20px 6px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,.3)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>FEATURED</div>
              <div style={{fontSize:20,fontWeight:900,letterSpacing:"-0.02em"}}>Dream Destinations</div>
            </div>
            <button onClick={()=>go("/chat?q=Show me featured destinations")} style={{
              fontSize:12,fontWeight:700,color:"#E6B85A",background:"transparent",border:"none",cursor:"pointer",
              WebkitTapHighlightColor:"transparent",
            }}>See all →</button>
          </div>

          {/* Horizontal scroll cards */}
          <div style={{display:"flex",gap:14,overflowX:"auto",scrollbarWidth:"none",paddingBottom:4,marginLeft:-20,marginRight:-20,paddingLeft:20,paddingRight:20}}>
            {DESTINATIONS.map((d,i)=>(
              <button key={d.id} className="dest-card"
                onClick={()=>chat(`Plan a trip to ${d.name}: ${d.sub}`)}
                style={{
                  flexShrink:0,width:200,borderRadius:22,overflow:"hidden",
                  background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",
                  cursor:"pointer",textAlign:"left",padding:0,
                  WebkitTapHighlightColor:"transparent",
                  transition:"transform .15s ease",
                  animation:`slideX .4s ease ${i*0.07}s both`,
                }}>
                {/* Image */}
                <div style={{position:"relative",height:130,overflow:"hidden"}}>
                  <img src={d.img} alt={d.name} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/>
                  {/* Gradient overlay */}
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 40%,rgba(3,8,18,.8))"}}/>
                  {/* Badge */}
                  <div style={{
                    position:"absolute",top:10,left:10,
                    background:"rgba(3,8,18,.7)",backdropFilter:"blur(8px)",
                    borderRadius:999,padding:"3px 10px",
                    fontSize:9,fontWeight:800,color:"#E6B85A",letterSpacing:"0.04em",
                  }}>{d.badge}</div>
                  {/* Price */}
                  <div style={{
                    position:"absolute",bottom:10,left:10,right:10,
                    display:"flex",justifyContent:"space-between",alignItems:"flex-end",
                  }}>
                    <div style={{fontSize:16,fontWeight:900,color:"#fff",textShadow:"0 1px 8px rgba(0,0,0,.5)"}}>{d.name}</div>
                    <div style={{fontSize:10,fontWeight:700,color:"#E6B85A",background:"rgba(0,0,0,.5)",borderRadius:8,padding:"2px 6px"}}>{d.from}</div>
                  </div>
                </div>
                {/* Sub */}
                <div style={{padding:"10px 12px 12px"}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.45)",fontWeight:600}}>{d.sub}</div>
                  <div style={{
                    marginTop:8,display:"flex",alignItems:"center",justifyContent:"space-between",
                  }}>
                    <span style={{fontSize:11,fontWeight:800,color:"#0F6CF5"}}>Plan with Lina →</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Quick links row ──────────────────────────────────────── */}
        <div style={{display:"flex",gap:10,padding:"20px 20px 8px"}}>
          {[
            {icon:"🛥️",label:"Yachts",href:"/yachts"},
            {icon:"🏡",label:"Villas",href:"/residences"},
            {icon:"✈️",label:"My Trips",href:"/trips"},
          ].map((item)=>(
            <button key={item.label} onClick={()=>go(item.href)} style={{
              flex:1,background:"rgba(255,255,255,.05)",
              border:"1px solid rgba(255,255,255,.08)",
              borderRadius:18,padding:"14px 8px",
              cursor:"pointer",textAlign:"center",
              WebkitTapHighlightColor:"transparent",
              transition:"transform .15s ease",
            }}>
              <div style={{fontSize:22,marginBottom:4}}>{item.icon}</div>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.6)"}}>{item.label}</div>
            </button>
          ))}
        </div>

        {/* ── Call Lina banner ─────────────────────────────────────── */}
        <div style={{margin:"16px 20px 0"}}>
          <button onClick={()=>go("/call")} style={{
            width:"100%",
            background:"linear-gradient(135deg,#0B1B4D 0%,#0F3A8A 50%,#1a56cc 100%)",
            border:"1px solid rgba(15,108,245,.3)",
            borderRadius:22,padding:"18px 20px",
            display:"flex",alignItems:"center",gap:14,
            cursor:"pointer",textAlign:"left",
            WebkitTapHighlightColor:"transparent",
            boxShadow:"0 8px 40px rgba(15,108,245,.25)",
          }}>
            <img src="/branding/lina-avatar.png" style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(230,184,90,.4)",flexShrink:0}} alt="Lina"/>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:900,color:"#fff",marginBottom:3}}>Talk to Lina live</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>Real-time AI travel concierge · Video + Voice</div>
            </div>
            <div style={{
              background:"rgba(255,255,255,.1)",borderRadius:14,padding:"8px 14px",
              fontSize:12,fontWeight:800,color:"#fff",flexShrink:0,
            }}>📞 Call</div>
          </button>
        </div>
      </div>
    </div>
  );
}
