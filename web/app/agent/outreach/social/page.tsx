"use client";

export default function SocialPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900">Social Media</h2>
        <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700">
          + New Post
        </button>
      </div>

      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
        <div className="text-4xl mb-3">{"\ud83d\udcf1"}</div>
        <p className="text-lg font-semibold text-slate-700">Social Media Scheduler</p>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Plan, schedule, and publish content across TikTok, Instagram, Facebook, and LinkedIn. Manage your social presence from one place.
        </p>
        <p className="text-xs text-slate-400 mt-4">Coming soon</p>
      </div>
    </div>
  );
}
