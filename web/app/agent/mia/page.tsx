"use client";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../../src/lib/authStore";

interface Message { id: string; role: "user" | "mia"; text: string; time: string; }

const QUICK_ACTIONS = [
  { label: "Generate posts", icon: "✨", prompt: "Generate 5 travel posts for today" },
  { label: "Review queue", icon: "👁️", prompt: "Show me posts waiting for approval" },
  { label: "Instagram analytics", icon: "📸", prompt: "Show Instagram performance this week" },
  { label: "TikTok ideas", icon: "🎵", prompt: "Suggest TikTok video concepts for this week" },
  { label: "Content calendar", icon: "📅", prompt: "Show me the content calendar for this week" },
  { label: "Trending hashtags", icon: "#️⃣", prompt: "What are the trending travel hashtags right now?" },
];

export default function MiaPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "mia", text: "Hi! I'm Mia, your Social Media Manager. I create stunning travel posts with AI-generated captions for Instagram, TikTok, and Facebook. Everything goes through your approval before posting. What should we create today?", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((p) => [...p, { id: Date.now().toString(), role: "user", text: text.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setInput(""); setTyping(true);
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1000));
    setTyping(false);
    setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "mia", text: genMia(text), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/20">
      <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/30">
              <img src="/agents/mia.png" alt="Mia" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1"><h1 className="text-lg font-bold">Mia</h1><p className="text-purple-100 text-xs">Social Media Manager · AI Content Creator</p></div>
          <div className="bg-white/15 rounded-xl px-3 py-1.5 text-xs font-medium border border-white/20"><span className="inline-block w-2 h-2 bg-amber-400 rounded-full mr-1.5" />Idle</div>
        </div>
        <div className="px-6 pb-3 flex gap-4 text-xs">
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Posts Today: 0/5</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Pending Approval: 3</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">This Week: 12 posts</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Engagement: +18%</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[70%]">
              {msg.role === "mia" && <div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold text-purple-600">Mia</span><span className="text-[10px] text-slate-400">{msg.time}</span></div>}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md" : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"}`}>{msg.text}</div>
              {msg.role === "user" && <div className="text-right mt-1"><span className="text-[10px] text-slate-400">{msg.time}</span></div>}
            </div>
          </div>
        ))}
        {typing && <div className="flex justify-start"><div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm"><div className="flex gap-1.5"><span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} /><span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} /></div></div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="flex-shrink-0 px-6 py-2 border-t border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_ACTIONS.map((a) => (<button key={a.label} onClick={() => send(a.prompt)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all"><span>{a.icon}</span>{a.label}</button>))}
        </div>
      </div>
      <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message Mia..." className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50" />
          <button type="submit" disabled={!input.trim() || typing} className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-sm shadow-lg disabled:opacity-50">Send</button>
        </form>
      </div>
    </div>
  );
}

function genMia(input: string): string {
  const l = input.toLowerCase();
  if (l.includes("generate") || l.includes("create") || l.includes("post")) return "Here are 5 posts I've drafted for today:\n\n1. Instagram Carousel: \"Top 5 Hidden Beaches in Greece\" — 8 slides with AI visuals\n2. Instagram Reel: \"Pack with me for Riviera Maya\" — 15sec video concept\n3. Facebook Post: \"Early bird Europe 2026 — Save 15%\" with booking CTA\n4. TikTok: \"POV: Your travel agent found you a deal\" — trending audio\n5. Instagram Story: Client testimonial + destination highlight\n\nAll ready for your review in the approval queue!";
  if (l.includes("approval") || l.includes("review") || l.includes("queue")) return "Posts waiting for your approval:\n\n1. \"Sunset in Santorini\" carousel (Instagram) — Scheduled: Tomorrow 10am\n2. \"Cuba All-Inclusive from $899\" promo (Facebook) — Scheduled: Today 6pm\n3. \"Why use a travel agent in 2026?\" (TikTok) — Scheduled: Wednesday\n\nApprove, edit, or reject each one. Reply with the post number to review it!";
  if (l.includes("instagram") || l.includes("analytics") || l.includes("performance")) return "Instagram Performance (This Week):\n\n- Reach: 12,847 (+18% vs last week)\n- Engagement rate: 4.2% (industry avg: 1.8%)\n- Profile visits: 342\n- Website clicks: 89\n- New followers: +47\n- Best post: \"Greece group trip\" carousel (1,247 likes)\n\nTop performing content type: Carousels (3x more engagement than single images)";
  if (l.includes("tiktok") || l.includes("video")) return "TikTok Video Concepts for This Week:\n\n1. \"Things your travel agent wishes you knew\" — storytelling trend\n2. \"$899 Cuba vs $2499 Greece — which would you pick?\" — poll format\n3. \"How I saved my client $1,200 on their honeymoon\" — value content\n4. \"Day in the life of a travel agent\" — BTS content\n5. \"Travel hack: Why booking through an agent saves money\" — educational\n\nTrending audios I'd recommend using are queued. Want me to create storyboards?";
  if (l.includes("calendar") || l.includes("schedule")) return "Content Calendar — This Week:\n\nMon: Instagram carousel + Facebook promo\nTue: TikTok video + Instagram story\nWed: Instagram reel + Facebook engagement post\nThu: TikTok + Instagram story poll\nFri: Instagram carousel + Facebook weekend promo\nSat: Instagram story highlights\nSun: Content prep for next week\n\n15 posts total planned. 3 awaiting approval, 12 in draft.";
  if (l.includes("hashtag") || l.includes("trending")) return "Trending Travel Hashtags Right Now:\n\n#TravelDeals2026 — 45K posts this week\n#AllInclusive — Always strong\n#HoneymoonGoals — Wedding season peak\n#CaribbeanVibes — +23% this month\n#GroupTravel — Trending up\n#TravelAgent — Community building\n#Wanderlust — Evergreen\n\nI recommend mixing 5 trending + 5 niche + 5 branded hashtags per post.";
  return "I'm ready to create! I can generate posts, review the approval queue, check analytics, plan content calendars, or suggest trending ideas. Just tell me what you need!";
}
