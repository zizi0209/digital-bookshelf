export function BookSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-8 justify-center max-w-7xl mx-auto py-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-[120px] h-[170px] bg-[#3d2b1f]/8 animate-pulse-soft rounded-md" />
        </div>
      ))}
    </div>
  );
}
