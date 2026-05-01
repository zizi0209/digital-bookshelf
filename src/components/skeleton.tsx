export function BookSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-10 justify-center max-w-[1200px] mx-auto py-10">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-[130px] h-[185px] bg-[#fdfaf6]/6 animate-pulse-soft rounded-md" />
        </div>
      ))}
    </div>
  );
}
