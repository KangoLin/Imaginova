export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded-md bg-muted ${className}`} style={{ backgroundImage: "linear-gradient(90deg, var(--muted) 25%, color-mix(in oklch, var(--muted) 70%, var(--muted-foreground)) 50%, var(--muted) 75%)", backgroundSize: "200% 100%", animation: "shimmer 2s linear infinite" }} />;
}

export function CardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Skeleton className="w-full h-48 rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
