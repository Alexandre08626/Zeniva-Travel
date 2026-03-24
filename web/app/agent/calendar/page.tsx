"use client";
import { useEffect, useState, useMemo } from "react";
import { useAuthStore, isHQ } from "../../../src/lib/authStore";
import { useRequireAnyPermission } from "../../../src/lib/roleGuards";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plane,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Hotel,
  Globe,
  DollarSign,
  AlertCircle,
  X,
  CalendarDays
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  parseISO,
  isWithinInterval,
  differenceInDays,
  addDays
} from "date-fns";

const AUTH = "Bearer zeniva-secret-2025";

type BookingStatus = "confirmed" | "pending_payment" | "upcoming" | "past" | "cancelled";

interface Booking {
  id: string;
  client_name: string;
  client_email?: string;
  destination: string;
  departure_date?: string;
  return_date?: string;
  travelers: number;
  total_price: number;
  currency: string;
  status: BookingStatus;
  notes?: string;
  created_at: string;
  hotel?: string;
}

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", color: "#2DBE60", bg: "#2DBE6015" },
  pending_payment: { label: "Pending", color: "#F59E0B", bg: "#F59E0B15" },
  upcoming: { label: "Upcoming", color: "#0F6CF5", bg: "#0F6CF515" },
  past: { label: "Past", color: "#94A3B8", bg: "#94A3B815" },
  cancelled: { label: "Cancelled", color: "#EF4444", bg: "#EF444415" },
};

// Destinations colors pour un affichage visuel varié
const DESTINATION_COLORS = [
  "#0F6CF5", "#2DBE60", "#E6B85A", "#8B5CF6", "#EC4899",
  "#06B6D4", "#F59E0B", "#EF4444", "#10B981", "#6366F1"
];

const getDestinationColor = (destination: string) => {
  const hash = destination.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DESTINATION_COLORS[hash % DESTINATION_COLORS.length];
};

