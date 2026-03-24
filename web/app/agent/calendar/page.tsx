"use client";
import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "../../../src/lib/authStore";
import { useRequireAnyPermission } from "../../../src/lib/roleGuards";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Phone,
  Video,
  Users,
  Plane,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  MoreVertical,
  X
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday, parseISO, addHours, startOfDay } from "date-fns";

// Types d'événements
type EventType = "call" | "meeting" | "deadline" | "trip" | "client-visit" | "follow-up";

interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: Date;
  startTime?: string;
  endTime?: string;
  client?: string;
  location?: string;
  description?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  color: string;
}

const EVENT_TYPES = [
  { value: "call", label: "Call", icon: Phone, color: "#0F6CF5" },
  { value: "meeting", label: "Meeting", icon: Video, color: "#8B5CF6" },
  { value: "deadline", label: "Deadline", icon: AlertCircle, color: "#EF4444" },
  { value: "trip", label: "Trip", icon: Plane, color: "#2DBE60" },
  { value: "client-visit", label: "Client Visit", icon: Users, color: "#E6B85A" },
  { value: "follow-up", label: "Follow-up", icon: Clock, color: "#F59E0B" },
];

// Mock data - À remplacer par fetch API
const generateMockEvents = (): CalendarEvent[] => {
  const today = new Date();
  return [
    {
      id: "1",
      title: "Call with Sarah Johnson",
      type: "call",
      date: today,
      startTime: "10:00",
      endTime: "10:30",
      client: "Sarah Johnson",
      status: "confirmed",
      color: "#0F6CF5",
      description: "Discuss Maldives package options"
    },
    {
      id: "2",
      title: "Proposal Deadline - Dubai Package",
      type: "deadline",
      date: addHours(today, 5),
      startTime: "15:00",
      client: "Michael Chen",
      status: "pending",
      color: "#EF4444",
      description: "Submit final proposal for luxury Dubai experience"
    },
    {
      id: "3",
      title: "Team Meeting - Q2 Strategy",
      type: "meeting",
      date: addHours(today, 26),
      startTime: "14:00",
      endTime: "15:30",
      location: "Zoom",
      status: "confirmed",
      color: "#8B5CF6"
    },
    {
      id: "4",
      title: "Client Visit - Emma Wilson",
      type: "client-visit",
      date: addHours(today, 48),
      startTime: "11:00",
      endTime: "12:00",
      client: "Emma Wilson",
      location: "Zeniva Office",
      status: "confirmed",
      color: "#E6B85A",
      description: "Review Caribbean cruise options"
    },
    {
      id: "5",
      title: "Follow-up: Paris Booking",
      type: "follow-up",
      date: addHours(today, 72),
      startTime: "09:30",
      client: "David Martinez",
      status: "pending",
      color: "#F59E0B",
      description: "Confirm hotel reservations and flight details"
    },
    {
      id: "6",
      title: "Site Visit - Santorini Property",
      type: "trip",
      date: addHours(today, 168),
      startTime: "09:00",
      endTime: "18:00",
      location: "Santorini, Greece",
      status: "confirmed",
      color: "#2DBE60",
      description: "Inspect new luxury villa for portfolio"
    },
  ];
};

