"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { BRAND_BLUE, PREMIUM_BLUE, ACCENT_GOLD, LIGHT_BG, MUTED_TEXT, TITLE_TEXT } from "../../src/design/tokens";
import { useTripsStore, addMessage, updateSnapshot, updateTrip, applyTripPatch, generateProposal, mergeTripMessages, setTripTitle, createTrip } from "../../lib/store/tripsStore";
import { sendMessageToLina } from "../../src/lib/linaClient";
import Label from "../../src/components/Label";
import { useAuthStore } from "../../src/lib/authStore";
import { buildChatChannelId, fetchChatMessages, saveChatMessage } from "../../src/lib/chatPersistence";
const quickPrompts = ["Flights", "Hotels", "All-Inclusive", "Cruise", "Excursions"];

/**
 * Extract trip details from conversation and build a patch for Trip Snapshot.
 * Parses both user messages and Lina's summaries to auto-fill departure, destination, dates, etc.
 */
function extractTripInfoFromConversation(allMessages) {
  const patch = {};
  // Combine all text for scanning
  const fullText = allMessages.map((m) => m.content || "").join("\n");

  // Destination
  const destMatch = fullText.match(/(?:destination|going to|travel(?:ling)? to|trip to|voyage (?:à|au|en|aux))\s*[:=]?\s*([A-Za-zÀ-ÿ\s-]+)/i)
    || fullText.match(/•\s*Destination\s*[:=]?\s*([A-Za-zÀ-ÿ\s-]+)/i);
  if (destMatch) {
    const dest = destMatch[1].trim().replace(/\s+/g, " ").split(/[,\n•]/)[0].trim();
    if (dest.length >= 2 && dest.length <= 50) patch.destination = dest;
  }

  // Departure / origin
  const depMatch = fullText.match(/(?:departure|departing from|from|départ de|aéroport de départ|depar de)\s*[:=]?\s*([A-Za-zÀ-ÿ\s-]{2,30})/i)
    || fullText.match(/(?:je suis (?:à|a))\s+([A-Z]{3})\b/i)
    || fullText.match(/\b(YUL|YYZ|YVR|JFK|LAX|SFO|MIA|ORD|CDG|LHR)\b/i);
  if (depMatch) {
    const dep = depMatch[1].trim();
    if (dep.length >= 2) patch.departure = dep.toUpperCase().length === 3 ? dep.toUpperCase() : dep;
  }

  // Dates (check-in / check-out)
  const dateMatches = fullText.match(/\d{4}-\d{2}-\d{2}/g)
    || fullText.match(/\d{1,2}\s+(?:janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|december|january|february|march|april|may|june|july|august|september|october|november)\s*\d{0,4}/gi);
  if (dateMatches && dateMatches.length >= 1) {
    // Try to find "26 février" style and convert
    const isoDate = (s) => {
      if (/\d{4}-\d{2}-\d{2}/.test(s)) return s;
      return s; // keep as-is for display
    };
    patch.dates = dateMatches.length >= 2 ? `${isoDate(dateMatches[0])} → ${isoDate(dateMatches[1])}` : isoDate(dateMatches[0]);
  }
  // Also detect "X semaine(s)" or "X weeks" for duration
  const durationMatch = fullText.match(/(\d+)\s*semaine/i) || fullText.match(/(\d+)\s*week/i);
  const startDateMatch = fullText.match(/(\d{1,2})\s*(janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre)/i);
  if (durationMatch && startDateMatch && !patch.dates) {
    const months = { janvier: "01", février: "02", fevrier: "02", mars: "03", avril: "04", mai: "05", juin: "06", juillet: "07", août: "08", aout: "08", septembre: "09", octobre: "10", novembre: "11", décembre: "12" };
    const day = startDateMatch[1].padStart(2, "0");
    const month = months[startDateMatch[2].toLowerCase()] || "01";
    const year = new Date().getFullYear();
    const start = `${year}-${month}-${day}`;
    const weeks = parseInt(durationMatch[1]);
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + weeks * 7);
    const end = endDate.toISOString().slice(0, 10);
    patch.dates = `${start} → ${end}`;
  }

  // Travelers
  const travMatch = fullText.match(/(\d+)\s*(?:personne|person|adult|voyageur|traveler|pax)/i)
    || fullText.match(/(?:à|a)\s+(\d+)\b/i);
  if (travMatch) {
    const n = parseInt(travMatch[1]);
    if (n > 0 && n <= 20) patch.travelers = `${n} adults`;
  }

  // Budget
  const budgetMatch = fullText.match(/(?:budget|budg)\s*[:=]?\s*\$?\s*([\d,.\s]+)/i)
    || fullText.match(/([\d,]+)\s*(?:\$|CAD|USD|dollars?)/i)
    || fullText.match(/\$\s*([\d,]+)/i);
  if (budgetMatch) {
    const raw = budgetMatch[1].replace(/[,\s]/g, "");
    const n = parseFloat(raw);
    if (n > 0) patch.budget = `$${n.toLocaleString()} CAD`;
  }
  // Accommodation / hotel detection
  if (/hôtel|hotel|resort|résidence|yacht/i.test(fullText)) {
    if (/hôtel|hotel/i.test(fullText)) {
      patch.accommodationType = "Hotel";
    } else if (/resort/i.test(fullText)) {
      patch.accommodationType = "Resort";
    } else if (/résidence|residence|airbnb/i.test(fullText)) {
      patch.accommodationType = "Residence";
    } else if (/yacht/i.test(fullText)) {
      patch.accommodationType = "Yacht";
    }
  }

  // Transportation detection (flights vs other)
  if (/vol|flight|fly|flying|plane/i.test(fullText)) {
    patch.transportationType = "Flights";
  } else if (/no flights|pas de vol/i.test(fullText)) {
    patch.transportationType = "No Flights";
  }
  return Object.keys(patch).length > 0 ? patch : null;
}


