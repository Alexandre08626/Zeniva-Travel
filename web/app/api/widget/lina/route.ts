import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const partner = req.nextUrl.searchParams.get("partner") || "";
  if (!partner) return new NextResponse("// Missing partner", { status: 400, headers: { "Content-Type": "application/javascript" } });
  const { client } = getSupabaseAdminClient();
  const { data: agency } = await client.from("agencies").select("id, name, primary_color, secondary_color, logo_url, config").eq("slug", partner).eq("is_active", true).single();
  if (!agency) return new NextResponse("// Not found", { status: 404, headers: { "Content-Type": "application/javascript" } });
  const cfg = (agency.config || {}) as Record<string, unknown>;
  const branding = (cfg.branding || {}) as Record<string, unknown>;
  const greeting = (cfg.lina_greeting as string) || "Hello! How can I help you plan your trip?";
  const pos = (branding.widget_position as string) || "bottom-right";
  const badge = branding.show_zeniva_badge !== false;
  const apiBase = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zenivatravel.com";
  const widgetCfg = JSON.stringify({ agencyId: agency.id, agencyName: agency.name, primaryColor: agency.primary_color || "#0f766e", secondaryColor: agency.secondary_color || "#f0fdfa", greeting, position: pos, showBadge: badge, badgeText: "Powered by Zeniva", apiBase });
  // Generate self-executing widget script with Shadow DOM
  const script = generateWidgetScript(widgetCfg);
  return new NextResponse(script, { status: 200, headers: { "Content-Type": "application/javascript", "Cache-Control": "public, max-age=300", "Access-Control-Allow-Origin": "*" } });
}

function generateWidgetScript(cfgJson: string): string {
  return `(function(){
"use strict";
if(window.__zenivaWidgetLoaded)return;
window.__zenivaWidgetLoaded=true;
var C=${cfgJson};
var host=document.createElement("div");
host.id="zeniva-widget-host";
document.body.appendChild(host);
var shadow=host.attachShadow({mode:"open"});

// Styles
var style=document.createElement("style");
var posCSS=C.position==="bottom-left"?"left:20px":"right:20px";
style.textContent=[
  "*{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,sans-serif}",
  ".zw-btn{position:fixed;"+posCSS+";bottom:20px;width:60px;height:60px;border-radius:50%;background:"+C.primaryColor+";color:#fff;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.25);z-index:2147483647;display:flex;align-items:center;justify-content:center;transition:transform .2s}",
  ".zw-btn:hover{transform:scale(1.1)}",
  ".zw-btn svg{width:28px;height:28px}",
  ".zw-panel{position:fixed;"+posCSS+";bottom:90px;width:380px;max-width:calc(100vw - 40px);height:520px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.18);z-index:2147483647;display:flex;flex-direction:column;overflow:hidden;transition:opacity .25s,transform .25s}",
  ".zw-panel.hidden{opacity:0;transform:translateY(20px);pointer-events:none}",
  ".zw-hdr{background:"+C.primaryColor+";color:#fff;padding:16px;display:flex;align-items:center;gap:12px}",
  ".zw-hdr h3{font-size:15px;font-weight:600;margin:0}",
  ".zw-hdr p{font-size:12px;opacity:.85;margin:0}",
  ".zw-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}",
  ".zw-msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.45;word-wrap:break-word}",
  ".zw-bot{background:#f0f2f5;color:#1a1a1a;align-self:flex-start;border-bottom-left-radius:4px}",
  ".zw-usr{background:"+C.primaryColor+";color:#fff;align-self:flex-end;border-bottom-right-radius:4px}",
  ".zw-inp-area{padding:12px;border-top:1px solid #eee;display:flex;gap:8px}",
  ".zw-inp{flex:1;border:1px solid #ddd;border-radius:24px;padding:10px 16px;font-size:14px;outline:none;resize:none;max-height:80px}",
  ".zw-send{width:40px;height:40px;border-radius:50%;border:none;background:"+C.primaryColor+";color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center}",
  ".zw-send:disabled{opacity:.4}",
  ".zw-badge{text-align:center;padding:6px;font-size:11px;color:#999;border-top:1px solid #f0f0f0}",
  ".zw-badge a{color:#666;text-decoration:none}",
  "@media(max-width:480px){.zw-panel{width:100%;height:100%;max-width:100%;max-height:100%;bottom:0;left:0;right:0;border-radius:0}}"
].join("");
shadow.appendChild(style);

// Button
var btn=document.createElement("button");
btn.className="zw-btn";
btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

// Panel
var panel=document.createElement("div");
panel.className="zw-panel hidden";

var hdr=document.createElement("div");
hdr.className="zw-hdr";
hdr.innerHTML="<div><h3>Lina</h3><p>"+C.agencyName+"</p></div>";

var msgs=document.createElement("div");
msgs.className="zw-msgs";

var inpArea=document.createElement("div");
inpArea.className="zw-inp-area";

var inp=document.createElement("textarea");
inp.className="zw-inp";
inp.placeholder="Your message...";
inp.rows=1;

var sendBtn=document.createElement("button");
sendBtn.className="zw-send";
sendBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>';

inpArea.appendChild(inp);
inpArea.appendChild(sendBtn);
panel.appendChild(hdr);
panel.appendChild(msgs);
panel.appendChild(inpArea);

if(C.showBadge){
  var badge=document.createElement("div");
  badge.className="zw-badge";
  badge.innerHTML='<a href="https://www.zenivatravel.com" target="_blank" rel="noopener">'+C.badgeText+"</a>";
  panel.appendChild(badge);
}

shadow.appendChild(btn);
shadow.appendChild(panel);

var isOpen=false,history=[],busy=false;

function toggle(){
  isOpen=!isOpen;
  panel.classList.toggle("hidden",!isOpen);
  if(isOpen&&msgs.children.length===0)addMsg("bot",C.greeting);
}
btn.onclick=toggle;

function addMsg(role,text){
  var div=document.createElement("div");
  div.className="zw-msg "+(role==="bot"?"zw-bot":"zw-usr");
  div.textContent=text;
  msgs.appendChild(div);
  msgs.scrollTop=msgs.scrollHeight;
}

async function send(){
  var text=inp.value.trim();
  if(!text||busy)return;
  busy=true;
  sendBtn.disabled=true;
  inp.value="";
  addMsg("user",text);
  history.push({role:"user",content:text});
  try{
    var resp=await fetch(C.apiBase+"/api/lina",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-agency-id":C.agencyId},
      body:JSON.stringify({prompt:text,history:history.slice(-20),mode:"client"})
    });
    var data=await resp.json();
    var reply=data.reply||"Sorry, something went wrong.";
    addMsg("bot",reply);
    history.push({role:"assistant",content:reply});
  }catch(e){
    addMsg("bot","Connection error. Please try again.");
  }
  busy=false;
  sendBtn.disabled=false;
  inp.focus();
}

sendBtn.onclick=send;
inp.onkeydown=function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}};
})();`;
}