export default function CalendarPage() {
  const user = useAuthStore((s) => s.user);
  useRequireAnyPermission(["calendar:all"], "/agent");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [filterType, setFilterType] = useState<EventType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Charger les événements
  useEffect(() => {
    // TODO: Fetch real data from API
    setEvents(generateMockEvents());
  }, []);

  // Calculer les jours du mois pour la vue calendrier
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Événements filtrés
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesType = filterType === "all" || event.type === filterType;
      const matchesSearch = searchQuery === "" ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.client?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [events, filterType, searchQuery]);

  // Événements du jour sélectionné
  const selectedDayEvents = useMemo(() => {
    return filteredEvents
      .filter(event => isSameDay(event.date, selectedDate))
      .sort((a, b) => {
        if (!a.startTime || !b.startTime) return 0;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [filteredEvents, selectedDate]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const todayEvents = events.filter(e => isSameDay(e.date, now));
    const thisWeekEvents = events.filter(e => {
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      return e.date >= weekStart && e.date <= weekEnd;
    });
    const thisMonthEvents = events.filter(e => isSameMonth(e.date, now));
    const pendingEvents = events.filter(e => e.status === "pending");

    return {
      today: todayEvents.length,
      week: thisWeekEvents.length,
      month: thisMonthEvents.length,
      pending: pendingEvents.length,
    };
  }, [events]);

  // Obtenir les événements d'un jour spécifique
  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => isSameDay(event.date, day));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-20">
      {/* Header avec stats */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                Calendar
              </h1>
              <p className="text-sm text-slate-500 mt-1">Manage your schedule and client appointments</p>
            </div>
            <button
              onClick={() => setShowNewEvent(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
              <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
              <div className="text-xs text-blue-700/70 font-medium mt-1">Today</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
              <div className="text-2xl font-bold text-purple-600">{stats.week}</div>
              <div className="text-xs text-purple-700/70 font-medium mt-1">This Week</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200/50">
              <div className="text-2xl font-bold text-emerald-600">{stats.month}</div>
              <div className="text-xs text-emerald-700/70 font-medium mt-1">This Month</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4 border border-amber-200/50">
              <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
              <div className="text-xs text-amber-700/70 font-medium mt-1">Pending</div>
            </div>
          </div>
        </div>

        {/* Contrôles */}
        <div className="px-6 pb-4 flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events or clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as EventType | "all")}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {EVENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            {["month", "week", "day"].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === mode
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendrier principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header du mois */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 p-4 flex items-center justify-between">
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <h2 className="text-lg font-bold text-slate-900">
                  {format(currentDate, "MMMM yyyy")}
                </h2>
                <button
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Jours de la semaine */}
              <div className="grid grid-cols-7 gap-px bg-slate-200 border-b border-slate-200">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="bg-slate-50 py-2 text-center text-xs font-semibold text-slate-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille du calendrier */}
              <div className="grid grid-cols-7 gap-px bg-slate-200">
                {calendarDays.map((day, idx) => {
                  const dayEvents = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelected = isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        bg-white min-h-[100px] p-2 text-left hover:bg-slate-50 transition-colors relative
                        ${!isCurrentMonth ? "opacity-40" : ""}
                        ${isSelected ? "ring-2 ring-blue-500 ring-inset z-10" : ""}
                      `}
                    >
                      <div className={`
                        text-sm font-medium mb-1 inline-flex items-center justify-center
                        ${isTodayDate ? "w-6 h-6 rounded-full bg-blue-500 text-white" : "text-slate-700"}
                        ${isSelected && !isTodayDate ? "text-blue-600 font-bold" : ""}
                      `}>
                        {format(day, "d")}
                      </div>

                      {/* Event indicators */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className="text-xs px-1.5 py-0.5 rounded truncate"
                            style={{ backgroundColor: `${event.color}15`, color: event.color }}
                          >
                            {event.startTime} {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-slate-500 px-1.5">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar avec détails du jour */}
          <div className="space-y-4">
            {/* Date sélectionnée */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/30">
              <div className="text-sm font-medium opacity-90 mb-1">
                {format(selectedDate, "EEEE")}
              </div>
              <div className="text-3xl font-bold">
                {format(selectedDate, "d")}
              </div>
              <div className="text-sm opacity-90 mt-1">
                {format(selectedDate, "MMMM yyyy")}
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="text-sm font-medium">
                  {selectedDayEvents.length} {selectedDayEvents.length === 1 ? "event" : "events"}
                </div>
              </div>
            </div>

            {/* Events du jour */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900 text-sm">Schedule</h3>
              </div>
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {selectedDayEvents.length === 0 ? (
                  <div className="p-6 text-center">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No events scheduled</p>
                    <button
                      onClick={() => setShowNewEvent(true)}
                      className="mt-3 text-sm text-blue-600 font-medium hover:text-blue-700"
                    >
                      Add an event
                    </button>
                  </div>
                ) : (
                  selectedDayEvents.map(event => {
                    const EventIcon = EVENT_TYPES.find(t => t.value === event.type)?.icon || Clock;
                    return (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="w-full p-4 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${event.color}15` }}
                          >
                            <EventIcon className="w-5 h-5" style={{ color: event.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 text-sm truncate">
                              {event.title}
                            </div>
                            {event.startTime && (
                              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.startTime}
                                {event.endTime && ` - ${event.endTime}`}
                              </div>
                            )}
                            {event.client && (
                              <div className="text-xs text-slate-500 mt-1">
                                {event.client}
                              </div>
                            )}
                            <div className="mt-2">
                              <span className={`
                                inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium
                                ${event.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : ""}
                                ${event.status === "pending" ? "bg-amber-100 text-amber-700" : ""}
                                ${event.status === "completed" ? "bg-slate-100 text-slate-600" : ""}
                                ${event.status === "cancelled" ? "bg-red-100 text-red-700" : ""}
                              `}>
                                {event.status === "confirmed" && <CheckCircle2 className="w-3 h-3" />}
                                {event.status === "pending" && <Clock className="w-3 h-3" />}
                                {event.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h3 className="font-semibold text-slate-900 text-sm mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {EVENT_TYPES.slice(0, 4).map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setShowNewEvent(true)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${type.color}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: type.color }} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        Schedule {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900">{selectedEvent.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{format(selectedEvent.date, "EEEE, MMMM d, yyyy")}</p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedEvent.startTime && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-700">
                    {selectedEvent.startTime}
                    {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                  </span>
                </div>
              )}
              {selectedEvent.client && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-700">{selectedEvent.client}</span>
                </div>
              )}
              {selectedEvent.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-700">{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.description && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">{selectedEvent.description}</p>
                </div>
              )}
              <div className="pt-4 flex gap-2">
                <button className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors">
                  Edit Event
                </button>
                <button className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <MoreVertical className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Event Modal - Placeholder */}
      {showNewEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowNewEvent(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-bold text-lg text-slate-900">New Event</h3>
              <p className="text-sm text-slate-500 mt-1">Create a new calendar event</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 text-center py-8">
                Event creation form coming soon...
              </p>
              <button
                onClick={() => setShowNewEvent(false)}
                className="w-full bg-slate-100 text-slate-700 py-2.5 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