function snapshotPatchFromTrip(trip) {
  if (!trip || typeof trip !== "object") return {};
  const patch = {};

  const origin = (trip.origin || "").toString().trim();
  const originName = (trip.originName || "").toString().trim();
  if (origin) {
    const label = originName && !originName.toUpperCase().startsWith(origin.toUpperCase())
      ? `${origin.toUpperCase()} - ${originName}`
      : origin.toUpperCase();
    patch.departure = label;
  }

  const destCode = (trip.destinationCode || "").toString().trim();
  const destName = (trip.destination || "").toString().trim();
  const destLabel = destCode
    ? `${destCode.toUpperCase()}${destName && !destName.toUpperCase().startsWith(destCode.toUpperCase()) ? ` - ${destName}` : ""}`
    : destName;
  if (destLabel) patch.destination = destLabel;

  const checkIn = (trip.checkIn || trip.departureDate || "").toString().trim();
  const checkOut = (trip.checkOut || trip.returnDate || "").toString().trim();
  if (checkIn && checkOut) patch.dates = `${checkIn} → ${checkOut}`;

  const adults = Number(trip.adults || trip.adultsCount || 0);
  const kidsAges = Array.isArray(trip.childrenAges) ? trip.childrenAges : [];
  const travelers = [];
  if (adults > 0) travelers.push(`${adults} adults`);
  if (kidsAges.length > 0) travelers.push(`${kidsAges.length} children (${kidsAges.join(", ")})`);
  if (travelers.length > 0) patch.travelers = travelers.join(" + ");

  if (trip.budget) patch.budget = String(trip.budget);
  if (trip.style || trip.accommodation) patch.style = String(trip.style || trip.accommodation);
  if (trip.accommodationType) patch.accommodationType = String(trip.accommodationType);
  if (trip.transportationType) patch.transportationType = String(trip.transportationType);

  return patch;
}

