export default function ShowroomLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 animate-pulse">
      <div className="h-4 w-24 bg-white/10 rounded mb-4" />
      <div className="h-12 w-3/4 bg-white/10 rounded mb-3" />
      <div className="h-12 w-1/2 bg-white/10 rounded mb-8" />
      <div className="h-5 w-2/3 bg-white/5 rounded mb-10" />
      <div className="flex gap-3 mb-16">
        <div className="h-12 w-40 bg-white/10 rounded-full" />
        <div className="h-12 w-44 bg-white/5 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-white/10">
            <div className="aspect-[4/3] bg-white/5" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-2/3 bg-white/10 rounded" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
              <div className="h-6 w-1/2 bg-white/10 rounded mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