export default function CalendarPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  useRequireAnyPermission(["calendar:all"], "/agent");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Charger les bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ path: "admin/bookings" });
        if (!hq && user?.email) params.append("agent_email", user.email);
        const r = await fetch(`/api/agents-proxy?${params}`, {
          headers: { Authorization: AUTH },
        });
        const data = await r.json();
        setBookings(data?.bookings || []);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      }
      setLoading(false);
    };
    fetchBookings();
  }, [user?.email, hq]);

  // Calculer les jours du mois
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Filtrer les bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
      const matchesSearch = searchQuery === "" ||
        booking.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [bookings, filterStatus, searchQuery]);

  // Bookings du jour sélectionné
  const selectedDayBookings = useMemo(() => {
    return filteredBookings.filter(booking => {
      if (!booking.departure_date) return false;
      const departure = parseISO(booking.departure_date);
      const returnDate = booking.return_date ? parseISO(booking.return_date) : departure;
      return isWithinInterval(selectedDate, { start: departure, end: returnDate });
    });
  }, [filteredBookings, selectedDate]);

  // Obtenir les bookings actifs pour un jour
  const getBookingsForDay = (day: Date) => {
    return filteredBookings.filter(booking => {
      if (!booking.departure_date) return false;
      const departure = parseISO(booking.departure_date);
      const returnDate = booking.return_date ? parseISO(booking.return_date) : departure;
      return isWithinInterval(day, { start: departure, end: returnDate });
    });
  };

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const activeToday = filteredBookings.filter(b => {
      if (!b.departure_date) return false;
      const dep = parseISO(b.departure_date);
      const ret = b.return_date ? parseISO(b.return_date) : dep;
      return isWithinInterval(now, { start: dep, end: ret });
    });

    const thisMonth = filteredBookings.filter(b => {
      if (!b.departure_date) return false;
      const dep = parseISO(b.departure_date);
      return isSameMonth(dep, now);
    });

    const confirmed = filteredBookings.filter(b => b.status === "confirmed");
    const pending = filteredBookings.filter(b => b.status === "pending_payment");

    return {
      activeToday: activeToday.length,
      thisMonth: thisMonth.length,
      confirmed: confirmed.length,
      pending: pending.length,
      totalRevenue: bookings.reduce((sum, b) => sum + b.total_price, 0),
    };
  }, [filteredBookings, bookings]);

  // Extraire l'hôtel des notes si présent
  const extractHotel = (booking: Booking): string => {
    if (booking.hotel) return booking.hotel;
    if (!booking.notes) return "";
    const hotelMatch = booking.notes.match(/hotel[:\s]+([^\n,]+)/i);
    if (hotelMatch) return hotelMatch[1].trim();
    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                Travel Calendar
              </h1>
              <p className="text-sm text-slate-500 mt-1">Track all client bookings and travel schedules</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Today
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
              <div className="text-2xl font-bold text-blue-600">{stats.activeToday}</div>
              <div className="text-xs text-blue-700/70 font-medium mt-1">Traveling Today</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
              <div className="text-2xl font-bold text-purple-600">{stats.thisMonth}</div>
              <div className="text-xs text-purple-700/70 font-medium mt-1">This Month</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200/50">
              <div className="text-2xl font-bold text-emerald-600">{stats.confirmed}</div>
              <div className="text-xs text-emerald-700/70 font-medium mt-1">Confirmed</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4 border border-amber-200/50">
              <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
              <div className="text-xs text-amber-700/70 font-medium mt-1">Pending</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200/50">
              <div className="text-2xl font-bold text-slate-900">${(stats.totalRevenue / 1000).toFixed(0)}k</div>
              <div className="text-xs text-slate-600/70 font-medium mt-1">Total Revenue</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search travelers, destinations, hotels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
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
                  const dayBookings = getBookingsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelected = isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        bg-white min-h-[110px] p-2 text-left hover:bg-slate-50 transition-colors relative
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

                      {/* Bookings indicators */}
                      <div className="space-y-1">
                        {dayBookings.slice(0, 3).map(booking => {
                          const color = getDestinationColor(booking.destination);
                          const hotel = extractHotel(booking);
                          return (
                            <div
                              key={booking.id}
                              className="text-xs px-1.5 py-1 rounded truncate font-medium cursor-pointer hover:opacity-80"
                              style={{ backgroundColor: `${color}15`, color }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBooking(booking);
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <Plane className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{booking.client_name}</span>
                              </div>
                              <div className="text-[10px] opacity-75 truncate">
                                {booking.destination}
                              </div>
                            </div>
                          );
                        })}
                        {dayBookings.length > 3 && (
                          <div className="text-xs text-slate-500 px-1.5 font-medium">
                            +{dayBookings.length - 3} more
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
              <div className="text-4xl font-bold">
                {format(selectedDate, "d")}
              </div>
              <div className="text-sm opacity-90 mt-1">
                {format(selectedDate, "MMMM yyyy")}
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{selectedDayBookings.length}</div>
                  <div className="text-xs opacity-90">Active bookings</div>
                </div>
                <Plane className="w-8 h-8 opacity-50" />
              </div>
            </div>

            {/* Bookings du jour */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900 text-sm">Active Travelers</h3>
              </div>
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {selectedDayBookings.length === 0 ? (
                  <div className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No active bookings</p>
                    <p className="text-xs text-slate-400 mt-1">Select another date</p>
                  </div>
                ) : (
                  selectedDayBookings.map(booking => {
                    const color = getDestinationColor(booking.destination);
                    const hotel = extractHotel(booking);
                    const statusCfg = STATUS_CONFIG[booking.status];
                    const departure = booking.departure_date ? parseISO(booking.departure_date) : null;
                    const returnDate = booking.return_date ? parseISO(booking.return_date) : departure;
                    const daysTotal = departure && returnDate ? differenceInDays(returnDate, departure) + 1 : 0;

                    return (
                      <button
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className="w-full p-4 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg"
                            style={{ backgroundColor: `${color}20`, color }}
                          >
                            {booking.client_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 text-sm">
                              {booking.client_name}
                            </div>
                            <div className="flex items-center gap-1 text-sm mt-1" style={{ color }}>
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="font-medium">{booking.destination}</span>
                            </div>
                            {hotel && (
                              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                <Hotel className="w-3 h-3" />
                                {hotel}
                              </div>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              <div className="flex items-center gap-1 text-slate-500">
                                <Users className="w-3 h-3" />
                                {booking.travelers} travelers
                              </div>
                              <div className="flex items-center gap-1 text-slate-500">
                                <CalendarDays className="w-3 h-3" />
                                {daysTotal} days
                              </div>
                            </div>
                            <div className="mt-2">
                              <span
                                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                              >
                                {booking.status === "confirmed" && <CheckCircle2 className="w-3 h-3" />}
                                {booking.status === "pending_payment" && <Clock className="w-3 h-3" />}
                                {statusCfg.label}
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
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 z-10">
              <div className="p-6 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                      style={{
                        backgroundColor: `${getDestinationColor(selectedBooking.destination)}20`,
                        color: getDestinationColor(selectedBooking.destination)
                      }}
                    >
                      {selectedBooking.client_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{selectedBooking.client_name}</h3>
                      <p className="text-sm text-slate-500">{selectedBooking.client_email}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Destination */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <Globe className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <div className="text-xs text-blue-600 font-medium mb-0.5">Destination</div>
                  <div className="text-lg font-bold text-blue-900">{selectedBooking.destination}</div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium mb-1">Departure</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {selectedBooking.departure_date ? format(parseISO(selectedBooking.departure_date), "MMM d, yyyy") : "—"}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium mb-1">Return</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {selectedBooking.return_date ? format(parseISO(selectedBooking.return_date), "MMM d, yyyy") : "—"}
                  </div>
                </div>
              </div>

              {/* Hotel */}
              {extractHotel(selectedBooking) && (
                <div className="flex items-center gap-3">
                  <Hotel className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-xs text-slate-500">Hotel</div>
                    <div className="text-sm font-medium text-slate-700">{extractHotel(selectedBooking)}</div>
                  </div>
                </div>
              )}

              {/* Travelers */}
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-xs text-slate-500">Travelers</div>
                  <div className="text-sm font-medium text-slate-700">{selectedBooking.travelers} travelers</div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-xs text-slate-500">Total Price</div>
                  <div className="text-sm font-medium text-slate-700">
                    {selectedBooking.currency} ${selectedBooking.total_price.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-xs text-slate-500">Status</div>
                  <span
                    className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full font-medium mt-1"
                    style={{
                      backgroundColor: STATUS_CONFIG[selectedBooking.status].bg,
                      color: STATUS_CONFIG[selectedBooking.status].color
                    }}
                  >
                    {STATUS_CONFIG[selectedBooking.status].label}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="text-xs text-slate-500 font-medium mb-2">Notes</div>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              <div className="pt-4 flex gap-2">
                <button className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors">
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading bookings...</p>
          </div>
        </div>
      )}
    </div>
  );
}