function createTripFromMergedTrip(mergedTrip, proposalSuffix = "") {
  if (typeof window === 'undefined') return;

  const destination = mergedTrip.destination || mergedTrip.destinationCode || 'New Trip';
  const departure = mergedTrip.origin || mergedTrip.departure || '';
  const dates = mergedTrip.checkIn && mergedTrip.checkOut ? `${mergedTrip.checkIn} → ${mergedTrip.checkOut}` : (mergedTrip.dates || '');
  const travelers = mergedTrip.adults ? `${mergedTrip.adults} adults` : (mergedTrip.travelers || '');

  // Use Zustand store actions (persists properly to localStorage)
  const newTripId = createTrip({
    title: destination,
    destination,
    departure,
    dates,
    travelers,
    budget: mergedTrip.budget || '',
    style: mergedTrip.style || mergedTrip.accommodation || '',
    status: 'Ready',
  });

  updateSnapshot(newTripId, {
    departure,
    destination,
    dates,
    checkIn: mergedTrip.checkIn || '',
    checkOut: mergedTrip.checkOut || '',
    adults: mergedTrip.adults || mergedTrip.adultsCount || 0,
    travelers,
    budget: mergedTrip.budget || '',
    style: mergedTrip.style || mergedTrip.accommodation || '',
    accommodationType: mergedTrip.accommodationType || '',
    transportationType: mergedTrip.transportationType || '',
  });

  applyTripPatch(newTripId, {
    departureCity: departure,
    destination,
    checkIn: mergedTrip.checkIn || '',
    checkOut: mergedTrip.checkOut || '',
    adults: mergedTrip.adults || mergedTrip.adultsCount || 2,
    budget: mergedTrip.budget || '',
    style: mergedTrip.style || mergedTrip.accommodation || '',
    accommodationType: mergedTrip.accommodationType || '',
    transportationType: mergedTrip.transportationType || '',
  });

  generateProposal(newTripId);

  // Redirect depending on style
  const styleLower = (mergedTrip.style || (mergedTrip.accommodation || '')).toString().toLowerCase();
  if (styleLower.includes('yacht') || styleLower.includes('boat') || styleLower.includes('charter')) {
    const params = new URLSearchParams({ destination: mergedTrip.destination || '', checkIn: mergedTrip.checkIn || '', checkOut: mergedTrip.checkOut || '', adults: String(mergedTrip.adults || '') });
    window.location.href = `/yachts?${params.toString()}`;
  } else {
    window.location.href = `/proposals/${newTripId}/select${proposalSuffix}`;
  }
}

