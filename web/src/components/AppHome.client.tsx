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
  { id:1,  name:"Maldives",       slug:"maldives",       sub:"Overwater Villas · 7 nights",       badge:"✨ Popular",   img:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=75",        from:"From $3,200" },
  { id:2,  name:"Santorini",      slug:"santorini",      sub:"Luxury Suites · 5 nights",           badge:"🔥 Trending",  img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=75",        from:"From $2,800" },
  { id:3,  name:"Bali",           slug:"bali",           sub:"Private Villas · 10 nights",         badge:"🌿 Nature",    img:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=75",        from:"From $1,900" },
  { id:4,  name:"Dubai",          slug:"dubai",          sub:"Skyscraper Hotels · 5 nights",       badge:"💎 Luxury",    img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=75",        from:"From $2,400" },
  { id:5,  name:"Paris",          slug:"paris",          sub:"Grand Hotel · 4 nights",             badge:"🗼 Classic",   img:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=75",        from:"From $2,100" },
  { id:6,  name:"Tokyo",          slug:"tokyo",          sub:"Luxury Ryokan · 7 nights",           badge:"🇯🇵 Culture",  img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=75",        from:"From $2,900" },
  { id:7,  name:"Cancún",         slug:"cancun",         sub:"All-Inclusive · 7 nights",           badge:"🏖️ Beach",     img:"https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=600&q=75",        from:"From $1,200" },
  { id:8,  name:"Miami",          slug:"miami",          sub:"Ocean Drive · 4 nights",             badge:"🌴 Hot",       img:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75",        from:"From $1,800" },
  { id:9,  name:"Amalfi Coast",   slug:"amalfi-coast",   sub:"Clifftop Villas · 6 nights",        badge:"🍋 Italy",     img:"https://images.unsplash.com/photo-1633321088355-d338f27f6b40?w=600&q=75",        from:"From $2,400" },
  { id:10, name:"Bora Bora",      slug:"bora-bora",      sub:"Overwater Bungalows · 8 nights",    badge:"🌺 Paradise",  img:"https://images.unsplash.com/photo-1589979481223-deb893043163?w=600&q=75",        from:"From $4,500" },
  { id:11, name:"New York",       slug:"new-york",       sub:"5-Star Hotels · 4 nights",          badge:"🗽 City",      img:"https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=75",        from:"From $2,200" },
  { id:12, name:"Maui",           slug:"maui",           sub:"Beachfront Resorts · 6 nights",     badge:"🌊 Hawaii",    img:"https://images.unsplash.com/photo-1542259009477-d625272157b7?w=600&q=75",        from:"From $2,800" },
  { id:13, name:"Swiss Alps",     slug:"swiss-alps",     sub:"Mountain Chalets · 5 nights",       badge:"⛷️ Ski",       img:"https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=75",        from:"From $3,200" },
  { id:14, name:"Kenya Safari",   slug:"kenya-safari",   sub:"Tented Camps · 8 nights",           badge:"🦁 Wildlife",  img:"https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600&q=75",        from:"From $4,000" },
  { id:15, name:"Barcelona",      slug:"barcelona",      sub:"Boutique Hotels · 5 nights",        badge:"🎨 Culture",   img:"https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=75",        from:"From $1,800" },
  { id:16, name:"Kyoto",          slug:"kyoto",          sub:"Traditional Ryokan · 5 nights",     badge:"⛩️ Culture",   img:"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=75",        from:"From $2,400" },
  { id:17, name:"Phuket",         slug:"phuket",         sub:"Beach Resorts · 7 nights",          badge:"🌴 Beach",     img:"https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=75",        from:"From $1,400" },
  { id:18, name:"Cape Town",      slug:"cape-town",      sub:"Ocean Views · 6 nights",            badge:"🏔️ Scenic",    img:"https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=75",        from:"From $2,600" },
  { id:19, name:"Tuscany",        slug:"tuscany",        sub:"Vineyard Villas · 7 nights",        badge:"🍷 Romance",   img:"https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&q=75",        from:"From $2,200" },
  { id:20, name:"Iceland",        slug:"iceland",        sub:"Northern Lights · 5 nights",        badge:"🌌 Aurora",    img:"https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&q=75",        from:"From $3,000" },
  { id:21, name:"Mykonos",        slug:"mykonos",        sub:"Island Villas · 5 nights",          badge:"🌊 Greece",    img:"https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=600&q=75",        from:"From $2,800" },
  { id:22, name:"Rio de Janeiro", slug:"rio",            sub:"Ocean View Hotels · 5 nights",      badge:"🎉 Vibrant",   img:"https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=75",        from:"From $2,200" },
  { id:23, name:"Côte d'Azur",   slug:"cote-dazur",     sub:"Riviera Villas · 6 nights",         badge:"⛵ Luxury",    img:"https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=75",        from:"From $3,200" },
  { id:24, name:"Queenstown",     slug:"queenstown",     sub:"Adventure Lodge · 6 nights",        badge:"🪂 Adventure", img:"https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600&q=75",        from:"From $2,800" },
  { id:25, name:"Marrakech",      slug:"marrakech",      sub:"Luxury Riads · 5 nights",           badge:"🕌 Culture",   img:"https://images.unsplash.com/photo-1597212618440-806262de4f3b?w=600&q=75",        from:"From $1,600" },
  { id:26, name:"Seychelles",     slug:"seychelles",     sub:"Private Islands · 8 nights",        badge:"🏝️ Paradise",  img:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=75",        from:"From $4,200" },
  { id:27, name:"Costa Rica",     slug:"costa-rica",     sub:"Eco Lodges · 8 nights",             badge:"🦜 Nature",    img:"https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=75",        from:"From $2,000" },
  { id:28, name:"Tanzania",       slug:"tanzania",       sub:"Safari Camps · 10 nights",          badge:"🦒 Safari",    img:"https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600&q=75",        from:"From $4,500" },
  { id:29, name:"Lisbon",         slug:"lisbon",         sub:"Heritage Hotels · 4 nights",        badge:"🚋 Culture",   img:"https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=600&q=75",        from:"From $1,600" },
  { id:30, name:"Zanzibar",       slug:"zanzibar",       sub:"Spice Island · 7 nights",           badge:"🌊 Beach",     img:"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=75",        from:"From $2,200" },
];

const QUICK_CHIPS = [
  { emoji:"⛵", label:"ZeniYacht",   href:"/yachts" },
  { emoji:"🏨", label:"ZeniHotel",   href:"/partners/resorts" },
  { emoji:"🏡", label:"ZeniStay",    href:"/residences" },
  { emoji:"✈️", label:"ZeniFlights", href:"/search/flights" },
  { emoji:"🚗", label:"ZeniCar",     href:"/search/cars" },
  { emoji:"🚢", label:"ZeniCruise",  href:"/cruises" },
  { emoji:"🎯", label:"ZeniXP",      href:"/chat" },
  { emoji:"👥", label:"ZeniGroup",   href:"/collections/group" },
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
      minHeight:"100dvh", background:"#ffffff", color:"#0B1B4D", overflowX:"hidden",
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
                Zeniva <span style={{color:"#E6B85A"}}>Travel</span> ✈️
              </div>
              <div style={{fontSize:10,color:"rgba(11,27,77,.5)",fontWeight:600,letterSpacing:"0.04em"}}>
                {greeting}{firstName?`, ${firstName}`:""}
              </div>
            </div>
          </div>

          {/* Account button */}
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowMenu(v=>!v)} style={{
              width:40,height:40,borderRadius:"50%",
              background:"rgba(11,27,77,.06)",
              border:"1px solid rgba(11,27,77,.15)",
              display:"flex",alignItems:"center",justifyContent:"center",
              cursor:"pointer",WebkitTapHighlightColor:"transparent",
            }}>
              {authUser?.name
                ? <span style={{fontSize:15,fontWeight:900,color:"#0B1B4D"}}>{authUser.name[0].toUpperCase()}</span>
                : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(11,27,77,.5)" strokeWidth="2.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
                      <div style={{fontSize:10,color:"rgba(11,27,77,.5)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{authUser.email}</div>
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
            background:"rgba(11,27,77,.05)",
            border:"1px solid rgba(11,27,77,.12)",
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
                fontSize:14,color:"#0B1B4D",fontWeight:500,
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
            <button key={c.label} className="chip-btn" onClick={()=>go(c.href)} style={{
              flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4,
              background:"rgba(11,27,77,.05)",border:"1px solid rgba(11,27,77,.1)",
              borderRadius:16,padding:"10px 14px",cursor:"pointer",
              WebkitTapHighlightColor:"transparent",
              transition:"transform .15s ease",
            }}>
              <span style={{fontSize:22}}>{c.emoji}</span>
              <span style={{fontSize:10,fontWeight:700,color:"rgba(11,27,77,.75)",whiteSpace:"nowrap"}}>{c.label}</span>
            </button>
          ))}
        </div>

        {/* ── Featured Destinations ────────────────────────────────── */}
        <div style={{padding:"0 20px 6px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"rgba(11,27,77,.45)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>FEATURED</div>
              <div style={{fontSize:20,fontWeight:900,letterSpacing:"-0.02em"}}>Dream Destinations</div>
            </div>
            <button onClick={()=>go("/destinations")} style={{
              fontSize:12,fontWeight:700,color:"#E6B85A",background:"transparent",border:"none",cursor:"pointer",
              WebkitTapHighlightColor:"transparent",
            }}>View All →</button>
          </div>

          {/* Horizontal scroll cards */}
          <div style={{display:"flex",gap:14,overflowX:"auto",scrollbarWidth:"none",paddingBottom:4,marginLeft:-20,marginRight:-20,paddingLeft:20,paddingRight:20}}>
            {DESTINATIONS.map((d,i)=>(
              <button key={d.id} className="dest-card"
                onClick={()=>go(`/destinations/${d.slug}`)}
                style={{
                  flexShrink:0,width:200,borderRadius:22,overflow:"hidden",
                  background:"rgba(11,27,77,.04)",border:"1px solid rgba(11,27,77,.08)",
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
                  <div style={{fontSize:11,color:"rgba(11,27,77,.6)",fontWeight:600}}>{d.sub}</div>
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

        {/* ── Explore section ──────────────────────────────────────── */}
        <div style={{padding:"20px 20px 0"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"rgba(11,27,77,.45)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>EXPLORE</div>
              <div style={{fontSize:20,fontWeight:900,letterSpacing:"-0.02em"}}>Our Collections</div>
            </div>
          </div>

          {/* 3 big category cards */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* Yachts */}
            <button onClick={()=>go("/yachts")} style={{
              display:"flex",alignItems:"center",gap:16,
              background:"linear-gradient(135deg,rgba(15,108,245,.12) 0%,rgba(11,27,77,.4) 100%)",
              border:"1px solid rgba(15,108,245,.25)",
              borderRadius:20,padding:"16px 18px",
              cursor:"pointer",textAlign:"left",
              WebkitTapHighlightColor:"transparent",
            }}>
              <div style={{
                width:54,height:54,borderRadius:16,flexShrink:0,overflow:"hidden",
                border:"1.5px solid rgba(15,108,245,.3)",
              }}>
                <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&q=80" alt="Yachts" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:900,color:"#0B1B4D",marginBottom:3}}>⛵ Yacht Charters</div>
                <div style={{fontSize:12,color:"rgba(11,27,77,.6)"}}>Luxury yachts in Miami, Bahamas & more</div>
              </div>
              <div style={{fontSize:20,color:"rgba(11,27,77,.45)"}}>›</div>
            </button>

            {/* Luxury Resorts */}
            <button onClick={()=>go("/partners/resorts")} style={{
              display:"flex",alignItems:"center",gap:16,
              background:"linear-gradient(135deg,rgba(230,184,90,.1) 0%,rgba(11,27,77,.4) 100%)",
              border:"1px solid rgba(230,184,90,.2)",
              borderRadius:20,padding:"16px 18px",
              cursor:"pointer",textAlign:"left",
              WebkitTapHighlightColor:"transparent",
            }}>
              <div style={{
                width:54,height:54,borderRadius:16,flexShrink:0,overflow:"hidden",
                border:"1.5px solid rgba(230,184,90,.3)",
              }}>
                <img src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=200&q=80" alt="Resorts" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:900,color:"#0B1B4D",marginBottom:3}}>🏨 Luxury Resorts</div>
                <div style={{fontSize:12,color:"rgba(11,27,77,.6)"}}>5-star partner hotels & all-inclusive</div>
              </div>
              <div style={{fontSize:20,color:"rgba(11,27,77,.45)"}}>›</div>
            </button>

            {/* Villas & Residences */}
            <button onClick={()=>go("/residences")} style={{
              display:"flex",alignItems:"center",gap:16,
              background:"linear-gradient(135deg,rgba(16,185,129,.1) 0%,rgba(11,27,77,.4) 100%)",
              border:"1px solid rgba(16,185,129,.2)",
              borderRadius:20,padding:"16px 18px",
              cursor:"pointer",textAlign:"left",
              WebkitTapHighlightColor:"transparent",
            }}>
              <div style={{
                width:54,height:54,borderRadius:16,flexShrink:0,overflow:"hidden",
                border:"1.5px solid rgba(16,185,129,.3)",
              }}>
                <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&q=80" alt="Villas" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:900,color:"#0B1B4D",marginBottom:3}}>🏡 Villas & Residences</div>
                <div style={{fontSize:12,color:"rgba(11,27,77,.6)"}}>Private Florida villas, beach houses</div>
              </div>
              <div style={{fontSize:20,color:"rgba(11,27,77,.45)"}}>›</div>
            </button>
          </div>
        </div>

        {/* ── Quick links row ──────────────────────────────────────── */}
        <div style={{display:"flex",gap:10,padding:"16px 20px 8px"}}>
          {[
            {icon:"✈️",label:"My Trips",href:"/trips"},
            {icon:"💬",label:"Chat Lina",href:"/chat"},
            {icon:"👤",label:"Profile",href:"/profile"},
          ].map((item)=>(
            <button key={item.label} onClick={()=>go(item.href)} style={{
              flex:1,background:"rgba(11,27,77,.05)",
              border:"1px solid rgba(11,27,77,.1)",
              borderRadius:18,padding:"14px 8px",
              cursor:"pointer",textAlign:"center",
              WebkitTapHighlightColor:"transparent",
              transition:"transform .15s ease",
            }}>
              <div style={{fontSize:22,marginBottom:4}}>{item.icon}</div>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(11,27,77,.75)"}}>{item.label}</div>
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
              <div style={{fontSize:12,color:"rgba(11,27,77,.65)"}}>Real-time AI travel concierge · Video + Voice</div>
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
