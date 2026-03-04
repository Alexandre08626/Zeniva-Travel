"use client";

export default function FlightsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center px-4">
      {/* Animated plane */}
      <div className="relative mb-10">
        <div className="text-7xl animate-bounce">✈️</div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-blue-200 rounded-full blur-sm animate-pulse" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Searching flights...</h2>
      <p className="text-slate-500 mb-10 text-center max-w-xs">
        We're scanning all available flights for the best prices. This takes a few seconds.
      </p>

      {/* Progress bar */}
      <div className="w-72 h-2 bg-slate-200 rounded-full overflow-hidden mb-10">
        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-[loading_2s_ease-in-out_infinite]" />
      </div>

      {/* Skeleton cards */}
      <div className="w-full max-w-2xl space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-pulse"
            style={{ opacity: 1 - i * 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                <div className="space-y-2">
                  <div className="w-32 h-3 bg-slate-200 rounded-full" />
                  <div className="w-20 h-2 bg-slate-100 rounded-full" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="w-20 h-4 bg-slate-200 rounded-full ml-auto" />
                <div className="w-16 h-2 bg-slate-100 rounded-full ml-auto" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="w-16 h-3 bg-slate-200 rounded-full" />
              <div className="flex-1 mx-4 h-px bg-slate-100" />
              <div className="w-16 h-3 bg-slate-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
