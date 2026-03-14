import Link from "next/link";

export default function ExcursionsSearchPage({ searchParams }: { searchParams: any }) {
  return (
    <main className="min-h-screen p-10 bg-slate-50">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-4">Excursions Search Results (placeholder)</h1>
        <pre className="text-sm bg-slate-100 p-4 rounded">{JSON.stringify(searchParams, null, 2)}</pre>
        <div className="mt-4">
          <Link href={`/chat?prompt=${encodeURIComponent("Please continue and refine these excursion options.")}`} className="inline-block rounded-full px-4 py-2 bg-blue-600 text-white">Continue with Lina</Link>
        </div>
      </div>
    </main>
  );
}
