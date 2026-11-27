interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({
  className = '',
}: LoadingSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-elevated ${className}`}
    />
  );
}