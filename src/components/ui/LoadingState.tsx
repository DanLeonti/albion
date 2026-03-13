export default function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-400">{message}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-800 rounded mb-2"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 bg-gray-800/50 rounded mb-1"></div>
      ))}
    </div>
  );
}
