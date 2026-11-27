import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';

interface GameImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

export function GameImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
}: GameImageProps) {
  const [failedSrc, setFailedSrc] =
    useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-elevated ${className}`}
      >
        <Gamepad2
          size={48}
          className="accent-text opacity-40"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
}