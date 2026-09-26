export default function VehicleLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-4 w-32 bg-white/10 rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 aspect-[16/10] bg-white/5 rounded-2xl" />
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 w-2/3 bg-white/10 rounded" />
          <div className="h-4 w-1/3 bg-white/5 rounded" />
          <div className="h-10 w-1/2 bg-white/10 rounded" />
          <div className="h-12 w-full bg-white/5 rounded-full mt-4" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