function ChatThread({ tripId, proposalMode = "" }) {
  // Ajout : messages automatiques si infos manquantes
  const [promptedForHotelInfo, setPromptedForHotelInfo] = useState(false);
  const [promptedForStayType, setPromptedForStayType] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const { messages, snapshots, trips } = useTripsStore((s) => ({ messages: s.messages, snapshots: s.snapshots, trips: s.trips }));
  const user = useAuthStore((s) => s.user);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const history = useMemo(() => messages[tripId] || [], [messages, tripId]);
  const snapshot = snapshots[tripId] || {};
  const proposalSuffix = proposalMode ? `?mode=${encodeURIComponent(proposalMode)}` : "";
  const accountChannelId = useMemo(() => buildChatChannelId(user?.email, `trip-${tripId}`), [user?.email, tripId]);


  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [history]);

  useEffect(() => {
    if (!accountChannelId) return;
    let active = true;
    const load = async () => {
      const rows = await fetchChatMessages(accountChannelId);
      if (!active || !rows.length) return;
      const mapped = rows.map((row) => {
        const createdAt = row?.createdAt || row?.created_at || new Date().toISOString();
        const sender = row?.senderRole || row?.sender_role;
        const role = sender === "lina" || sender === "agent" || sender === "hq" ? "assistant" : "user";
        const content = String(row?.message || "").trim() || "Message";
        return { id: String(row?.id || createdAt), role, content, createdAt };
      });
      mergeTripMessages(tripId, mapped);
    };
    void load();
    return () => {
      active = false;
    };
  }, [accountChannelId, tripId]);

  // Removed hardcoded auto-prompts — Lina handles all conversation naturally

  useEffect(() => {
    if (!inputRef.current) return;
    const el = inputRef.current;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener?.("change", sync);
    return () => media.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    if (!userHasInteracted) return;
    if (
      snapshot.departure &&
      snapshot.destination &&
      snapshot.dates &&
      snapshot.travelers &&
      snapshot.budget &&
      snapshot.style
    ) {
      // Use Zustand store actions (which persist to localStorage properly)
      const newTripId = createTrip({
        title: snapshot.destination,
        destination: snapshot.destination,
        departure: snapshot.departure,
        dates: snapshot.dates,
        travelers: snapshot.travelers,
        budget: snapshot.budget,
        style: snapshot.style,
        status: "Ready",
      });

      // Copy full snapshot to new trip
      updateSnapshot(newTripId, { ...snapshot });

      // Build tripDraft from snapshot so the select page APIs can fire
      const draftPatch = {};
      if (snapshot.departure) draftPatch.departureCity = snapshot.departure.split(' - ')[0] || snapshot.departure;
      if (snapshot.destination) draftPatch.destination = snapshot.destination.split(' - ')[0] || snapshot.destination;
      if (snapshot.dates) {
        const parts = snapshot.dates.split(' → ');
        if (parts[0]) draftPatch.checkIn = parts[0].trim();
        if (parts[1]) draftPatch.checkOut = parts[1].trim();
      }
      if (snapshot.travelers) {
        const adultsMatch = snapshot.travelers.match(/(\d+)/);
        if (adultsMatch) draftPatch.adults = parseInt(adultsMatch[1]);
      }
      if (snapshot.budget) draftPatch.budget = snapshot.budget;
      if (snapshot.style) draftPatch.style = snapshot.style;
      if (snapshot.accommodationType) draftPatch.accommodationType = snapshot.accommodationType;
      if (snapshot.transportationType) draftPatch.transportationType = snapshot.transportationType;

      applyTripPatch(newTripId, draftPatch);
      generateProposal(newTripId);

      // Navigate to proposal selection page
      if (typeof window !== 'undefined') {
        window.location.href = `/proposals/${newTripId}/select${proposalSuffix}`;
      }
    }
  }, [userHasInteracted, snapshot.departure, snapshot.destination, snapshot.dates, snapshot.travelers, snapshot.budget, snapshot.style]);

  const handleSend = async (text) => {
    setUserHasInteracted(true);
    const trimmed = text.trim();
    if (!trimmed || !tripId) return;
    const conversation = [...history.map((m) => ({ role: m.role, text: m.content })), { role: "user", text: trimmed }];
    addMessage(tripId, "user", trimmed);
    if (accountChannelId) {
      await saveChatMessage({
        channelIds: [accountChannelId],
        message: trimmed,
        author: user?.name || user?.email || "Traveler",
        senderRole: "client",
        source: "traveler-chat",
        sourcePath: `/chat/${tripId}`,
        propertyName: snapshot.destination || "Trip",
      });
    }
    setInput("");
    setLoading(true);
    try {
      const { reply, tripPatch } = await sendMessageToLina(conversation);
      addMessage(tripId, "assistant", reply || "");
      if (accountChannelId && reply) {
        await saveChatMessage({
          channelIds: [accountChannelId],
          message: reply,
          author: "Lina",
          senderRole: "lina",
          source: "traveler-chat",
          sourcePath: `/chat/${tripId}`,
          propertyName: snapshot.destination || "Trip",
        });
      }
      if (tripPatch?.patch) {
        applyTripPatch(tripId, tripPatch.patch);
      }
      // Auto-extract trip info from full conversation and fill Trip Snapshot
      const allMsgs = [...history, { role: "user", content: trimmed }, { role: "assistant", content: reply || "" }];
      const extracted = extractTripInfoFromConversation(allMsgs);
      if (extracted) {
        applyTripPatch(tripId, extracted);
        // Auto-set trip title from destination
        if (extracted.destination) {
          const currentTrip = (trips || []).find((t) => t.id === tripId);
          const currentTitle = String(currentTrip?.title || "").trim();
          if (!currentTitle || currentTitle === "New Trip" || currentTitle === "Trip") {
            setTripTitle(tripId, extracted.destination);
          }
        }
      }
    } catch (e) {
      try {
        const fallbackHistory = history.slice(-20).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content || "",
        }));
        const resp = await fetch("/api/lina", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: trimmed, history: fallbackHistory }),
        });
        const data = await resp.json();
        const reply = String(data?.reply || "").trim();
        addMessage(tripId, "assistant", reply || "Sorry, Lina is unavailable right now.");
      } catch {
        addMessage(tripId, "assistant", "Sorry, Lina is unavailable right now.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend(input);
    }
  };

  // Speech Recognition (microphone)
  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "fr-CA"; // Default French-Canadian, adapts to user
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    let finalTranscript = "";
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }
      setInput((prev) => {
        // Replace interim text: keep what was there before mic started + new text
        const base = prev.replace(/\u200B.*$/, "").trimEnd();
        const display = finalTranscript + interim;
        return display || base;
      });
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        alert("Microphone access denied. Please allow microphone permission in your browser settings.");
      }
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript.trim()) {
        setInput(finalTranscript.trim());
      }
    };

    recognition.start();
    setIsListening(true);
    finalTranscript = "";
  };

  const onQuick = (label) => {
    const currentTrip = (trips || []).find((t) => t.id === tripId);
    const currentTitle = String(currentTrip?.title || "").trim();
    if (tripId && (!currentTitle || currentTitle === "New Trip" || currentTitle === "Trip")) {
      const destinationLabel = String(snapshot.destination || "").split(" - ").pop()?.trim() || "";
      const nextTitle = destinationLabel ? `${label} · ${destinationLabel}` : `${label} Trip`;
      setTripTitle(tripId, nextTitle);
    }

    // Special handling for Flights - check if we have required data
    if (label === "Flights") {
      const hasOrigin = snapshot.departure || snapshot.origin;
      const hasDestination = snapshot.destination;
      const hasDates = snapshot.dates;

      if (!hasOrigin || !hasDestination || !hasDates) {
        const missing = [];
        if (!hasOrigin) missing.push("origin");
        if (!hasDestination) missing.push("destination");
        if (!hasDates) missing.push("dates");

        const message = `Missing ${missing.join("/")}. Please provide your departure city, destination, and travel dates first.`;
        addMessage(tripId, "assistant", message);
        return;
      }

      // If we have all required data, redirect to flights search
      const [departDate] = (snapshot.dates || "").split(" → ");
      const originCode = (snapshot.departure || "").split(" - ")[0] || snapshot.origin || "";
      const destCode = (snapshot.destination || "").split(" - ")[0] || "";

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams({
          from: originCode.toUpperCase(),
          to: destCode.toUpperCase(),
          depart: departDate,
          passengers: (snapshot.travelers || "2").split(" ")[0],
          cabin: "Economy"
        });
        window.location.href = `/search/flights?${params.toString()}`;
      }
      return;
    }

    // Special handling for Hotels - check if we have required data
    if (label === "Hotels") {
      const hasDestination = snapshot.destination;
      const hasDates = snapshot.dates;

      if (!hasDestination || !hasDates) {
        const missing = [];
        if (!hasDestination) missing.push("destination");
        if (!hasDates) missing.push("dates");

        const message = `Missing ${missing.join("/")}. Please provide your destination and stay dates first.`;
        addMessage(tripId, "assistant", message);
        return;
      }

      // If we have required data, redirect to hotels search
      const [checkIn, checkOut] = (snapshot.dates || "").split(" → ");
      const destName = (snapshot.destination || "").split(" - ")[1] || snapshot.destination || "";

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams({
          destination: destName,
          checkIn: checkIn || "",
          checkOut: checkOut || "",
          guests: (snapshot.travelers || "2").split(" ")[0],
          rooms: "1"
        });
        window.location.href = `/search/hotels?${params.toString()}`;
      }
      return;
    }

    // Default behavior for other quick prompts
    const base = input ? `${input} ${label}` : `Plan ${label.toLowerCase()} options`;
    setInput(base);
    handleSend(base);
  };

  return (
    <div className={`flex flex-col overflow-hidden ${isMobile ? "rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(11,27,77,0.12)] min-h-[65vh] h-[calc(100dvh-9rem)]" : "rounded-2xl border border-slate-200 bg-white shadow-sm min-h-[60vh] md:min-h-[72vh] lg:min-h-0 lg:h-full"}`}>
      {isMobile ? (
        <div
          className="px-4 py-4 border-b border-white/15"
          style={{
            background: `linear-gradient(110deg, ${PREMIUM_BLUE} 0%, ${BRAND_BLUE} 72%)`,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-11 w-11 rounded-full border border-white/40 p-0.5 bg-white/10">
                <img src="/branding/lina-avatar.png" alt="Lina" className="h-full w-full rounded-full object-cover" />
              </div>
              <div className="min-w-0">
                <Label className="text-white/85">Lina Concierge</Label>
                <div className="text-lg font-extrabold text-white truncate">AI Travel Assistant</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-semibold text-white/85">Live</div>
              <div className="text-[11px] font-semibold" style={{ color: ACCENT_GOLD }}>
                Premium mode
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <Label>Assistant</Label>
            <div className="text-xl font-extrabold" style={{ color: TITLE_TEXT }}>
              AI Travel Assistant
            </div>
          </div>
          <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
            Travel planning • live
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className={`flex-1 overflow-y-scroll space-y-3 ${isMobile ? "px-4 py-4" : "px-5 py-4"}`}
        style={{ backgroundColor: LIGHT_BG, scrollbarGutter: "stable" }}
      >
        {history.length === 0 && (
          <div className={`${isMobile ? "rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm" : "rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm"}`} style={{ color: MUTED_TEXT }}>
            {isMobile && <div className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: BRAND_BLUE }}>Start fast</div>}
            <div className={`${isMobile ? "mt-2" : ""} text-sm font-semibold`} style={{ color: TITLE_TEXT }}>Suggested prompts</div>
            <div className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${isMobile ? "mt-3" : "mt-2"}`}>
              {[
                "Plan a 7-day family trip from NYC to Paris in June under $8k",
                "Find business class flights from SFO to Tokyo next month",
                "Design a Maldives honeymoon with villas and excursions",
              ].map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className={`rounded-xl border border-slate-200 px-3 py-2 text-left text-xs hover:border-slate-300 ${isMobile ? "bg-slate-50/70 hover:bg-white" : "bg-white"}`}
                  style={{ color: TITLE_TEXT }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((m) => (
          isMobile ? (
            <div key={m.id} className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[90%] rounded-2xl p-3 shadow-sm border ${m.role === "assistant" ? "bg-white border-slate-200" : "border-transparent"}`}
                style={m.role === "assistant" ? undefined : { backgroundColor: BRAND_BLUE }}
              >
                <div className="text-[11px] font-semibold" style={{ color: m.role === "assistant" ? MUTED_TEXT : "rgba(255,255,255,0.82)" }}>
                  {m.role === "assistant" ? "Lina AI" : "You"}
                </div>
                <div className="mt-1 whitespace-pre-line text-sm font-semibold" style={{ color: m.role === "assistant" ? TITLE_TEXT : "#ffffff" }}>
                  {m.content}
                </div>
              </div>
            </div>
          ) : (
            <div
              key={m.id}
              className={`rounded-xl p-3 shadow-sm ${m.role === "assistant" ? "bg-white border border-slate-100" : "bg-[#EEF5FF]"}`}
            >
              <div className="text-[11px] font-semibold" style={{ color: MUTED_TEXT }}>
                {m.role === "assistant" ? "AI Assistant" : "You"}
              </div>
              <div className="mt-1 whitespace-pre-line text-sm font-semibold" style={{ color: m.role === "assistant" ? TITLE_TEXT : BRAND_BLUE }}>
                {m.content}
              </div>
            </div>
          )
        ))}

        {isMobile && loading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="text-[11px] font-semibold" style={{ color: MUTED_TEXT }}>Lina AI</div>
              <div className="mt-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>Typing…</div>
            </div>
          </div>
        )}
      </div>

      <div className={`space-y-3 ${isMobile ? "border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.9rem)]" : "border-t border-slate-100 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.9rem)]"}`}>
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>Write your message</div>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = `/call/${tripId}`;
              }
            }}
            className="flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-all"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            Talk to Lina
          </button>
        </div>
        <form onSubmit={onSubmit} className={`flex items-end ${isMobile ? "gap-2" : "gap-3"}`}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Describe your trip—AI assistant plans flights, stays, and experiences"
            rows={2}
            className={`flex-1 min-w-0 w-full resize-none rounded-2xl px-4 py-3 text-sm font-semibold outline-none ${isMobile ? "border border-slate-300 bg-white focus:border-slate-400" : "border border-slate-200 focus:border-slate-300"}`}
            style={{ maxHeight: "200px" }}
          />
          <button
            type="button"
            onClick={toggleMic}
            title={isListening ? "Stop recording" : "Voice input"}
            className={`rounded-2xl px-3 py-3 text-sm font-extrabold transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              {isListening ? (
                <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4ZM6 11a1 1 0 1 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z"/>
              ) : (
                <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4ZM6 11a1 1 0 1 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z"/>
              )}
            </svg>
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`rounded-2xl px-4 py-3 text-sm font-extrabold text-white ${isMobile ? "min-w-[86px]" : ""}`}
            style={isMobile ? { backgroundColor: loading ? "#6b7280" : BRAND_BLUE, opacity: loading ? 0.9 : 1 } : { backgroundColor: BRAND_BLUE, opacity: loading ? 0.8 : 1 }}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((qp) => (
            <button
              key={qp}
              onClick={() => onQuick(qp)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${isMobile ? "transition" : "hover:border-slate-300"}`}
              style={isMobile ? {
                color: qp === "Flights" || qp === "Hotels" ? "#fff" : TITLE_TEXT,
                backgroundColor: qp === "Flights" || qp === "Hotels" ? PREMIUM_BLUE : "#fff",
                borderColor: qp === "Flights" || qp === "Hotels" ? PREMIUM_BLUE : "#e2e8f0",
              } : { color: TITLE_TEXT }}
            >
              {qp}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChatThread;
