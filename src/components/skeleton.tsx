export function BookSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12 max-w-7xl mx-auto">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-32 md:w-40 h-48 md:h-60 bg-[#e5e0d5] animate-pulse-soft rounded-r-sm border border-[#dcd7cc]" />
          <div className="h-4 bg-[#e5e0d5] mt-2 w-24 rounded animate-pulse-soft" />
        </div>
      ))}
    </div>
  );
}
